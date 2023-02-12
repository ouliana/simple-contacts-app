const persons = require('../../modules/couch/couchdb').use('persons');

exports.create = async (person, req, res, next) => {
  try {
    const response = await persons.insert(person);
    const doc = await persons.get(response.id);
    res.send({
      name: doc.name,
      number: doc.number,
      id: response.id,
    });
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const body = await persons.view('person', 'all', { include_docs: true });
    console.log('body', body);

    res.send(
      body.rows.map(row => ({
        name: row.doc.name,
        number: row.doc.number,
        id: row.id,
      }))
    );
  } catch (err) {
    console.log(err.reason);
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const doc = await persons.get(req.params.id);
    res.send({ name: doc.name, number: doc.number, id: doc._id });
  } catch (err) {
    next(err);
  }
};

exports.destroy = async (req, res, next) => {
  try {
    const doc = await persons.get(req.params.id);
    console.log(doc._id, doc._rev);
    const response = await persons.destroy(doc._id, doc._rev);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  const body = req.body;

  try {
    let doc = await persons.get(req.params.id);
    const response = await persons.insert({
      _id: doc._id,
      _rev: doc._rev,
      name: body.name,
      number: body.number,
    });

    doc = await persons.get(req.params.id);
    res.send(doc);
  } catch (err) {
    console.error(err.reason);
    next(err);
  }
};
