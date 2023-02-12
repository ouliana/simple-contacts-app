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
//const persons = nano.use('persons');
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
  persons.getAll(req, res, next);
});

app.get('/api/persons/:id', async (req, res, next) => {
  persons.getById(req, res, next);
});

app.delete('/api/persons/:id', async (req, res, next) => {
  console.log(persons);
  persons.destroy(req, res, next);
});

app.post('/api/persons', async (req, res, next) => {
  const body = req.body;

  if (!(body.name && body.number)) {
    res.status(400).send(error);
  } else {
    const newPerson = {
      name: body.name,
      number: body.number,
    };
    persons.create(newPerson, req, res, next);
  }
});

app.put('/api/persons/:id', async (req, res, next) => {
  persons.update(req, res, next);
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
