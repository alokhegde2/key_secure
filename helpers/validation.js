const Joi = require("joi");

//Register validation

const registerValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2),
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(6).required(),
    authType: Joi.string().required(),
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
    masterPassword: Joi.string().min(6).max(20),
  });

  return schema.validate(data);
};

const resetMasterPasswordValidation = (data) => {
  const schema = Joi.object({
    id: Joi.string(),
    email: Joi.string().max(20).min(5),
    password: Joi.string().min(6).max(20),
    masterPassword: Joi.string().min(6).max(20),
  });
  return schema.validate(data);
};

const changePassword = (data) => {
  const schema = Joi.object({
    password: Joi.string().max(20).min(6),
    newPassword: Joi.string().max(20).min(6),
  });
  return schema.validate(data);
};

const changeMasterPassword = (data) => {
  const schema = Joi.object({
    masterPassword: Joi.string().max(20).min(6),
    newMasterPassword: Joi.string().max(20).min(6),
  });
  return schema.validate(data);
};


//PASSWORD VALIDATION

//new password validation
const newPassword = (data) => {
  const schema = Joi.object({
    title: Joi.string().max(20).min(2).required(),
    username: Joi.string().allow(null,""),
    password: Joi.string().allow(null,"").max(20).min(6),
    emailId: Joi.string().allow(null,"").email(),
    category : Joi.string().required(),
    note: Joi.string().allow(null,"").default(""),
    image: Joi.string().allow(null,""),
    userId: Joi.string().required(),
  });
  return schema.validate(data);
};

//password updation
const updatedPassword = (data) => {
  const schema = Joi.object({
    title: Joi.string().max(20).min(2).required(),
    username: Joi.string().allow(null,""),
    password: Joi.string().allow(null,"").max(20).min(6),
    emailId: Joi.string().allow(null,"").email(),
    category : Joi.string().required(),
    note: Joi.string().allow(null,"").default(""),
    image: Joi.string().allow(null,""),
  });
  return schema.validate(data);
}

//Exporting modules
module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.newMasterPasswordValidation = newMasterPasswordValidation;
module.exports.resetMasterPasswordValidation = resetMasterPasswordValidation;
module.exports.changePassword = changePassword;
module.exports.changeMasterPassword = changeMasterPassword;
module.exports.newPassword = newPassword;
module.exports.updatedPassword = updatedPassword;
