const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

//importing dotenv
require("dotenv/config");

//Importing user model
const User = require("../models/user_model");

const { loginValidation } = require("../helpers/validation");

//All routes goes here
router.post("/", async (req, res) => {
  //Validating user details
  const { error } = loginValidation(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  //Finding that email id is present or not
  const user = await User.findOne({ email: req.body.email });

  //if user not found
  if (!user) {
    return res.status(400).json({ message: "Email not found" });
  }

  //If user not verified they are not able to login
  if (user.status == "Pending") {
    return res.status(400).json({ message: "User is not verified" });
  }

  //comparing two passwords one is user entered and another one is the actual password
  const validPass = await bcrypt.compare(
    req.body.password,
    user.hashedPassword
  );
  
  //If passwords do not match
  if (!validPass) {
    return res.status(400).json({ message: "Invalid password" });
  }

  //importing secret password
  const secret = process.env.SECRET;

  //Creating jwt
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    secret,
    { expiresIn: "7d" }
  );

  //returning succes with header auth-token
  return res.status(200).header("auth-token", token).send(token);
});

//verifing master password
router.post("/verify-master/:id", async (req, res) => {
  console.log(req.params.id);
  //Finding th user
  const user = await User.findOne({ _id: req.params.id });

  //if user not found it will return error
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  //Check for password correctness
  //compares user entered master pass and actual master pass
  const verifyMaster = await bcrypt.compare(
    req.body.masterPassword,
    user.masterPassword
  );

  //If password does't match
  if (!verifyMaster) {
    return res.status(400).json({ message: "Incorrect Master password" });
  }

  //if password correct
  res.status(200).json({ message: "Correct master pass" });
});

//Exporting login user
module.exports = router;
