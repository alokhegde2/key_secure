const Joi = require("joi");

//Register validation

const registerValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2),
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(6).required(),
    authType:Joi.string().required()
  });

  return schema.validate(data);
};

//Login validation error

const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(6).required(),
  });

  return schema.validate(data);
};

//Master Password validation

const newMasterPasswordValidation = (data) => {
  const schema = Joi.object({
    masterPassword: Joi.string().min(4).max(4),
  });

  return schema.validate(data);
};

//Exporting modules
module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.newMasterPasswordValidation = newMasterPasswordValidation;
