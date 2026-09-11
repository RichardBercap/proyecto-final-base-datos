const crypto = require('crypto');
const {
  searchAll,
  getById,
  createDocument,
  updateDocument
} = require('../services/elasticsearch.service');
const HttpError = require('../utils/httpError');

const INDEX = 'clientes';

const generateId = () => `CLI-${crypto.randomUUID()}`;

const listClientes = async (req, res) => {
  const clientes = await searchAll(INDEX, {
    sort: [{ fecha_registro: 'desc' }]
  });

  res.json(clientes);
};

const getCliente = async (req, res) => {
  const cliente = await getById(INDEX, req.params.id);
  res.json(cliente);
};

const createCliente = async (req, res) => {
  const now = new Date().toISOString();
  const id = req.body.cliente_id || generateId();
  const document = {
    ...req.body,
    cliente_id: id,
    estado: req.body.estado || 'activo',
    historial_bloqueos: req.body.historial_bloqueos || [],
    fecha_registro: req.body.fecha_registro || now,
    fecha_actualizacion: now
  };

  const cliente = await createDocument(INDEX, id, document);
  res.status(201).json(cliente);
};

const updateCliente = async (req, res) => {
  if (req.body.cliente_id && req.body.cliente_id !== req.params.id) {
    throw new HttpError(400, 'cliente_id no puede ser diferente al id de la ruta');
  }

  await updateDocument(INDEX, req.params.id, {
    ...req.body,
    cliente_id: req.params.id,
    fecha_actualizacion: new Date().toISOString()
  });

  const cliente = await getById(INDEX, req.params.id);
  res.json(cliente);
};

const bloquearCliente = async (req, res) => {
  const now = new Date().toISOString();
  const razon = req.body.razon || 'bloqueo_manual';
  const detalle = req.body.detalle || 'Cliente bloqueado desde el backend';
  const cliente = await getById(INDEX, req.params.id);
  const historialBloqueos = cliente.historial_bloqueos || [];

  await updateDocument(INDEX, req.params.id, {
    estado: 'bloqueado',
    bloqueo_actual: {
      fecha: now,
      razon,
      detalle
    },
    historial_bloqueos: [
      ...historialBloqueos,
      {
        fecha_bloqueo: now,
        razon,
        detalle
      }
    ],
    fecha_actualizacion: now
  });

  const updated = await getById(INDEX, req.params.id);
  res.json(updated);
};

module.exports = {
  listClientes,
  getCliente,
  createCliente,
  updateCliente,
  bloquearCliente
};
