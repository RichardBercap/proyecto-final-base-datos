# Base de datos Elasticsearch — Club de Videos

Este diseño cubre todos los requisitos de la consigna mediante cinco índices:

| Índice | Documento principal | Finalidad |
|---|---|---|
| `peliculas` | Una película | Catálogo y búsqueda por título, género, actor u Oscar. |
| `copias` | Un DVD físico | Disponibilidad, préstamo actual y registro de bajas. |
| `clientes` | Un cliente | Datos personales, geolocalización y bloqueos. |
| `prestamos` | Un préstamo/factura | Varias copias por operación, fechas, importes y factura. |
| `configuraciones` | Una versión de reglas | Tarifas por días y descuentos por cantidad. |

## Decisiones del modelo

- Las copias son documentos separados porque cada DVD tiene estado propio: `disponible`, `prestada` o `baja`.
- Las peliculas pueden guardar `poster_url` opcional; si no existe, el frontend muestra un placeholder.
- Los elementos de un préstamo son `nested`; así los datos de una película no se mezclan con los de otra al consultar.
- Cada préstamo guarda una instantánea del cliente, películas, tarifa y descuento. Una modificación posterior de esos datos no cambia una factura histórica.
- Los actores, títulos alternativos y premios se guardan dentro de la película porque se consultan junto con ella y no tienen operaciones independientes en la consigna.
- Las configuraciones son versionadas. El préstamo conserva `configuracion_version` para demostrar qué reglas se aplicaron.
- Los mappings usan `dynamic: strict` para rechazar campos escritos por error.
- Se configura una réplica en `0` para un entorno local de un solo nodo. En producción debe usarse al menos una réplica.

## Orden de ejecución

1. Abrir Kibana: `http://localhost:5601`.
2. Ir a **Dev Tools > Console**.
3. Ejecutar, por bloques, [`01_crear_indices.http`](01_crear_indices.http).
4. Ejecutar [`02_datos_prueba.ndjson`](02_datos_prueba.ndjson) mediante `_bulk` (también puede copiarse completo en Dev Tools).
5. Probar las búsquedas de [`03_consultas.http`](03_consultas.http).

Para comprobar la creación:

```http
GET _cat/indices/peliculas,copias,clientes,prestamos,configuraciones?v
```

Para inspeccionar un mapping:

```http
GET peliculas/_mapping
```

## Reglas que debe aplicar el backend

El mapping valida tipos, pero estas reglas de negocio deben verificarse en el servicio antes de escribir:

1. Un cliente con `estado: bloqueado` no puede alquilar.
2. Todas las copias seleccionadas deben estar `disponible`.
3. No se puede repetir una copia dentro del mismo préstamo.
4. `duracion_dias` debe existir en la configuración activa; actualmente el máximo es 5 días.
5. El descuento debe ser 0% para 1–2 películas, 5% para 3–5 y 10% para más de 5.
6. Los importes deben calcularse en el backend y guardarse como valores históricos.
7. Al prestar una copia se usa concurrencia optimista (`if_seq_no` y `if_primary_term`) para impedir dos préstamos simultáneos sobre el mismo DVD.

## Límite transaccional importante

Elasticsearch no ofrece una transacción ACID que abarque a la vez `prestamos` y varias `copias`. El backend debe ejecutar una operación coordinada:

1. Validar cliente, configuración y copias.
2. Reservar cada copia con control de versión.
3. Crear el préstamo con un `prestamo_id` fijo para que el reintento sea idempotente.
4. Si falla una reserva, compensar las copias ya reservadas.
5. Registrar y reintentar cualquier compensación pendiente.

El backend implementa reserva con control de versión y compensación inmediata. En caso de conflicto, responde `409` y deja las copias reservadas por esa operación nuevamente disponibles.

Este límite debe explicarse de manera explícita en el video sobre atomicidad, consistencia, aislamiento, durabilidad, transacciones y bloqueos.
