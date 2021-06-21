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
const { newCategory, updateCategory } = require("../helpers/validation");

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

  //check for category name already present or not
  const category_name = category.name.toLowerCase();
  const entered_name = req.body.name.toLowerCase();
  if (category_name == entered_name) {
    return res.status(400).json({ message: "Category name already exist" });
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

//getting all categories of the specific user
router.get("/get-category/:user_id", verify, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.user_id)) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  //Checking for user is present or not
  const user = await User.findOne({ _id: req.params.user_id });

  //if user not there
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  //if user present
  //get the categories on the basis of user id
  const category = await Category.find({ user_id: req.params.user_id });

  //if category not present/not found
  if (!category) {
    return res.status(400).json({ message: "Category not found" });
  }

  //if category is present
  return res.status(200).json({ category: category });
});

//Updating the category
router.put("/update-category/:id", verify, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid category id" });
  }

  //if id is valid
  //check for the entered data are valid
  const { error } = updateCategory(req.body);

  //if error found during validtion
  if (error) {
    return res.status(400).json({ message: `${error.details[0].message}` });
  }

  //if there is no error
  //check the category present or not
  const category = await Category.findById(req.params.id);

  //if category is not present
  if (!category) {
    return res.status(400).json({ message: "Category not found" });
  }

  //if category present
  //check for category name already present or not
  const category_name = category.name.toLowerCase();
  const entered_name = req.body.name.toLowerCase();
  if (category_name == entered_name) {
    return res.status(400).json({ message: "Category name already exist" });
  }

  //update the password
  const updatedCategory = await Category.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      icon: req.body.icon,
      color: req.body.color,
    },
    { new: true }
  );

  //if category is not updated
  if (!updatedCategory) {
    return res.status(400).json({ message: "Category is not updated" });
  }
  return res.status(200).json({ message: "Category updated successfully" });
});

module.exports = router;
