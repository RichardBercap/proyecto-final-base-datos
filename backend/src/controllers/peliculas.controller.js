const crypto = require('crypto');
const {
  searchAll,
  getById,
  createDocument,
  updateDocument
} = require('../services/elasticsearch.service');
const HttpError = require('../utils/httpError');

const INDEX = 'peliculas';

const generateId = () => `PEL-${crypto.randomUUID()}`;

const normalizePeliculaBody = (body) => {
  const document = { ...body };

  if (document.poster_url === undefined || document.poster_url === null) {
    return document;
  }

  if (typeof document.poster_url !== 'string') {
    throw new HttpError(400, 'poster_url debe ser una URL valida');
  }

  const posterUrl = document.poster_url.trim();

  if (!posterUrl) {
    delete document.poster_url;
    return document;
  }

  try {
    const url = new URL(posterUrl);
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error('Protocolo no soportado');
    }
  } catch {
    throw new HttpError(400, 'poster_url debe ser una URL valida http o https');
  }

  document.poster_url = posterUrl;
  return document;
};

const listPeliculas = async (req, res) => {
  const peliculas = await searchAll(INDEX, {
    sort: [{ 'titulo.raw': 'asc' }]
  });

  res.json(peliculas);
};

const getPelicula = async (req, res) => {
  const pelicula = await getById(INDEX, req.params.id);
  res.json(pelicula);
};

const createPelicula = async (req, res) => {
  const now = new Date().toISOString();
  const id = req.body.pelicula_id || generateId();
  const body = normalizePeliculaBody(req.body);
  const document = {
    ...body,
    pelicula_id: id,
    fecha_creacion: body.fecha_creacion || now,
    fecha_actualizacion: now
  };

  const pelicula = await createDocument(INDEX, id, document);
  res.status(201).json(pelicula);
};

const updatePelicula = async (req, res) => {
  if (req.body.pelicula_id && req.body.pelicula_id !== req.params.id) {
    throw new HttpError(400, 'pelicula_id no puede ser diferente al id de la ruta');
  }

  const body = normalizePeliculaBody(req.body);

  await updateDocument(INDEX, req.params.id, {
    ...body,
    pelicula_id: req.params.id,
    fecha_actualizacion: new Date().toISOString()
  });

  const pelicula = await getById(INDEX, req.params.id);
  res.json(pelicula);
};

const searchPeliculas = async (req, res) => {
  const q = String(req.query.q || '').trim();

  if (!q) {
    throw new HttpError(400, 'El parametro q es requerido');
  }

  const peliculas = await searchAll(INDEX, {
    query: {
      bool: {
        should: [
          {
            multi_match: {
              query: q,
              type: 'phrase_prefix',
              fields: [
                'titulo^5',
                'titulos_alternativos^4',
                'genero^2',
                'actores_principales^2',
                'oscars.nominaciones',
                'oscars.ganados'
              ]
            }
          },
          {
            multi_match: {
              query: q,
              fields: [
                'titulo^4',
                'titulos_alternativos^3',
                'genero^2',
                'actores_principales^2',
                'oscars.nominaciones',
                'oscars.ganados'
              ],
              fuzziness: 'AUTO',
              prefix_length: 1,
              operator: 'and'
            }
          }
        ],
        minimum_should_match: 1
      }
    }
  });

  res.json(peliculas);
};

module.exports = {
  listPeliculas,
  getPelicula,
  createPelicula,
  updatePelicula,
  searchPeliculas
};
