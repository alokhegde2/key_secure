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

  const validPass = await bcrypt.compare(
    req.body.password,
    user.hashedPassword
  );

  if (!validPass) {
    return res.status(400).json({ message: "Invalid password" });
  }

  //importing secret password
  const secret = process.env.SECRET;

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

//Exporting login user
module.exports = router;
