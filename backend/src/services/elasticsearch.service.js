const elasticsearch = require('../config/elasticsearch');
const HttpError = require('../utils/httpError');

const DEFAULT_SIZE = 100;

const toHit = (hit) => ({
  id: hit._id,
  ...hit._source
});

const searchAll = async (index, { query = { match_all: {} }, sort, size = DEFAULT_SIZE } = {}) => {
  const response = await elasticsearch.search({
    index,
    size,
    query,
    ...(sort ? { sort } : {})
  });

  return response.hits.hits.map(toHit);
};

const getById = async (index, id) => {
  try {
    const response = await elasticsearch.get({ index, id });
    return {
      id: response._id,
      ...response._source
    };
  } catch (error) {
    if (error.meta && error.meta.statusCode === 404) {
      throw new HttpError(404, `No se encontro el documento ${id} en ${index}`);
    }

    throw error;
  }
};

const getHitById = async (index, id) => {
  try {
    return await elasticsearch.get({
      index,
      id,
      seq_no_primary_term: true
    });
  } catch (error) {
    if (error.meta && error.meta.statusCode === 404) {
      throw new HttpError(404, `No se encontro el documento ${id} en ${index}`);
    }

    throw error;
  }
};

const createDocument = async (index, id, body) => {
  await elasticsearch.index({
    index,
    id,
    document: body,
    refresh: true
  });

  return {
    id,
    ...body
  };
};

const updateDocument = async (index, id, doc) => {
  const response = await elasticsearch.update({
    index,
    id,
    doc,
    refresh: true,
    retry_on_conflict: 3
  });

  return response;
};

module.exports = {
  elasticsearch,
  searchAll,
  getById,
  getHitById,
  createDocument,
  updateDocument
};
