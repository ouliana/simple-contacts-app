require('dotenv').config();
const nano = require('nano');

module.exports = nano(process.env.COUCHDB_URL);
