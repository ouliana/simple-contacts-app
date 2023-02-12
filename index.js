require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const nano = require('nano')(process.env.COUCHDB_URL);

const app = express();

app.use(express.static('build'));
app.use(express.json());

app.use(
  morgan('tiny', {
    skip: (request, response) => request.method === 'POST',
  })
);

morgan.token('body', (request, response) => JSON.stringify(request.body));

app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :body',
    {
      skip: (request, response) => request.method !== 'POST',
    }
  )
);

app.use(cors());
const persons = nano.use('persons');

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get('/info', (request, response) => {
  const info = `Contact app has info for ${
    persons.length
  } people<br>${new Date()}`;
  response.send(info);
});

app.get('/api/persons', async (req, res) => {
  try {
    const body = await persons.view('person', 'all', { include_docs: true });

    res.send(
      body.rows.map(row => ({
        name: row.doc.name,
        number: row.doc.number,
        id: row.id,
      }))
    );
  } catch (err) {
    console.log(err.reason);
  }
});

app.get('/api/persons/:id', async (req, res, next) => {
  try {
    const doc = await persons.get(req.params.id);
    res.send({ name: doc.name, number: doc.number, id: doc._id });
  } catch (err) {
    next(err);
  }
});

app.delete('/api/persons/:id', async (req, res, next) => {
  console.log('api.delete runs...');
  console.log(console.log(req.params.id));

  try {
    const doc = await persons.get(req.params.id);
    console.log(doc._id, doc._rev);
    const response = await persons.destroy(doc._id, doc._rev);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

app.post('/api/persons', async (req, res, next) => {
  const body = req.body;

  if (!(body.name && body.number)) {
    res.status(400).send(error);
  } else {
    console.log('POST');
    try {
      const response = await persons.insert({
        name: body.name,
        number: body.number,
      });
      console.log(`id`, response.id);
      const doc = await persons.get(response.id);
      res.send({
        name: doc.name,
        number: doc.number,
        id: response.id,
      });
    } catch (err) {
      next(err);
    }
  }
});

app.put('/api/persons/:id', async (req, res, next) => {
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
    next(err);
  }
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

// handler of requests with unknown endpoint
app.use(unknownEndpoint);

const errorHandler = (error, req, res, next) => {
  console.error(error.message);
  if (error.reason === 'missing') {
    return res.status(404).send({ error: `${error.reason}` });
  }

  next(error);
};

// handler of requests with result to errors
app.use(errorHandler);
