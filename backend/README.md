# Backend Video Club

Backend Node.js con Express para administrar peliculas, copias, clientes, prestamos y configuraciones usando Elasticsearch.

## Requisitos

- Node.js 18 o superior
- Elasticsearch local en `http://localhost:9200`
- Indices creados: `peliculas`, `copias`, `clientes`, `prestamos`, `configuraciones`

## Instalacion

```bash
npm install
cp .env.example .env
npm run dev
```

Para produccion o ejecucion normal:

```bash
npm start
```

## Variables de entorno

```env
ELASTICSEARCH_NODE=http://localhost:9200
PORT=3000
```

## Endpoints

- `GET /health`
- `GET /api/peliculas`
- `GET /api/peliculas/:id`
- `POST /api/peliculas`
- `PUT /api/peliculas/:id`
- `GET /api/peliculas/buscar?q=texto`
- `GET /api/clientes`
- `GET /api/clientes/:id`
- `POST /api/clientes`
- `PUT /api/clientes/:id`
- `PATCH /api/clientes/:id/bloquear`
- `GET /api/copias`
- `GET /api/copias/disponibles`
- `POST /api/copias`
- `PATCH /api/copias/:id/baja`
- `GET /api/configuraciones/activa`
- `POST /api/configuraciones`
- `GET /api/prestamos`
- `GET /api/prestamos/:id`
- `POST /api/prestamos`
- `PATCH /api/prestamos/:id/devolver`

## Ejemplos con curl

Probar estado del backend y Elasticsearch:

```bash
curl http://localhost:3000/health
```

Listar peliculas:

```bash
curl http://localhost:3000/api/peliculas
```

Crear cliente:

```bash
curl -X POST http://localhost:3000/api/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_id": "CLI-002",
    "nombre_completo": "Luis Garcia",
    "telefono_celular": "+59170000002",
    "correo_electronico": "luis@example.com",
    "fecha_nacimiento": "1992-04-10",
    "direccion": {
      "texto": "Calle 21 #100",
      "ciudad": "La Paz",
      "zona": "Calacoto",
      "ubicacion": { "lat": -16.5400, "lon": -68.0800 }
    }
  }'
```

Crear prestamo:

```bash
curl -X POST http://localhost:3000/api/prestamos \
  -H "Content-Type: application/json" \
  -d '{
    "prestamo_id": "PRE-002",
    "cliente_id": "CLI-001",
    "copia_ids": ["COP-001", "COP-002"],
    "duracion_dias": 3,
    "nit_ci": "1234567",
    "razon_social": "Ana Perez Lopez"
  }'
```

Devolver prestamo:

```bash
curl -X PATCH http://localhost:3000/api/prestamos/PRE-002/devolver
```

