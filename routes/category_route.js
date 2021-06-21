const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const path = require("path");

//importing dotenv
require("dotenv/config");

//importing models
const Category = require("../models/category_model");
const User = require("../models/user_model");
//importing verify middleware
const verify = require("../helpers/verify_token");
//importing validation
const { newCategory } = require("../helpers/validation");

//All routes goes here

//creating new category
router.post("/new-category", verify, async (req, res) => {
  //to verify user id valid or not
  if (!mongoose.isValidObjectId(req.body.user_id)) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  //check user id is valid or not
  //or checking for the user exist or not
  const user = await User.findById(req.body.user_id);

  //Validating the user inputs
  const { error } = newCategory(req.body);

  //handling error
  if (error) {
    return res.status(400).json({ message: `${error.details[0].message}` });
  }

  //if user not present
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  //Creating new categorys
  const new_category = new Category({
    name: req.body.name,
    icom: req.body.icon,
    color: req.body.color,
    user_id: req.body.user_id,
  });

  //saving data to db
  try {
    savedCategory = await new_category.save();
    return res.status(200).json({ message: "Category created successfully" });
  } catch (error) {
    return res.status(400).json({ message: error });
  }
});

module.exports = router;
