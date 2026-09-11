# Trabajo Final - Base de Datos Avanzadas

## Introducción
Este documento tiene por objetivo definir las reglas y lineamientos para el primer trabajo de la asignatura **Base de Datos Avanzadas**.

---

## Instrucciones
El docente asignará a cada alumno uno de los siguientes motores de Base de Datos:
1. **MongoDB**
2. **Neo4J**
3. **CouchDB**
4. **ElasticSearch**

Luego deberá construir lo siguiente:

### Análisis, Maquetado y Diseño de Base de Datos
#### CLUB DE VIDEOS
Se requiere realizar el software para un club de videos, que será administrado únicamente por el propietario del mismo.

---

## Requerimientos Funcionales

Como propietario del club de videos deseo poder realizar las siguientes operaciones:

### 1. Gestión de Videos
1. Deseo registrar un nuevo video, guardando la siguiente información:
   - **a.** Duración en minutos.
   - **b.** Género: Drama, Comedia, Suspenso, etc.
   - **c.** Título de la película, con varios alternativos.
   - **d.** Año de publicación.
   - **e.** Qué nominaciones a premios Oscar tuvo y cuáles ganó.
   - **f.** Principales actores de la película.
   - **g.** Costo unitario de cada DVD.
   - **h.** Número de unidades adquiridas.
2. Registrar nuevas copias para una película.
3. Registrar bajas de copias para una película, especificando la fecha de la baja y la razón (no devuelto, robo, etc.).

### 2. Gestión de Clientes
1. Deseo poder registrar nuevos clientes, guardando la siguiente información:
   - **a.** Nombre completo.
   - **b.** Número de teléfono celular.
   - **c.** Correo electrónico.
   - **d.** Fecha de nacimiento.
   - **e.** Dirección.
   - **f.** Geolocalización de la dirección.
   - **g.** Fecha de registro en la BBDD como cliente.
2. Deseo poder actualizar los datos de los clientes cuando sea necesario.
3. Deseo poder bloquear malos clientes registrando la fecha del bloqueo y la razón por la que se ha decidido bloquearlo (*los clientes bloqueados no pueden rentar películas*).

### 3. Gestión de Préstamos
1. Deseo poder registrar el préstamo de una película, para lo cual se realizan las siguientes actividades:
   - **a.** Buscar película por nombre, género, actor o nominaciones al Oscar.
   - **b.** Agregar la película que se desea prestar.
   - **c.** Buscar más películas si el cliente desea llevar varias.
   - **d.** Registrar la fecha de devolución.
   - **e.** Calcular el importe de acuerdo a la fecha de devolución.
   - **f.** Emitir la factura con el importe total.
2. Deseo poder definir y modificar costos por día de préstamo:
   - **a.** 1 día: 2 Bs.
   - **b.** 2 días: 3 Bs.
   - **c.** 3 días: 4 Bs.
   - **d.** 4 días: 5 Bs.
   - **e.** 5 días: 6 Bs.
   - **f.** No deberían permitirse préstamos mayores a los días configurados en el software.
3. Deseo poder definir y modificar descuentos por cantidad de películas:
   - **a.** Si lleva de 3 a 5 películas: **5% de descuento**.
   - **b.** Si lleva más de 5 películas: **10% de descuento**.

---

## Evaluación

- **a. (25%) Video de 5 minutos** explicando cómo funciona la Base de Datos respecto a:
  - i. Atomicidad.
  - ii. Consistencia.
  - iii. Aislamiento.
  - iv. Durabilidad.
  - v. Transacciones.
  - vi. Bloqueos.
- **b. (25%) Video de 10 minutos** explicando en una aplicación cómo se resolvieron todos los incidentes.
- **c. (50%) Video de 15 minutos** explicando:
  - i. Cómo modeló la BBDD.
  - ii. Cómo estructuró su código en la aplicación de backend.
  - iii. Explicación de los 5 problemas más complejos que tuvo que resolver y cómo lo resolvió.