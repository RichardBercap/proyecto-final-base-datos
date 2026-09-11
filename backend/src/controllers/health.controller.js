const { elasticsearch } = require('../services/elasticsearch.service');

const health = async (req, res) => {
  try {
    const info = await elasticsearch.info();

    res.json({
      status: 'ok',
      elasticsearch: {
        status: 'ok',
        cluster_name: info.cluster_name,
        version: info.version?.number
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      elasticsearch: {
        status: 'error',
        message: error.message
      }
    });
  }
};

module.exports = {
  health
};
