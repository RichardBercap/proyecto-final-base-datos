# Blockflix Rental Frontend

Aplicación Vue 3 + TypeScript para consumir el backend Express del videoclub con Elasticsearch.

## Instalación

```bash
cd frontend
npm install
npm run dev
```

El frontend espera que el backend esté disponible en `http://localhost:3000`. En desarrollo, Vite usa proxy desde `/api` hacia el backend para evitar problemas de CORS.

## Variables de entorno

```env
VITE_API_URL=/api
VITE_APP_NAME=Blockflix Rental
```

Archivos incluidos:

- `.env.example`
- `.env.development`
- `.env.production`

## Scripts

- `npm run dev`: servidor local Vite.
- `npm run build`: validación TypeScript y build de producción.
- `npm run preview`: previsualiza el build.
- `npm run test`: ejecuta Vitest.
- `npm run lint`: ejecuta ESLint con autofix.
- `npm run format`: aplica Prettier.

## Arquitectura

El proyecto sigue Feature Based Architecture:

- `src/api`: instancia Axios centralizada con interceptores.
- `src/services`: servicios REST por módulo.
- `src/stores`: Pinia con lógica de negocio.
- `src/modules`: páginas por dominio.
- `src/components`: componentes comunes, layout y dominio.
- `src/types`: DTOs e interfaces del backend.
- `src/utils`: formato, paginación y helpers.
- `src/composables`: lógica reusable.
- `src/styles`: Tailwind y tokens visuales.

## Vistas principales

- `/dashboard`: métricas administrativas.
- `/movies`: catálogo administrativo con búsqueda y filtros.
- `/clients`: gestión de clientes y bloqueos con razón.
- `/loans/new`: wizard de préstamo con fecha prevista, precios y descuentos.
- `/settings`: tarifas y reglas de descuento versionadas.
- `/catalog`: catálogo público para clientes.

## Endpoints Consumidos

- `GET /api/peliculas`
- `GET /api/peliculas/buscar?q=texto`
- `GET /api/peliculas/:id`
- `POST /api/peliculas`
- `PUT /api/peliculas/:id`
- `GET /api/copias`
- `GET /api/copias/disponibles`
- `POST /api/copias`
- `PATCH /api/copias/:id/baja`
- `GET /api/clientes`
- `GET /api/clientes/:id`
- `POST /api/clientes`
- `PUT /api/clientes/:id`
- `PATCH /api/clientes/:id/bloquear`
- `GET /api/prestamos`
- `GET /api/prestamos/:id`
- `POST /api/prestamos`
- `PATCH /api/prestamos/:id/devolver`
- `GET /api/configuraciones/activa`
- `POST /api/configuraciones`

## TODO por endpoints faltantes

- Desbloquear cliente: falta `PATCH /api/clientes/:id/desbloquear`.
- Eliminar película: falta `DELETE /api/peliculas/:id`.

## Guías de Desarrollo

- Usar Composition API con `<script setup lang="ts">`.
- Mantener la lógica de negocio en stores y servicios.
- No hardcodear URLs, usar `VITE_API_URL`.
- Crear componentes pequeños y reutilizables.
- Evitar `any`; los DTOs viven en `src/types`.
- Mantener la identidad visual Blockbuster con layout moderno tipo streaming.
