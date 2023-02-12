const nano = require('nano')(process.env.COUCHDB_URL);

const db = 'persons';

async function createDb(name) {
  try {
    nano.db.create(name);
    console.log(`Database ${name} created`);
  } catch (err) {
    console.log(err.reason);
  }
}

async function insertDocument(item) {
  console.log('insertDocument runs...');
  try {
    const database = nano.use(db);
    const response = await database.insert(item);
    console.log(`Added ${item.name} number ${item.number}`);
  } catch (err) {
    console.log(err.reason);
  }
}

async function insertBulk(documents) {
  console.log('insertBulk(docs) runs...');
  try {
    const database = nano.use(db);
    const response = await database.bulk({ docs: documents });
    console.log(`Documents were added`);
  } catch (err) {
    console.log(err.reason);
  }
}

async function getAll() {
  console.log('getAll runs...');
  try {
    const data = nano.use(db);
    const doclist = await data.list({ include_docs: true });
    doclist.rows.forEach(doc => console.log(doc.doc.content));
  } catch (err) {
    console.log(err.reason);
  }
}

async function getView(ddocName, viewName) {
  try {
    const persons = nano.use(db);
    const body = await persons.view(ddocName, viewName);
    console.log(body.rows);
  } catch (err) {
    console.log(err.reason);
  }
}

if (process.argv.length > 3) {
  const newPerson = {
    name: process.argv[3],
    number: process.argv[4],
  };

  insertDocument(newPerson);
}

// insertNote(newNote)
//   .then(() => console.log('---'))
//   .then(() => getAllNotes())
//   .then(() => console.log('-- SHOW IMPORTANT --'))
//   .then(() => getView('importance_ddoc', 'important'));

getView('person', 'info');
