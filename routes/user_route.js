const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user_model");
const {
  registerValidation,
  loginValidation,
  masterPasswordValidation,
} = require("../helpers/validation");

//All user routes goes here

//Register the new user
router.post("/register", async (req, res) => {
  //Validating the data before creating the user

  const { error } = registerValidation(req.body);
  if (error) {
    return res.status(400).json({"message":error.details[0].message});
  }

  //Checking if email is already exist in the database
  const emailExist = await User.findOne({ email: req.body.email });

  if (emailExist) {
    return res.status(400).json({ message: "Email already exist" });
  }

  //Hashing the password
  //creating salt for hashing
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);

  //reciving all data in body

  let user = new User({
    name: req.body.name,
    email: req.body.email,
    hashedPassword: hashPassword,
    authType: req.body.authType,
  });

  try {
    savedUser = await user.save();
    res.status(200).send({ userId: user.id });
  } catch (error) {
    res.status(400).send(error);
  }
});

//Exporting the user module
module.exports = router;
