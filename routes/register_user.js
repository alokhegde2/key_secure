const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const path = require("path");
//importing dot env
require("dotenv/config");

const User = require("../models/user_model");
const Mail = require("../helpers/mail");
const {
  registerValidation,
  newMasterPasswordValidation,
} = require("../helpers/validation");
const { func } = require("joi");

//All user routes goes here

//Register the new user
router.post("/", async (req, res) => {
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

  //Creating confiration route
  const secret = process.env.SECRET;
  //creating token
  const token = jwt.sign({ email: req.body.email }, secret);
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
    confirmationCode: token,
  });

  try {
    savedUser = await user.save();
    Mail(token, req.body.email, req.body.name, "confirm", req);
    res.status(200).send({ message: "User registered successfully" });
  } catch (error) {
    res.status(400).send(error);
  }
});

//check if user is verified or not
router.get("/verify-mail/:email", async (req, res) => {
  //Finding that email id is present or not
  const user = await User.findOne({ email: req.params.email });

  //if user not found
  if (!user) {
    return res.status(400).json({ message: "Email not found" });
  }

  //If user not verified they are not able to login
  if (user.status == "Pending") {
    return res.status(400).json({ message: "Mail is not verified" });
  }
  return res.status(200).json({ message: "Mail is verified" });
});

/*Add the master password*/
router.put("/new-master-pass/:mail", async (req, res) => {
  const { error } = newMasterPasswordValidation(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const user = await User.findOne({ email: req.params.mail });

  //if user not found
  if (!user) {
    return res.status(400).json({ message: "Invalid email" });
  }

  //check for user has already created master pass
  if(user.masterPassword != ""){
    return res.status(400).json({message:"MasterPassword already created"});
  }

  //Hashing the masterPassword
  //creating salt for hashing
  const salt = await bcrypt.genSalt(10);
  const hashedMasterPassword = await bcrypt.hash(req.body.masterPassword, salt);

  const updatedUser = await User.findByIdAndUpdate(
    user.id,
    {
      masterPassword: hashedMasterPassword,
    },
    { new: true }
  );

  if (!updatedUser) {
    return res
      .status(400)
      .json({ message: "Master password cannot be created" });
  } else {
    return res.status(200).json({ message: "Master password created" });
  }
});

//Confirmation email route
router.get("/verify-user/:confirmationCode", async (req, res) => {
  //finding the confirmation code
  //It will return the entire user data whose code is matching
  const user = await User.find({
    confirmationCode: req.params.confirmationCode,
  });

  //declaring the id
  var id;

  //if user not found
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  //finding the user id from the data
  user.forEach(function (fu) {
    //access all the attributes of the document here
    id = fu._id;
  });

  //Updating the status to active
  const updated_user = await User.findByIdAndUpdate(
    id,
    {
      status: "Active",
    },
    { new: true }
  );

  //finding sending update status
  if (!updated_user) {
    return res.status(400).json({ message: "User is not verified" });
  } else {
    return res.status(200).sendFile(
      path.join(__dirname, "../", "/public/templates/auth/verified.html") //If user is verified we are sending html file
    );
  }
});
//Exporting the user module
module.exports = router;
