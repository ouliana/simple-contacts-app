const couchdb = require('./couchdb');

const databases = ['persons'];

const createDatabase = async (db, next) => {
  await couchdb.db.create(db, err => {
    if (err && err.statusCode == 412) err = null;
    next(err);
  });
};

const createDatabases = next => {
  databases.forEach(async db => {
    await createDatabase(db, next);
  });
};

const initCouch = async next => {
  createDatabases(next);
};

module.exports = initCouch;
