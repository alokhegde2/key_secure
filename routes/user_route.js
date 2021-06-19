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
//importing validation
const {
  changePassword,
  changeMasterPassword,
} = require("../helpers/validation");

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

    //if avatar_url is not empty we'll delete it
    //to remove old entries
    if (avatar_url != "") {
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
    }
    return res.status(200).json({ message: "User updated" });
  }
);

//Change password

router.put("/change-pass/:id", verify, async (req, res) => {
  //Validating user id
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invlid object id" });
  }

  //validating inputs
  const { error } = changePassword(req.body);

  //if error
  if (error) {
    return res.status(400).json({ message: `${error.details[0].message}` });
  }

  //getting user details using id
  const user = await User.findOne({ _id: req.params.id });

  //if user not found
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  //if user found
  //check if both the passwords are matching
  const isPasswordMatch = await bcrypt.compare(
    req.body.password,
    user.hashedPassword
  );

  //if password donot match
  if (!isPasswordMatch) {
    return res.status(400).json({ message: "Password are not matching" });
  }

  //if password matches
  //creating salt and hashing the new password
  const salt = await bcrypt.genSalt(10);
  const hashedNewPassword = await bcrypt.hash(req.body.newPassword, salt);

  //update the user password with new password
  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    {
      hashedPassword: hashedNewPassword,
    },
    { new: true }
  );

  //if password is notupdated
  if (!updatedUser) {
    return res.status(400).json({ message: "Password is not updated" });
  }

  //if password is updated
  return res.status(200).json({ message: "Password updated successfuly" });
});

//change master password

router.put("/change-master-pass/:id", verify, async (req, res) => {
  //validating id
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  //validating user inputs
  const { error } = changeMasterPassword(req.body);

  //if any error
  if (error) {
    return res.status(400).json({ message: `${error.details[0].message}` });
  }

  //user inputs validated
  //getting user details
  const user = await User.findOne({ _id: req.params.id });

  //if user not found
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  //if user found
  //check for master password enterd will match
  const isMasterPasswordMatch = await bcrypt.compare(
    req.body.masterPassword,
    user.masterPassword
  );

  //if passwords are not matching
  if (!isMasterPasswordMatch) {
    return res.status(400).json({ message: "Master password is not matching" });
  }

  //if password matched
  //hashing newMasterPassword
  const salt = await bcrypt.genSalt(10);
  const hashedMasterPassword = await bcrypt.hash(
    req.body.newMasterPassword,
    salt
  );

  //updating masterPassword
  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    {
      masterPassword: hashedMasterPassword,
    },
    { new: true }
  );

  //if masterPassword is not updated
  if (!updatedUser) {
    return res.status(400).json({ message: "Master Password not updated" });
  }

  //if master password is updated
  return res
    .status(200)
    .json({ message: "Master password updated successfuly" });
});

//Exporting login user
module.exports = router;
