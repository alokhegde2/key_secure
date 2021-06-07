const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const User = require("../models/user_model");
const {
  registerValidation,
  loginValidation,
  newMasterPasswordValidation,
} = require("../helpers/validation");
const { required } = require("joi");

//All user routes goes here

//Register the new user
router.post("/register", async (req, res) => {
  //Validating the data before creating the user

  const { error } = registerValidation(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
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
    res.status(200).send({ message: "User registered successfully" });
  } catch (error) {
    res.status(400).send(error);
  }
});

//Add the master password
router.put("/new-master-pass/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "User not found" });
  }

  const { error } = newMasterPasswordValidation(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  //Hashing the masterPassword
  //creating salt for hashing
  const salt = await bcrypt.genSalt(10);
  const hashedMasterPassword = await bcrypt.hash(req.body.masterPassword, salt);

  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      masterPassword: hashedMasterPassword,
    },
    { new: true }
  );

  if (!user) {
    return res
      .status(400)
      .json({ message: "Master password cannot be created" });
  } else {
    return res.status(200).json({ message: "Master password created" });
  }
});

//Exporting the user module
module.exports = router;
