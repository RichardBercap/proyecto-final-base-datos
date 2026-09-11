const crypto = require('crypto');
const {
  elasticsearch,
  searchAll,
  getById,
  getHitById,
  createDocument,
  updateDocument
} = require('../services/elasticsearch.service');
const HttpError = require('../utils/httpError');

const INDEX = 'prestamos';

const generateId = () => `PRE-${crypto.randomUUID()}`;

const addDays = (date, days) => {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
};

const roundMoney = (value) => Math.round(value * 100) / 100;

const getActiveConfig = async () => {
  const [configuracion] = await searchAll('configuraciones', {
    size: 1,
    query: { term: { activa: true } },
    sort: [{ version: 'desc' }]
  });

  if (!configuracion) {
    throw new HttpError(503, 'No existe una configuracion activa para crear prestamos');
  }

  return configuracion;
};

const getTarifa = (configuracion, duracionDias) => {
  const tarifa = configuracion.tarifas.find((item) => Number(item.dias) === Number(duracionDias));

  if (!tarifa) {
    throw new HttpError(400, `No existe tarifa configurada para ${duracionDias} dias`);
  }

  return Number(tarifa.costo_bs);
};

const getDescuento = (configuracion, cantidadPeliculas) => {
  const descuento = configuracion.descuentos.find((item) => {
    const min = Number(item.cantidad_minima);
    const max = item.cantidad_maxima === undefined ? Infinity : Number(item.cantidad_maxima);
    return cantidadPeliculas >= min && cantidadPeliculas <= max;
  });

  return descuento ? Number(descuento.porcentaje) : 0;
};

const normalizeCopiaIds = (body) => {
  const copiaIds = body.copia_ids || body.copias_ids || body.copias;

  if (!Array.isArray(copiaIds) || copiaIds.length === 0) {
    throw new HttpError(400, 'Debe enviar copia_ids como arreglo con al menos una copia');
  }

  if (new Set(copiaIds).size !== copiaIds.length) {
    throw new HttpError(400, 'copia_ids no debe contener valores repetidos');
  }

  return copiaIds;
};

const reserveCopy = async (copyHit, prestamoId, fecha) => {
  try {
    await elasticsearch.update({
      index: 'copias',
      id: copyHit._id,
      if_seq_no: copyHit._seq_no,
      if_primary_term: copyHit._primary_term,
      doc: {
        estado: 'prestada',
        prestamo_actual_id: prestamoId,
        fecha_actualizacion: fecha
      },
      refresh: true
    });
  } catch (error) {
    if (error.meta?.statusCode === 409) {
      throw new HttpError(409, `La copia ${copyHit._id} fue modificada por otra operacion. Intente nuevamente`);
    }

    throw error;
  }
};

const releaseReservedCopies = async (reservedCopies, fecha) => {
  await Promise.allSettled(
    reservedCopies.map((copy) =>
      elasticsearch.update({
        index: 'copias',
        id: copy.copia_id,
        script: {
          source: `
            if (ctx._source.prestamo_actual_id == params.prestamo_id) {
              ctx._source.estado = 'disponible';
              ctx._source.remove('prestamo_actual_id');
              ctx._source.fecha_actualizacion = params.fecha;
            }
          `,
          params: {
            prestamo_id: copy.prestamo_id,
            fecha
          }
        },
        refresh: true,
        retry_on_conflict: 3
      })
    )
  );
};

const listPrestamos = async (req, res) => {
  const prestamos = await searchAll(INDEX, {
    sort: [{ fecha_prestamo: 'desc' }]
  });

  res.json(prestamos);
};

const getPrestamo = async (req, res) => {
  const prestamo = await getById(INDEX, req.params.id);
  res.json(prestamo);
};

const createPrestamo = async (req, res) => {
  const clienteId = req.body.cliente_id;
  const duracionDias = Number(req.body.duracion_dias);
  const copiaIds = normalizeCopiaIds(req.body);

  if (!clienteId) {
    throw new HttpError(400, 'cliente_id es requerido');
  }

  if (!Number.isInteger(duracionDias) || duracionDias < 1) {
    throw new HttpError(400, 'duracion_dias debe ser un entero mayor o igual a 1');
  }

  const [cliente, configuracion] = await Promise.all([
    getById('clientes', clienteId),
    getActiveConfig()
  ]);

  if (cliente.estado === 'bloqueado') {
    throw new HttpError(409, 'El cliente esta bloqueado y no puede realizar prestamos');
  }

  if (cliente.estado !== 'activo') {
    throw new HttpError(409, `El cliente no esta activo. Estado actual: ${cliente.estado}`);
  }

  if (duracionDias > Number(configuracion.maximo_dias_prestamo)) {
    throw new HttpError(400, `No se permite prestamo mayor a ${configuracion.maximo_dias_prestamo} dias`);
  }

  const copyHits = await Promise.all(copiaIds.map((copiaId) => getHitById('copias', copiaId)));
  const copias = copyHits.map((doc) => ({
    id: doc._id,
    ...doc._source
  }));

  const noDisponibles = copias.filter((copia) => copia.estado !== 'disponible');
  if (noDisponibles.length > 0) {
    throw new HttpError(409, 'Algunas copias no estan disponibles', {
      copias: noDisponibles.map((copia) => ({
        copia_id: copia.copia_id,
        estado: copia.estado
      }))
    });
  }

  const now = new Date();
  const nowIso = now.toISOString();
  const prestamoId = req.body.prestamo_id || generateId();
  const tarifaBs = getTarifa(configuracion, duracionDias);
  const cantidadPeliculas = copias.length;
  const subtotalBs = roundMoney(tarifaBs * cantidadPeliculas);
  const descuentoPorcentaje = getDescuento(configuracion, cantidadPeliculas);
  const descuentoBs = roundMoney(subtotalBs * (descuentoPorcentaje / 100));
  const totalBs = roundMoney(subtotalBs - descuentoBs);

  const prestamo = {
    prestamo_id: prestamoId,
    cliente_id: clienteId,
    cliente: {
      nombre_completo: cliente.nombre_completo,
      telefono_celular: cliente.telefono_celular,
      correo_electronico: cliente.correo_electronico
    },
    fecha_prestamo: nowIso,
    fecha_devolucion_prevista: addDays(now, duracionDias).toISOString(),
    duracion_dias: duracionDias,
    estado: 'activo',
    configuracion_id: configuracion.configuracion_id,
    configuracion_version: configuracion.version,
    items: copias.map((copia) => ({
      copia_id: copia.copia_id,
      codigo_interno: copia.codigo_interno,
      pelicula_id: copia.pelicula_id,
      titulo: copia.pelicula?.titulo,
      genero: copia.pelicula?.genero,
      tarifa_bs: tarifaBs,
      estado: 'prestada'
    })),
    cantidad_peliculas: cantidadPeliculas,
    subtotal_bs: subtotalBs,
    descuento_porcentaje: descuentoPorcentaje,
    descuento_bs: descuentoBs,
    total_bs: totalBs,
    factura: {
      numero: req.body.factura?.numero || `FAC-${prestamoId}`,
      fecha_emision: nowIso,
      nit_ci: req.body.factura?.nit_ci || req.body.nit_ci || cliente.telefono_celular,
      razon_social: req.body.factura?.razon_social || req.body.razon_social || cliente.nombre_completo,
      importe_total_bs: totalBs
    },
    fecha_creacion: nowIso,
    fecha_actualizacion: nowIso
  };

  const reservedCopies = [];

  try {
    for (const copyHit of copyHits) {
      await reserveCopy(copyHit, prestamoId, nowIso);
      reservedCopies.push({
        copia_id: copyHit._id,
        prestamo_id: prestamoId
      });
    }

    const created = await createDocument(INDEX, prestamoId, prestamo);
    res.status(201).json(created);
  } catch (error) {
    await releaseReservedCopies(reservedCopies, new Date().toISOString());
    throw error;
  }
};

const devolverPrestamo = async (req, res) => {
  const prestamo = await getById(INDEX, req.params.id);

  if (prestamo.estado !== 'activo') {
    throw new HttpError(409, `El prestamo no esta activo. Estado actual: ${prestamo.estado}`);
  }

  const nowIso = new Date().toISOString();
  const items = prestamo.items.map((item) => ({
    ...item,
    estado: 'devuelta',
    fecha_devolucion_real: nowIso
  }));

  await updateDocument(INDEX, req.params.id, {
    estado: 'devuelto',
    fecha_devolucion_real: nowIso,
    items,
    fecha_actualizacion: nowIso
  });

  await Promise.all(
    prestamo.items.map((item) =>
      elasticsearch.update({
        index: 'copias',
        id: item.copia_id,
        script: {
          source: `
            ctx._source.estado = 'disponible';
            ctx._source.remove('prestamo_actual_id');
            ctx._source.fecha_actualizacion = params.fecha;
          `,
          params: { fecha: nowIso }
        },
        refresh: true,
        retry_on_conflict: 3
      })
    )
  );

  const updated = await getById(INDEX, req.params.id);
  res.json(updated);
};

module.exports = {
  listPrestamos,
  getPrestamo,
  createPrestamo,
  devolverPrestamo
};
