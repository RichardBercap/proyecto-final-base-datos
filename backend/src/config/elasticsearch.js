const { Client } = require('@elastic/elasticsearch');

const elasticsearchNode = process.env.ELASTICSEARCH_NODE || 'http://localhost:9200';

const elasticsearch = new Client({
  node: elasticsearchNode
});

module.exports = elasticsearch;
