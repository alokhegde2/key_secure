const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const path = require("path");

//importing dotenv
require("dotenv/config");

//Importing user model
const User = require("../models/user_model");
//Importing mail module
const Mail = require("../helpers/mail");
//importing verify package to verify
const verify = require("../helpers/verify_token");

const {
  loginValidation,
  resetMasterPasswordValidation,
} = require("../helpers/validation");

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

  //Checking if user created the master password
  if (user.masterPassword == "") {
    return res.status(400).json({ message: "Master Password is not created." });
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
  return res.status(200).header("auth-token", token).json({authToken:token});
});

//verifing master password
router.post("/verify-master/:id", async (req, res) => {
  //to verify the entered id is correct or not
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  //Finding the user
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

//Forgot Password route
router.post("/forgot-pass", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(400).json({ message: "Email not found" });
  }

  //Sending password reset mail
  Mail(user.id, user.email, user.name, "forgot", req);

  return res.status(200).json({ message: "Reset mail sent" });
});

//password resetting route
router.get("/forgot-pass/reset/:id", (req, res) => {
  return res.sendFile(
    path.join(__dirname, "../", "/public/templates/auth/forgot-pass/index.html")
  );
});

//updating password
router.post("/forgot-pass/reset", async (req, res) => {
  //to verify the entered id is correct or not
  if (!mongoose.isValidObjectId(req.body.id)) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  //Getting the user details using id
  const user = await User.findOne({ _id: req.body.id });

  //if user not found
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  //checking for entered mail and original mail
  if (req.body.email !== user.email) {
    return res.status(400).json({ message: "Incorrect email id" });
  }

  //Hashing the password
  //creating salt for hashing
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);

  //Updating the password
  const updatedUser = await User.findByIdAndUpdate(
    req.body.id,
    {
      hashedPassword: hashPassword,
    },
    { new: true }
  );

  //checking for is password updated or not
  if (!updatedUser) {
    return res.status(400).json({ message: "Unable to reset password" });
  }

  return res.status(200).json({ message: "Password updated successfully" });
});

//Forgot master pass
router.post("/forgot-master-pass", verify, async (req, res) => {
  //checking for correctness of the user id
  if (!mongoose.isValidObjectId(req.body.id)) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  const { error } = resetMasterPasswordValidation(req.body);

  if (error) {
    console.log(error);
    return res.status(400).json({ message: "Invalid Master Password" });
  }

  //finding user using user id
  const user = await User.findOne({ _id: req.body.id });

  //if user not found
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  //Comparing the mails
  if (req.body.email !== user.email) {
    return res.status(400).json({ message: "Incorrect mail id" });
  }

  //comparing the passwords
  const passwordMatch = await bcrypt.compare(
    req.body.password,
    user.hashedPassword
  );

  //if passwords not match
  if (!passwordMatch) {
    return res.status(400).json({ message: "Incorrect password" });
  }

  //Hashing the masterPassword
  //creating salt for hashing
  const salt = await bcrypt.genSalt(10);
  const hashedMasterPassword = await bcrypt.hash(req.body.masterPassword, salt);

  //Updating the master password
  const updated_master = await User.findByIdAndUpdate(
    req.body.id,
    {
      masterPassword: hashedMasterPassword,
    },
    { new: true }
  );

  //if password is not updated
  if (!updated_master) {
    return res.status(400).json({ message: "Master Password is not updated" });
  }

  //if password is updated
  return res.status(200).json({ message: "Master password updated" });
});

//Exporting login user
module.exports = router;
