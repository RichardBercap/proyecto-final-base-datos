const crypto = require('crypto');
const {
  searchAll,
  createDocument,
  updateDocument
} = require('../services/elasticsearch.service');
const HttpError = require('../utils/httpError');

const INDEX = 'configuraciones';

const generateId = () => `CFG-${crypto.randomUUID()}`;

const getConfiguracionActiva = async (req, res) => {
  const [configuracion] = await searchAll(INDEX, {
    size: 1,
    query: { term: { activa: true } },
    sort: [{ version: 'desc' }]
  });

  if (!configuracion) {
    throw new HttpError(404, 'No existe una configuracion activa');
  }

  res.json(configuracion);
};

const createConfiguracion = async (req, res) => {
  const now = new Date().toISOString();
  const configuracionId = req.body.configuracion_id || generateId();
  const version = req.body.version || 1;
  const id = `${configuracionId}-V${version}`;
  const activa = req.body.activa ?? true;

  if (activa) {
    const activas = await searchAll(INDEX, {
      query: { term: { activa: true } },
      size: 1000
    });

    await Promise.all(
      activas.map((configuracion) =>
        updateDocument(INDEX, configuracion.id, {
          activa: false,
          vigente_hasta: now
        })
      )
    );
  }

  const document = {
    ...req.body,
    configuracion_id: configuracionId,
    version,
    activa,
    vigente_desde: req.body.vigente_desde || now,
    moneda: req.body.moneda || 'BOB',
    maximo_dias_prestamo: req.body.maximo_dias_prestamo || 5,
    tarifas: req.body.tarifas || [
      { dias: 1, costo_bs: 2 },
      { dias: 2, costo_bs: 3 },
      { dias: 3, costo_bs: 4 },
      { dias: 4, costo_bs: 5 },
      { dias: 5, costo_bs: 6 }
    ],
    descuentos: req.body.descuentos || [
      { cantidad_minima: 1, cantidad_maxima: 2, porcentaje: 0 },
      { cantidad_minima: 3, cantidad_maxima: 5, porcentaje: 5 },
      { cantidad_minima: 6, porcentaje: 10 }
    ],
    fecha_creacion: req.body.fecha_creacion || now
  };

  const configuracion = await createDocument(INDEX, id, document);
  res.status(201).json(configuracion);
};

module.exports = {
  getConfiguracionActiva,
  createConfiguracion
};
