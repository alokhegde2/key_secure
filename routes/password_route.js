const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const path = require("path");

//importing dotenv
require("dotenv/config");

//importing models
const Password = require("../models/password_model");
const User = require("../models/user_model");
const Category = require("../models/category_model");
//importing verify middleware
const verify = require("../helpers/verify_token");
//importing validation
const {newPassword} = require("../helpers/validation");

//All password routes goes here

//Creating new password
router.post("/new-password",verify,async (req,res) => {

});


//Exporting the password module
module.exports = router;