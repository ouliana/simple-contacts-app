const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();
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
app.use(express.static('build'));

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

let persons = [
  {
    id: 1,
    name: 'Arto Hellas',
    number: '040-123456',
  },
  {
    id: 2,
    name: 'Ada Lovelace',
    number: '39-44-5323523',
  },
  {
    id: 3,
    name: 'Dan Abramov',
    number: '12-43-234345',
  },
  {
    id: 4,
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
  },
];

app.get('/info', (request, response) => {
  const info = `Phonebook has info for ${
    persons.length
  } people<br>${new Date()}`;
  response.send(info);
});

app.get('/api/persons', (request, response) => {
  response.json(persons);
});

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);

  const person = persons.find(p => p.id === id);

  console.log(person);

  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter(p => p.id !== id);

  response.status(204).end();
});

const generateId = () => {
  let min = 100;
  let max = 1000;
  let id = Math.floor(Math.random() * (max - min)) + min;
  while (persons.find(p => p.id === id)) {
    id = Math.floor(Math.random() * (max - min)) + min;
  }
  return id;
};

const handleError = ({ name, number }) => {
  if (!name) return { error: 'no name received' };
  if (!number) return { error: 'no number received' };
  if (persons.find(p => p.name === name))
    return {
      error: 'name must be unique',
    };
  return null;
};

app.post('/api/persons', (request, response) => {
  const body = request.body;

  let error = handleError(body);

  if (error) {
    response.status(400).send(error);
  } else {
    const id = generateId();

    const person = {
      id: id,
      name: body.name,
      number: body.number,
    };

    persons = persons.concat(person);

    response.json(person);
  }
});
