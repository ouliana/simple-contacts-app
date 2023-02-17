//require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const initCouch = require('./modules/couch/init_couch');
const persons = require('./service/db/persons');

const app = express();

app.use(express.static('build'));
app.use(express.json());

app.use(
  morgan('tiny', {
    skip: request => request.method === 'POST',
  })
);

morgan.token('body', request => JSON.stringify(request.body));

app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :body',
    {
      skip: request => request.method !== 'POST',
    }
  )
);

app.use(cors());

initCouch(err => {
  if (err) throw err;
  else console.log('CouchDB initialized');
});

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

app.get('/api/persons', async (req, res, next) => {
  try {
    const entries = await persons.getAll(req, res, next);

    res.send(
      entries.map(entry => ({
        name: entry.doc.name,
        number: entry.doc.number,
        id: entry.id,
      }))
    );
  } catch (err) {
    console.log('GET error: ', err);
    next(err);
  }
});

app.get('/api/persons/:id', async (req, res, next) => {
  try {
    const entry = await persons.getById(req.params.id);
    res.send({ name: entry.name, number: entry.number, id: entry._id });
  } catch (err) {
    console.log('GET by ID error: ', err);
    next(err);
  }
});

app.delete('/api/persons/:id', async (req, res, next) => {
  try {
    await persons.destroy(req.params.id);
    res.status(204).end();
  } catch (err) {
    console.log('DELETE error: ', err);
    next(err);
  }
});

app.post('/api/persons', async (req, res, next) => {
  const newPerson = {
    name: req.body.name,
    number: req.body.number,
  };

  try {
    await persons.validatePerson(newPerson);
    const createdPerson = persons.create(newPerson);
    console.log(createdPerson);
    res.send({
      name: createdPerson.name,
      number: createdPerson.number,
      id: createdPerson._id,
    });
  } catch (error) {
    next(error);
  }
});

app.put('/api/persons/:id', async (req, res, next) => {
  try {
    await persons.validateNumber({ number: req.body.number });
    const updatedPerson = await persons.update(
      req.params.id,
      'number',
      req.body.number
    );
    res.send(updatedPerson);
  } catch (err) {
    console.log('PUT error: ', err);
    next(err);
  }
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

// handler of requests with unknown endpoint
app.use(unknownEndpoint);

// handler of requests with result to errors
const errorHandler = (error, req, res, next) => {
  console.log('errorHandler');
  console.error(error.name);
  if (error.name === 'ValidationError') {
    res.status(400).send(error);
  } else if (error.statusCode) {
    console.log('statusCode:', error.statusCode);
    res.status(error.statusCode).send({ error: `${error.reason}` });
  } else {
    res.status(500).send({ error: `${error.reason}` });
  }

  next(error);
};
app.use(errorHandler);
