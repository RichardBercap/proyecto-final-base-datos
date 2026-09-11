# Puntos para explicar en la exposicion - Elasticsearch

## 1. Contexto del sistema

El proyecto implementa un sistema para un club de videos administrado por el propietario. La base de datos usada es Elasticsearch y el sistema permite gestionar peliculas, copias fisicas, clientes, prestamos, facturas, tarifas y descuentos.

La aplicacion esta separada en:

- Backend Node.js con Express.
- Frontend Vue 3 con TypeScript.
- Base de datos Elasticsearch.

El backend consume Elasticsearch mediante el cliente oficial y expone una API REST para que el frontend no acceda directamente a la base de datos.

## 2. Por que Elasticsearch

Elasticsearch es un motor orientado a documentos JSON. Es adecuado para este proyecto porque el sistema necesita buscar peliculas por varios criterios:

- Titulo principal.
- Titulos alternativos.
- Genero.
- Actores principales.
- Nominaciones o premios Oscar.

Tambien permite guardar documentos con estructuras anidadas, por ejemplo datos de Oscars, direccion geolocalizada, items de un prestamo y reglas de configuracion.

## 3. Modelo de base de datos

El sistema usa cinco indices principales:

| Indice | Documento | Finalidad |
|---|---|---|
| `peliculas` | Una pelicula | Catalogo y busqueda textual |
| `copias` | Un DVD fisico | Estado individual de cada copia |
| `clientes` | Un cliente | Datos personales, direccion y bloqueo |
| `prestamos` | Un prestamo/factura | Registro historico del alquiler |
| `configuraciones` | Reglas versionadas | Tarifas, descuentos y maximo de dias |

La decision mas importante es separar `peliculas` de `copias`. Una pelicula representa la informacion del catalogo, mientras que cada copia fisica tiene su propio estado: `disponible`, `prestada` o `baja`.

## 4. Indice `peliculas`

Este indice guarda la informacion principal del video:

- Duracion en minutos.
- Genero.
- Titulo principal.
- Titulos alternativos.
- Año de publicacion.
- Nominaciones y premios Oscar ganados.
- Actores principales.
- Costo unitario.
- Unidades adquiridas.
- URL opcional de portada mediante `poster_url`.

Se usa analizador `spanish` para campos de texto, lo que mejora la busqueda en español. Tambien se usan subcampos `.raw` para ordenamiento y busquedas exactas.

## 5. Indice `copias`

Este indice representa cada DVD fisico. Es necesario porque una misma pelicula puede tener varias unidades, y cada unidad puede estar en un estado distinto.

Campos importantes:

- `copia_id`.
- `codigo_interno`.
- `pelicula_id`.
- Datos resumidos de la pelicula.
- Fecha y costo de adquisicion.
- Estado de la copia.
- Prestamo actual, si esta prestada.
- Datos de baja, si fue retirada.

Esto permite saber exactamente que copia esta disponible, prestada o dada de baja.

## 6. Indice `clientes`

Guarda la informacion del cliente:

- Nombre completo.
- Telefono celular.
- Correo electronico.
- Fecha de nacimiento.
- Direccion textual.
- Ciudad y zona.
- Geolocalizacion con `geo_point`.
- Fecha de registro.
- Estado del cliente.
- Bloqueo actual.
- Historial de bloqueos.

La geolocalizacion permite demostrar una capacidad propia de Elasticsearch: consultas por distancia geografica.

## 7. Indice `prestamos`

Este indice guarda el prestamo y tambien la factura generada.

Campos importantes:

- Cliente asociado.
- Snapshot de datos del cliente.
- Fecha de prestamo.
- Fecha de devolucion prevista.
- Fecha de devolucion real.
- Duracion en dias.
- Estado del prestamo.
- Items prestados.
- Subtotal.
- Descuento.
- Total.
- Factura.

Se guarda una copia historica de datos del cliente, peliculas, tarifas y descuentos. Esto es importante porque si despues cambia el nombre del cliente, el precio o el titulo de una pelicula, la factura historica no debe cambiar.

## 8. Indice `configuraciones`

Este indice guarda reglas versionadas del negocio:

- Tarifas por cantidad de dias.
- Maximo de dias permitidos para un prestamo.
- Descuentos por cantidad de peliculas.
- Moneda.
- Version.
- Estado activo.

Cuando se crea una nueva configuracion activa, el backend desactiva las anteriores. El prestamo guarda la version usada para poder justificar historicamente como se calculo el importe.

## 9. Uso de `dynamic: strict`

Los mappings usan `dynamic: strict`. Esto significa que Elasticsearch rechaza documentos que intenten guardar campos no definidos.

Ventajas:

- Evita errores por campos mal escritos.
- Mantiene documentos consistentes.
- Hace que el modelo sea mas controlado.
- Ayuda a explicar consistencia en la base de datos.

Ejemplo: si se intenta guardar `tituloo` en vez de `titulo`, Elasticsearch rechaza el documento.

## 10. Busqueda de peliculas

El backend implementa busqueda con `multi_match`. La busqueda revisa:

- `titulo`.
- `titulos_alternativos`.
- `genero`.
- `actores_principales`.
- `oscars.nominaciones`.
- `oscars.ganados`.

Algunos campos tienen mayor peso, por ejemplo el titulo tiene mas importancia que otros campos. Esto permite resultados mas relevantes.

## 11. Gestion de prestamos

Para crear un prestamo el backend realiza estos pasos:

1. Valida que exista `cliente_id`.
2. Valida que `duracion_dias` sea entero y mayor a cero.
3. Obtiene el cliente.
4. Obtiene la configuracion activa.
5. Rechaza clientes bloqueados o no activos.
6. Valida que la duracion no supere el maximo configurado.
7. Obtiene las copias solicitadas.
8. Verifica que todas esten disponibles.
9. Calcula tarifa, subtotal, descuento y total.
10. Reserva las copias.
11. Crea el documento del prestamo.
12. Devuelve la factura generada.

## 12. Atomicidad

Elasticsearch no ofrece transacciones ACID entre varios documentos o indices como una base relacional tradicional.

En este sistema, crear un prestamo afecta:

- El indice `prestamos`.
- Varias copias dentro del indice `copias`.

Por eso el backend implementa una operacion coordinada:

- Primero valida todos los datos.
- Luego reserva las copias.
- Despues crea el prestamo.
- Si algo falla, libera las copias ya reservadas.

Esto no es una transaccion ACID completa, pero es una estrategia de compensacion para mantener el sistema consistente.

## 13. Consistencia

La consistencia se mantiene con varias reglas:

- Un cliente bloqueado no puede alquilar.
- No se aceptan copias repetidas en un mismo prestamo.
- Solo se pueden prestar copias con estado `disponible`.
- No se permiten prestamos mayores al maximo configurado.
- La tarifa debe existir en la configuracion activa.
- Los importes se calculan en backend, no en frontend.
- Los mappings estrictos evitan datos inesperados.

El frontend calcula una vista previa del precio, pero el valor definitivo se calcula y guarda en backend.

## 14. Aislamiento

El problema principal de aislamiento es evitar que dos prestamos tomen la misma copia al mismo tiempo.

Para resolverlo, el backend usa concurrencia optimista:

- Lee la copia con `_seq_no` y `_primary_term`.
- Actualiza la copia usando `if_seq_no` y `if_primary_term`.
- Si otra operacion modifico la copia antes, Elasticsearch responde conflicto `409`.
- El backend cancela el prestamo y libera cualquier copia que ya hubiera reservado.

Esto permite explicar como se evita doble prestamo de una misma copia.

## 15. Durabilidad

Cuando Elasticsearch confirma una escritura, el documento queda almacenado en el indice. En el proyecto se usa `refresh: true` en escrituras importantes para que los cambios sean visibles inmediatamente despues de guardar.

La durabilidad se puede explicar asi:

- Las peliculas, clientes, copias, configuraciones y prestamos quedan persistidos en Elasticsearch.
- Los prestamos guardan informacion historica para no depender de cambios futuros.
- Las configuraciones versionadas permiten saber que reglas se aplicaron en cada prestamo.

## 16. Transacciones

Elasticsearch no maneja transacciones multi-documento como SQL. Por eso el sistema no puede garantizar una transaccion ACID completa entre `prestamos` y `copias`.

La solucion aplicada es una transaccion logica desde backend:

1. Validar.
2. Reservar con control de version.
3. Crear prestamo.
4. Compensar si ocurre error.

Esto debe explicarse como una limitacion del motor y una decision de diseño.

## 17. Bloqueos

En este proyecto hay dos tipos de bloqueo a explicar:

### Bloqueo de clientes

Un cliente puede quedar con estado `bloqueado`. El backend guarda:

- Fecha del bloqueo.
- Razon.
- Detalle.
- Historial de bloqueos.

Cuando un cliente esta bloqueado, el backend rechaza nuevos prestamos.

### Bloqueo/concurrencia de copias

No se usa bloqueo pesimista tradicional. Se usa concurrencia optimista de Elasticsearch:

- No se bloquea el documento mientras se lee.
- Se intenta actualizar solo si nadie lo modifico.
- Si hubo cambio, se rechaza la operacion.

Esto es importante para explicar aislamiento y conflictos concurrentes.

## 18. Frontend

El frontend permite demostrar todos los casos funcionales:

- Dashboard con metricas.
- Lista y busqueda de peliculas.
- Registro y edicion de peliculas.
- URL opcional de portada.
- Catalogo publico para clientes.
- Registro de nuevas copias.
- Baja de copias con razon.
- Registro y edicion de clientes.
- Bloqueo de clientes con razon.
- Wizard de prestamos.
- Calculo visual de tarifa, descuento y total.
- Fecha de devolucion prevista.
- Vista de factura.
- Devolucion de prestamos.
- Configuracion de tarifas y descuentos.

El loader global mejora la experiencia visual al realizar solicitudes al backend.

## 19. Puntos fuertes para destacar

- Modelo orientado a documentos bien separado por indices.
- Uso de busqueda textual con relevancia.
- Uso de geolocalizacion en clientes.
- Uso de nested para items de prestamos y reglas.
- Configuraciones versionadas.
- Facturas historicas inmutables en cuanto a precio y datos usados.
- Control de concurrencia optimista para evitar doble prestamo.
- Compensacion si falla una operacion coordinada.
- Frontend moderno conectado al backend real.

## 20. Cinco problemas complejos y como se resolvieron

### 1. Separar peliculas de copias

Problema: una pelicula puede tener varias unidades fisicas con estados distintos.

Solucion: crear indice `peliculas` para el catalogo e indice `copias` para cada DVD fisico.

### 2. Evitar prestar una copia no disponible

Problema: una copia podria estar prestada o dada de baja.

Solucion: antes de crear el prestamo, el backend valida que todas las copias tengan estado `disponible`.

### 3. Evitar dos prestamos simultaneos sobre la misma copia

Problema: dos usuarios podrian intentar alquilar la misma copia al mismo tiempo.

Solucion: usar concurrencia optimista con `_seq_no`, `_primary_term`, `if_seq_no` e `if_primary_term`.

### 4. Mantener factura historica aunque cambien datos despues

Problema: si cambia el cliente, pelicula o tarifa, una factura antigua no debe cambiar.

Solucion: el prestamo guarda snapshots del cliente, peliculas, configuracion, subtotal, descuento y total.

### 5. Cambiar tarifas sin afectar prestamos antiguos

Problema: el propietario puede modificar costos y descuentos, pero los prestamos pasados deben conservar sus reglas.

Solucion: usar configuraciones versionadas y guardar `configuracion_version` en cada prestamo.

## 21. Flujo recomendado para la demostracion

1. Mostrar los indices en Kibana.
2. Mostrar el mapping de `peliculas`, `copias`, `clientes`, `prestamos` y `configuraciones`.
3. Mostrar busqueda de pelicula por texto.
4. Crear una pelicula desde frontend.
5. Registrar una copia.
6. Crear un cliente.
7. Bloquear un cliente y mostrar que no puede alquilar.
8. Crear un prestamo con cliente activo.
9. Mostrar calculo de precio y descuento.
10. Mostrar factura generada.
11. Devolver prestamo.
12. Dar de baja una copia con razon.
13. Explicar concurrencia optimista y compensacion.

## 22. Frase clave para defender el diseño

Elasticsearch no se usa como una base relacional tradicional, sino como una base documental optimizada para busqueda. Por eso el sistema guarda documentos con informacion denormalizada e historica, usa mappings estrictos para consistencia, y aplica desde backend las reglas de negocio, concurrencia optimista y compensacion para cubrir los escenarios criticos del club de videos.
