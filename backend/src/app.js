require('dotenv').config();

const express = require('express');
const healthRoutes = require('./routes/health.routes');
const peliculasRoutes = require('./routes/peliculas.routes');
const clientesRoutes = require('./routes/clientes.routes');
const copiasRoutes = require('./routes/copias.routes');
const prestamosRoutes = require('./routes/prestamos.routes');
const configuracionesRoutes = require('./routes/configuraciones.routes');
const HttpError = require('./utils/httpError');

const app = express();

app.use(express.json());

app.use('/health', healthRoutes);
app.use('/api/peliculas', peliculasRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/copias', copiasRoutes);
app.use('/api/prestamos', prestamosRoutes);
app.use('/api/configuraciones', configuracionesRoutes);

app.use((req, res, next) => {
  next(new HttpError(404, 'Ruta no encontrada'));
});

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || error.meta?.statusCode || 500;

  res.status(statusCode).json({
    error: {
      message: error.message || 'Error interno del servidor',
      ...(error.details ? { details: error.details } : {})
    }
  });
});

module.exports = app;
