# Proyecto Final Base de Datos

**Autor:** Richard Berna

Este proyecto implementa un sistema de gestion para un videoclub usando Elasticsearch como motor principal de almacenamiento y busqueda. La aplicacion permite administrar peliculas, copias fisicas, clientes, prestamos y configuraciones de tarifas o descuentos.

La solucion esta dividida en dos aplicaciones:

- `backend`: API REST construida con Node.js y Express, encargada de exponer los endpoints y comunicarse con Elasticsearch.
- `frontend`: aplicacion web construida con Vue 3 y TypeScript para operar el sistema desde una interfaz administrativa y consultar el catalogo.

Tambien se incluye `docker-compose.yml` para levantar Elasticsearch y Kibana localmente, ademas de archivos HTTP y documentos de apoyo para crear indices, cargar datos de prueba y probar consultas.

## Estructura del repositorio

```text
.
├── backend/       # API REST Express conectada a Elasticsearch
├── frontend/      # Interfaz web Vue 3 + TypeScript
├── models-http/   # Requests HTTP para indices, datos y consultas
├── docs/          # Material de exposicion y documentacion
├── documents/     # Analisis y guiones del proyecto
└── docker-compose.yml
```

## Ejecucion general

Levantar Elasticsearch y Kibana:

```bash
docker compose up -d
```

Instalar y ejecutar el backend:

```bash
cd backend
npm install
npm run dev
```

Instalar y ejecutar el frontend:

```bash
cd frontend
npm install
npm run dev
```

Servicios esperados:

- Backend: `http://localhost:3000`
- Elasticsearch: `http://localhost:9200`
- Kibana: `http://localhost:5601`
- Frontend: URL entregada por Vite al ejecutar `npm run dev`
