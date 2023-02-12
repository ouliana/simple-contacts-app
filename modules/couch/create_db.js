const couchdb = require('./couchdb');

async function create(name, next) {
  try {
    couchdb.create(name);
    console.log(`Database ${name} created`);
  } catch (err) {
    console.log(err.reason);
    next(err);
  }
}

export default create;
