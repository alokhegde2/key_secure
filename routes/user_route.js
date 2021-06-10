const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

//importing dotenv
require("dotenv/config");

//Importing user model
const User = require("../models/user_model");
//importing verify package to verify
const verify = require("../helpers/verify_token");

//File upload functionality
//Alowed file type
const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("Invalid Image Type");
    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "./public/uploads");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });

const api = process.env.API_URL;

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

//To update the user details
//which excludes password,masterPassword,authtype,status,id,also email
//which includes Name,avatar
router.put(
  "/update/:id",
  verify,
  uploadOptions.single("avatar"),
  async (req, res) => {
    //validating user id
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    //to get user details
    const user = await User.findOne({ _id: req.params.id });

    //if user not found
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    //finding if file present in request or not
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "No image in the request" });
    }

    //url of the user avatar
    const avatar_url = user.avatar;

    //Getting the name of the file in request
    const fileName = req.file.filename;

    //Base path url for the image/avatar
    const basePath = `${req.protocol}://${req.get(
      "host"
    )}${api}/static/uploads/`;

    //Updating user name and avatar
    const updated_user = await User.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        avatar: `${basePath}${fileName}`,
      },
      { new: true }
    );

    //if user is not upadted
    if (!updated_user) {
      return res.status(400).json({ message: "User is not updated" });
    }

    //if user is updated it will also update the avatar
    //if only user name is updated there will be duplicate entry of the avatar
    //to delete the older entry,
    //we are split the url in "/" and it devide url in to 8 array element
    //7th position is the image name
    const image_name = avatar_url.split("/")[7];

    //Here we are finding path of the image
    //using it we can delete it
    const image_path = path.join(
      __dirname,
      "../",
      `/public/uploads/${image_name}`
    );

    //we are trying to delete the older entry
    //by using fs.unlink()
    try {
      fs.unlinkSync(image_path);
      //file removed
    } catch (err) {
      return res.status(400).json({ message: "Old avatar not deleted" });
    }
    return res.status(200).json({ message: "User updated" });
  }
);

//Exporting login user
module.exports = router;
