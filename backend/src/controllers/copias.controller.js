const crypto = require('crypto');
const {
  searchAll,
  createDocument,
  updateDocument
} = require('../services/elasticsearch.service');

const INDEX = 'copias';

const generateId = () => `COP-${crypto.randomUUID()}`;

const listCopias = async (req, res) => {
  const copias = await searchAll(INDEX);
  res.json(copias);
};

const listCopiasDisponibles = async (req, res) => {
  const filter = [{ term: { estado: 'disponible' } }];

  if (req.query.pelicula_id) {
    filter.push({ term: { pelicula_id: req.query.pelicula_id } });
  }

  const copias = await searchAll(INDEX, {
    query: {
      bool: { filter }
    }
  });

  res.json(copias);
};

const createCopia = async (req, res) => {
  const now = new Date().toISOString();
  const id = req.body.copia_id || generateId();
  const document = {
    ...req.body,
    copia_id: id,
    estado: req.body.estado || 'disponible',
    fecha_actualizacion: now
  };

  const copia = await createDocument(INDEX, id, document);
  res.status(201).json(copia);
};

const darBajaCopia = async (req, res) => {
  const now = new Date().toISOString();

  await updateDocument(INDEX, req.params.id, {
    estado: 'baja',
    baja: {
      fecha: now,
      razon: req.body.razon || 'baja_manual',
      detalle: req.body.detalle || 'Copia dada de baja desde el backend'
    },
    fecha_actualizacion: now
  });

  res.json({
    message: 'Copia dada de baja correctamente',
    copia_id: req.params.id
  });
};

module.exports = {
  listCopias,
  listCopiasDisponibles,
  createCopia,
  darBajaCopia
};
