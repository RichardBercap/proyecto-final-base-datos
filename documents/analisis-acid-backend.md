# Analisis ACID del backend

## 1. Estructura revisada

El proyecto esta organizado en dos aplicaciones principales:

- `backend/`: API REST en Node.js/Express.
- `frontend/`: cliente web en Vue/Vite.
- `models-http/`: scripts HTTP para crear indices, cargar datos y ejecutar consultas en Elasticsearch.
- `docker-compose.yml`: define Elasticsearch y Kibana.
- `docs/`: documentacion existente del proyecto.

El backend expone rutas para peliculas, clientes, copias fisicas, prestamos, configuraciones y salud del servicio. La aplicacion principal registra esas rutas en `backend/src/app.js`:

- `/api/peliculas`
- `/api/clientes`
- `/api/copias`
- `/api/prestamos`
- `/api/configuraciones`
- `/health`

La capa de persistencia esta centralizada en `backend/src/services/elasticsearch.service.js`. Ese servicio usa el cliente oficial de Elasticsearch, realiza busquedas, obtiene documentos por id, crea documentos con `index` y actualiza documentos con `update`.

## 2. Veredicto general

El backend no implementa transacciones ACID estrictas a nivel multi-documento o multi-indice, porque Elasticsearch no se usa aqui como un motor transaccional relacional con `BEGIN`, `COMMIT` y `ROLLBACK`.

Sin embargo, el codigo si cumple parcialmente las propiedades ACID en operaciones de un solo documento y aplica mecanismos adicionales para reducir inconsistencias en operaciones criticas, especialmente al crear prestamos:

- Usa escrituras atomicas por documento de Elasticsearch.
- Usa `refresh: true` para que las escrituras sean visibles inmediatamente despues de ejecutarse.
- Usa control de concurrencia optimista con `if_seq_no` e `if_primary_term` al reservar copias para prestamos.
- Valida reglas de negocio antes de escribir.
- Aplica una compensacion manual para liberar copias si falla la creacion de un prestamo.

Por tanto, la conclusion correcta es: cumple ACID de forma parcial y operativa, pero no garantiza ACID completo para flujos que modifican varios documentos.

## 3. Atomicidad

### Como se cumple parcialmente

Las operaciones simples de creacion y actualizacion delegan una sola escritura a Elasticsearch:

- `createDocument` ejecuta `elasticsearch.index` sobre un indice y un id.
- `updateDocument` ejecuta `elasticsearch.update` sobre un indice y un id.

Estas operaciones son atomicas a nivel de documento: una actualizacion individual queda aplicada o falla.

Evidencia:

- `backend/src/services/elasticsearch.service.js`, lineas 54-60: creacion de documentos con `elasticsearch.index`.
- `backend/src/services/elasticsearch.service.js`, lineas 68-75: actualizacion de documentos con `elasticsearch.update`.

El flujo de creacion de prestamos intenta simular atomicidad de negocio. Primero reserva cada copia y luego crea el documento del prestamo. Si algo falla, ejecuta `releaseReservedCopies` para revertir las copias que ya habia reservado.

Evidencia:

- `backend/src/controllers/prestamos.controller.js`, lineas 72-85: reserva atomica de una copia con `update`.
- `backend/src/controllers/prestamos.controller.js`, lineas 95-119: liberacion compensatoria de copias reservadas.
- `backend/src/controllers/prestamos.controller.js`, lineas 231-245: bloque `try/catch` que reserva copias, crea el prestamo y libera reservas si ocurre un error.

### Limites encontrados

No existe una transaccion real que agrupe todas las reservas de copias y la creacion del prestamo como una unica unidad indivisible. Si el proceso se cae despues de reservar copias pero antes de crear el prestamo, la compensacion podria no ejecutarse.

Tambien hay flujos multi-documento sin compensacion completa. En la devolucion de un prestamo, primero se marca el prestamo como `devuelto` y despues se liberan las copias. Si falla la liberacion de copias, el sistema puede quedar con prestamo devuelto pero copias aun marcadas como prestadas.

Evidencia:

- `backend/src/controllers/prestamos.controller.js`, lineas 262-267: actualiza el prestamo como devuelto.
- `backend/src/controllers/prestamos.controller.js`, lineas 269-286: despues actualiza las copias relacionadas.

## 4. Consistencia

### Como se cumple parcialmente

La consistencia se refuerza con validaciones de negocio antes de escribir:

- Un prestamo exige `cliente_id`.
- `duracion_dias` debe ser entero y mayor o igual a 1.
- No se aceptan copias repetidas.
- El cliente debe estar activo.
- La duracion no puede superar la configuracion activa.
- Todas las copias deben estar disponibles antes de reservarlas.
- La tarifa debe existir para la duracion solicitada.

Evidencia:

- `backend/src/controllers/prestamos.controller.js`, lineas 58-69: normaliza y valida ids de copias.
- `backend/src/controllers/prestamos.controller.js`, lineas 139-145: valida cliente y duracion.
- `backend/src/controllers/prestamos.controller.js`, lineas 152-162: valida estado del cliente y maximo de dias permitido.
- `backend/src/controllers/prestamos.controller.js`, lineas 170-178: rechaza copias no disponibles.
- `backend/src/controllers/prestamos.controller.js`, lineas 38-46: exige tarifa configurada para la duracion.

Tambien se conserva consistencia economica dentro del documento de prestamo. El backend calcula subtotal, descuento y total antes de almacenar el prestamo.

Evidencia:

- `backend/src/controllers/prestamos.controller.js`, lineas 183-188: calculo de tarifa, subtotal, descuento y total.
- `backend/src/controllers/prestamos.controller.js`, lineas 213-223: persistencia de cantidades, importes y factura.

Ademas, los indices se definen con `dynamic: "strict"` y tipos explicitos en `models-http/01_crear_indices.http`. Esto impide que Elasticsearch acepte campos no definidos en el mapeo, reduciendo documentos mal formados.

Evidencia:

- `models-http/01_crear_indices.http`: los indices `peliculas`, `copias`, `clientes`, `configuraciones` y `prestamos` definen mappings estrictos y tipos concretos.

### Limites encontrados

La consistencia depende principalmente del backend. No hay restricciones declarativas equivalentes a claves foraneas, unicidad global o checks relacionales dentro de Elasticsearch.

Ejemplos:

- Elasticsearch no impide por si mismo que una copia apunte a una pelicula inexistente.
- La creacion de configuracion activa desactiva configuraciones anteriores y luego crea una nueva, pero no hay transaccion que garantice que siempre exista exactamente una configuracion activa.
- Algunas actualizaciones aceptan campos del cuerpo directamente, por lo que la integridad semantica depende del mapeo y de validaciones puntuales.

Evidencia:

- `backend/src/controllers/configuraciones.controller.js`, lineas 34-48: desactiva configuraciones activas anteriores.
- `backend/src/controllers/configuraciones.controller.js`, lineas 73-74: crea la nueva configuracion despues de desactivar las anteriores.
- `backend/src/controllers/clientes.controller.js`, lineas 48-52: actualiza cliente mezclando el cuerpo recibido.
- `backend/src/controllers/peliculas.controller.js`, lineas 80-84: actualiza pelicula mezclando el cuerpo recibido.

## 5. Aislamiento

### Como se cumple parcialmente

El punto mas fuerte de aislamiento esta en la reserva de copias para prestamos. Antes de reservar, el backend lee cada copia con `seq_no_primary_term: true`; luego actualiza cada copia usando `if_seq_no` e `if_primary_term`. Esto implementa control de concurrencia optimista: si otra operacion modifico la copia entre la lectura y la escritura, Elasticsearch responde conflicto 409 y el backend rechaza la operacion.

Evidencia:

- `backend/src/services/elasticsearch.service.js`, lineas 38-44: obtiene documentos con `seq_no_primary_term`.
- `backend/src/controllers/prestamos.controller.js`, lineas 72-85: actualiza copias con `if_seq_no` e `if_primary_term`.
- `backend/src/controllers/prestamos.controller.js`, lineas 86-89: convierte conflictos de version en error HTTP 409.

El servicio comun de actualizacion usa `retry_on_conflict: 3`, lo que ayuda en actualizaciones concurrentes simples.

Evidencia:

- `backend/src/services/elasticsearch.service.js`, lineas 68-75: actualizacion con `retry_on_conflict`.

### Limites encontrados

El aislamiento no es serializable para operaciones completas de negocio. Dos solicitudes concurrentes pueden intercalarse entre varios documentos. El caso de reservar copias esta protegido mejor que otros flujos, pero no existe bloqueo o transaccion global sobre `prestamos` y `copias`.

Ademas, `retry_on_conflict` no equivale a aislamiento transaccional; solo reintenta una actualizacion de documento cuando hay conflicto de version.

La activacion de configuraciones tambien puede sufrir carreras: dos peticiones concurrentes podrian desactivar configuraciones activas y crear nuevas configuraciones activas sin una garantia transaccional global.

Evidencia:

- `backend/src/controllers/configuraciones.controller.js`, lineas 34-48: lectura y desactivacion de configuraciones activas.
- `backend/src/controllers/configuraciones.controller.js`, lineas 73-74: creacion posterior de la nueva configuracion.

## 6. Durabilidad

### Como se cumple parcialmente

Elasticsearch persiste los documentos en disco y el `docker-compose.yml` configura un volumen llamado `elasticsearch_data` para conservar los datos del contenedor.

Evidencia:

- `docker-compose.yml`, lineas 11-12: volumen montado en `/usr/share/elasticsearch/data`.
- `docker-compose.yml`, lineas 25-26: declaracion del volumen `elasticsearch_data`.

El backend ademas usa `refresh: true` en creaciones y actualizaciones. Esto no es exactamente una garantia de durabilidad, pero si garantiza que el dato quede disponible para busqueda inmediatamente despues de la escritura exitosa.

Evidencia:

- `backend/src/services/elasticsearch.service.js`, lineas 54-60: creacion con `refresh: true`.
- `backend/src/services/elasticsearch.service.js`, lineas 68-75: actualizacion con `refresh: true`.
- `backend/src/controllers/prestamos.controller.js`, lineas 72-85: reserva de copia con `refresh: true`.

### Limites encontrados

El entorno definido es de un solo nodo y sin replicas:

- `discovery.type=single-node`
- `number_of_replicas: 0` en los indices

Esto es aceptable para desarrollo o demostracion, pero reduce la tolerancia a fallos. Si el nodo o el volumen se pierde, no hay replica configurada dentro del cluster que permita recuperacion automatica.

Evidencia:

- `docker-compose.yml`, lineas 6-8: Elasticsearch en modo single-node.
- `models-http/01_crear_indices.http`: los indices se crean con `number_of_replicas: 0`.

## 7. Evaluacion por propiedad

| Propiedad | Estado en el proyecto | Justificacion |
| --- | --- | --- |
| Atomicidad | Parcial | Escrituras atomicas por documento; compensacion manual al crear prestamos; sin transaccion multi-documento real. |
| Consistencia | Parcial/alta a nivel de reglas del backend | Validaciones de negocio, mappings estrictos y calculos centralizados; sin claves foraneas ni checks transaccionales en la base. |
| Aislamiento | Parcial | Control optimista fuerte al reservar copias; sin serializacion global de flujos multi-documento. |
| Durabilidad | Parcial/adecuada para entorno local | Persistencia en volumen Docker; sin replicas ni alta disponibilidad. |

## 8. Conclusion

El backend esta bien orientado para mantener integridad operativa en un sistema de prestamos basado en Elasticsearch. La parte mas solida es la creacion de prestamos, donde se combinan validaciones, control optimista de concurrencia y compensacion ante fallos.

No obstante, el sistema no puede declararse plenamente ACID en sentido estricto porque no hay transacciones reales entre documentos o indices. La garantia mas precisa es:

> El proyecto cumple ACID parcialmente a nivel de documento y aplica controles de consistencia de negocio en el backend, pero no ofrece atomicidad ni aislamiento transaccional completo para operaciones multi-documento.

## 9. Recomendaciones

Para acercar el sistema a garantias ACID mas fuertes:

1. Implementar una estrategia de saga/outbox para operaciones multi-documento como creacion y devolucion de prestamos.
2. Agregar jobs de reconciliacion que detecten copias `prestada` sin prestamo activo o prestamos `devuelto` con copias aun prestadas.
3. Usar scripts condicionales tambien al devolver copias, verificando que `prestamo_actual_id` corresponda al prestamo que se esta cerrando.
4. Evitar cambios concurrentes ambiguos en configuraciones activas mediante un documento unico de control o versionado con control optimista.
5. Para produccion, configurar replicas, snapshots y politicas de respaldo en Elasticsearch.
