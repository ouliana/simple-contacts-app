const joi = require('joi');

module.exports = joi.object().keys({
  name: joi.string().min(3).required(),
});
