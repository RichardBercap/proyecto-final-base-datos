# Guion para video de evaluacion - Inciso a

Duracion objetivo: 5 minutos.

Tema de la rubrica: explicar como funciona la base de datos respecto a atomicidad, consistencia, aislamiento, durabilidad, transacciones y bloqueos.

## 1. Preparacion antes de grabar

Tener abiertos:

- Frontend del sistema en el navegador.
- Backend ejecutandose.
- Elasticsearch/Kibana o las peticiones HTTP de `models-http`.
- Codigo del backend en `backend/src/controllers/prestamos.controller.js`.
- Codigo comun de Elasticsearch en `backend/src/services/elasticsearch.service.js`.
- Archivo de indices `models-http/01_crear_indices.http`.

Datos que conviene tener listos:

- Una pelicula con copias disponibles.
- Un cliente activo.
- Un cliente bloqueado.
- Una configuracion activa con tarifas, descuentos y generos.
- Un prestamo ya creado para mostrar factura y devolucion.

## 2. Estructura sugerida del video

### 0:00 - 0:30 | Introduccion

Que decir:

> En este proyecto se implemento un sistema para un club de videos usando Elasticsearch como base de datos documental. La aplicacion permite gestionar peliculas, copias fisicas, clientes, prestamos, facturas, tarifas, descuentos y configuraciones del negocio. En este video voy a explicar como se manejan las propiedades ACID, las transacciones y los bloqueos dentro de este modelo.

Que mostrar:

- Pantalla principal o dashboard del frontend.
- Lista de peliculas.
- Mencionar que el backend es Node.js/Express y que la persistencia se hace en Elasticsearch.

Punto clave:

- No presentar Elasticsearch como una base relacional tradicional.
- Aclarar desde el inicio que el sistema usa documentos e indices.

## 3. Atomicidad

### 0:30 - 1:15

Que decir:

> La atomicidad significa que una operacion debe completarse totalmente o no aplicarse. En Elasticsearch, las escrituras son atomicas a nivel de documento. Por ejemplo, crear o actualizar una pelicula, cliente o copia se hace con una sola operacion sobre un documento.

> En el caso mas complejo, que es crear un prestamo, se afectan varios documentos: el prestamo y las copias fisicas. Como Elasticsearch no maneja una transaccion multi-documento como SQL, el backend implementa una atomicidad logica. Primero valida todo, luego reserva las copias y despues crea el prestamo. Si algo falla, libera las copias ya reservadas.

Que mostrar:

- Abrir `backend/src/services/elasticsearch.service.js`.
- Mostrar `createDocument` y `updateDocument`.
- Abrir `backend/src/controllers/prestamos.controller.js`.
- Mostrar el bloque donde reserva copias, crea el prestamo y en el `catch` llama a `releaseReservedCopies`.

Demo opcional:

- Crear un prestamo desde el frontend.
- Mostrar que las copias pasan de `disponible` a `prestada`.
- Mostrar el prestamo creado con sus items.

Frase clave:

> La atomicidad completa existe por documento; para el prestamo completo se aplica una compensacion desde el backend.

## 4. Consistencia

### 1:15 - 2:00

Que decir:

> La consistencia significa que los datos deben respetar las reglas del negocio. En este proyecto la consistencia se maneja en dos niveles: primero, con mappings estrictos de Elasticsearch, y segundo, con validaciones en el backend.

> Los indices usan `dynamic: strict`, por lo que Elasticsearch rechaza campos que no pertenecen al modelo. Ademas, el backend valida reglas como: un cliente bloqueado no puede alquilar, una copia debe estar disponible, no se permiten copias repetidas, la duracion no puede superar el maximo configurado y la tarifa debe existir.

Que mostrar:

- Abrir `models-http/01_crear_indices.http`.
- Mostrar `dynamic: "strict"` en los indices.
- Mostrar el mapping de `peliculas`, `clientes`, `copias`, `prestamos` o `configuraciones`.
- Abrir `backend/src/controllers/prestamos.controller.js`.
- Mostrar validaciones de cliente activo, copias disponibles, duracion y tarifa.

Demo recomendada:

- Intentar prestar una copia no disponible o usar un cliente bloqueado.
- Mostrar que el backend responde con error y no deja crear el prestamo.

Frase clave:

> La consistencia no depende solo del frontend; las reglas importantes se verifican en el backend antes de escribir en Elasticsearch.

## 5. Aislamiento

### 2:00 - 2:45

Que decir:

> El aislamiento evita que dos operaciones concurrentes se pisen entre si. El caso critico aqui es que dos prestamos intenten tomar la misma copia al mismo tiempo.

> Para resolverlo, el backend usa concurrencia optimista de Elasticsearch. Primero lee la copia con su `_seq_no` y `_primary_term`. Luego intenta actualizarla usando `if_seq_no` e `if_primary_term`. Si otra operacion cambio la copia antes, Elasticsearch devuelve conflicto 409 y el prestamo se cancela.

Que mostrar:

- En `backend/src/services/elasticsearch.service.js`, mostrar `getHitById` con `seq_no_primary_term: true`.
- En `backend/src/controllers/prestamos.controller.js`, mostrar `reserveCopy` con `if_seq_no` e `if_primary_term`.
- Mostrar el manejo del error 409.

Demo opcional:

- Explicar el caso con dos usuarios intentando prestar la misma copia.
- Mostrar que una copia ya prestada no aparece como disponible o que el backend rechaza la solicitud.

Frase clave:

> No se usa bloqueo pesimista; se usa control optimista para detectar cambios concurrentes y evitar doble prestamo.

## 6. Durabilidad

### 2:45 - 3:25

Que decir:

> La durabilidad significa que, una vez confirmada una escritura, los datos permanecen almacenados. En este proyecto los documentos se guardan en Elasticsearch y el `docker-compose` usa un volumen persistente para los datos.

> Ademas, el backend usa `refresh: true` en creaciones y actualizaciones para que los cambios sean visibles inmediatamente despues de guardar. Esto ayuda a que el frontend pueda consultar el dato actualizado sin esperar el refresh automatico.

Que mostrar:

- Abrir `docker-compose.yml`.
- Mostrar el volumen `elasticsearch_data`.
- Abrir `backend/src/services/elasticsearch.service.js`.
- Mostrar `refresh: true` en `createDocument` y `updateDocument`.

Punto importante:

> Como esta configurado para desarrollo, Elasticsearch corre en un solo nodo y sin replicas. Para produccion se recomendarian replicas, snapshots y respaldos.

Frase clave:

> La durabilidad esta cubierta por la persistencia de Elasticsearch y el volumen Docker, aunque la alta disponibilidad requeriria configuracion adicional.

## 7. Transacciones

### 3:25 - 4:10

Que decir:

> Elasticsearch no ofrece transacciones multi-documento como una base SQL. Por eso, el proyecto implementa transacciones logicas desde el backend para los casos importantes.

> La creacion de un prestamo funciona como una mini transaccion de negocio: se validan datos, se reservan copias con control de version, se calcula el monto, se crea el documento del prestamo y se genera la factura. Si falla una parte despues de reservar copias, el backend ejecuta una compensacion para liberarlas.

Que mostrar:

- Flujo de creacion de prestamo en `prestar` o wizard del frontend.
- Pantalla donde se selecciona cliente, copias y duracion.
- Factura generada.
- Codigo de `createPrestamo` en `prestamos.controller.js`.

Punto tecnico:

- La factura queda dentro del documento `prestamos`.
- El prestamo guarda snapshot de cliente, items, tarifa, descuento y total.
- Esto evita que cambios futuros alteren facturas historicas.

Frase clave:

> No hay transacciones ACID completas entre indices, pero si hay una transaccion logica controlada por backend.

## 8. Bloqueos

### 4:10 - 4:50

Que decir:

> En el sistema existen dos ideas de bloqueo. La primera es el bloqueo de clientes: un cliente puede quedar en estado `bloqueado`, con fecha, razon y detalle. Cuando el cliente esta bloqueado, el backend no permite crear prestamos.

> La segunda es el control de concurrencia sobre copias. No se bloquea fisicamente el documento mientras otro usuario lo lee. En lugar de eso se usa concurrencia optimista: si alguien modifica la copia antes, Elasticsearch rechaza la actualizacion con conflicto 409.

Que mostrar:

- Pantalla de detalle o lista de clientes.
- Bloquear un cliente.
- Intentar crear un prestamo con ese cliente.
- Mostrar rechazo del backend.
- Mostrar `bloquearCliente` en `backend/src/controllers/clientes.controller.js`.
- Mostrar `reserveCopy` en `prestamos.controller.js`.

Frase clave:

> El bloqueo de clientes es una regla de negocio; el bloqueo de copias se resuelve con concurrencia optimista.

## 9. Cierre

### 4:50 - 5:00

Que decir:

> En conclusion, el sistema aprovecha las garantias atomicas por documento de Elasticsearch y agrega reglas en el backend para mantener consistencia. Para operaciones que afectan varios documentos, como prestamos y copias, se usan validaciones, control optimista y compensacion. Por eso el sistema cumple ACID parcialmente a nivel documental y maneja los casos criticos del negocio, aunque no implementa transacciones ACID completas como una base relacional.

Que mostrar:

- Volver al frontend y mostrar un prestamo/factura ya creado.
- Cerrar con la lista de peliculas o dashboard.

## 10. Resumen rapido por punto de la rubrica

| Punto | Que explicar | Que mostrar |
| --- | --- | --- |
| Atomicidad | Escrituras atomicas por documento y compensacion al crear prestamos. | `createDocument`, `updateDocument`, `createPrestamo`, `releaseReservedCopies`. |
| Consistencia | Mappings estrictos y reglas de negocio validadas en backend. | `dynamic: strict`, validaciones de cliente, copia, tarifa y duracion. |
| Aislamiento | Concurrencia optimista para evitar doble prestamo de una copia. | `_seq_no`, `_primary_term`, `if_seq_no`, `if_primary_term`, error 409. |
| Durabilidad | Persistencia en Elasticsearch y volumen Docker. | `docker-compose.yml`, volumen `elasticsearch_data`, `refresh: true`. |
| Transacciones | No hay transaccion SQL; hay transaccion logica coordinada por backend. | Wizard de prestamo, factura, flujo `createPrestamo`. |
| Bloqueos | Bloqueo de clientes y control optimista en copias. | Pantalla de clientes, bloqueo, rechazo de prestamo, `reserveCopy`. |

## 11. Checklist de grabacion

Antes de grabar:

- Verificar que el backend responda en `http://localhost:3000`.
- Verificar que Elasticsearch este levantado.
- Tener una configuracion activa.
- Tener al menos una copia disponible.
- Tener un cliente activo y uno bloqueado.
- Tener preparado un ejemplo de busqueda de pelicula.

Durante el video:

- No dedicar demasiado tiempo a pantallas visuales.
- Mostrar codigo solo en los fragmentos clave.
- Repetir la idea central: Elasticsearch garantiza atomicidad por documento, y el backend coordina la logica multi-documento.
- Mencionar honestamente la limitacion: no hay transacciones ACID completas entre indices.

## 12. Frase final para defender ante preguntas

> Elegi modelar la solucion considerando la naturaleza documental de Elasticsearch. Por eso no intente forzar un modelo relacional, sino que use indices separados, documentos con snapshots historicos, mappings estrictos, control optimista de concurrencia y compensacion desde el backend para cubrir las operaciones criticas del club de videos.
