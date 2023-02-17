const persons = require('../../modules/couch/couchdb').use('persons');

const Joi = require('joi');

const schemaPerson = Joi.object({
  name: Joi.string().min(3).required(),
  number: Joi.string().pattern(/\d{2,3}-\d{5,}/),
});

const schemaNumber = Joi.object({
  number: Joi.string()
    .min(8)
    .pattern(/\d{2,3}-\d{5,}/),
});

exports.validatePerson = person => {
  return schemaPerson.validateAsync(person, { abortEarly: false });
};

exports.validateNumber = number => {
  return schemaNumber.validateAsync(number, { abortEarly: false });
};

exports.create = async person => {
  try {
    const response = await persons.insert(person);
    const doc = await persons.get(response.id);
    return doc;
  } catch (err) {
    console.log('Error in persons.create(): ', err);
    throw new Error(err);
  }
};

exports.getAll = async () => {
  try {
    const body = await persons.view('person', 'all', { include_docs: true });
    return body.rows;
  } catch (err) {
    console.error('Error in persons.getAll(): ', err);
    throw new Error(err);
  }
};

exports.getById = async id => {
  try {
    const doc = await persons.get(id);
    return doc;
  } catch (err) {
    console.error('Error in persons.getById(): ', err);
    throw new Error(err);
  }
};

exports.destroy = async id => {
  try {
    const doc = await persons.get(id);
    console.log(doc._id, doc._rev);
    await persons.destroy(doc._id, doc._rev);
  } catch (err) {
    console.error('Error in persons.destroy(): ', err);
    throw new Error(err);
  }
};

exports.update = async (id, fieldName, newValue) => {
  try {
    const response = await persons.atomic('person', 'inplace', id, {
      field: fieldName,
      value: newValue,
    });
    return response;
  } catch (err) {
    console.error('Error in persons.update(): ', err);
    throw new Error(err);
  }
};
