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
//importing verify package to verify
const verify = require("../helpers/verify_token");

//All routes goes here

//To get the user details
router.get("/get-user/:id", verify, async (req, res) => {
  //validating user id
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  //Getting user details using userid
  //Which excludes hashedPassword,masterPassword and confirmationCode
  const user = await User.findById(req.params.id)
    .select("-hashedPassword")
    .select("-masterPassword")
    .select("-confirmationCode");

  //If user not found
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  //return the user data
  return res.status(200).send(user);
});

//Exporting login user
module.exports = router;
