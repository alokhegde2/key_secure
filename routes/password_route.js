const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const path = require("path");

//importing dotenv
require("dotenv/config");

//importing models
const Password = require("../models/password_model");
const User = require("../models/user_model");
//importing verify middleware
const verify = require("../helpers/verify_token");
//importing validation
const {newPassword} = require("../helpers/validation");
//importing pagination middleware
const paginatedResults = require("../helpers/pagination");

//api url
const api = process.env.API_URL;

//All password routes goes here

//Creating new password
router.post("/new-password",verify,async (req,res) => {
    //validating user inputs

    const {error} = newPassword(req.body);

    //if there is any error
    if(error){
        return res.status(400).json({message:`${error.details[0].message}`})
    }

    //verifying user_id
    //checking for user_id validity
    if(!mongoose.isValidObjectId(req.body.userId)){
        return res.status(400).json({message:"Invalid User Id"});
    }

    const user = await User.findById(req.body.userId);

    //if user not found 
    if(!user){
        return res.status(400).json({message:"User not found"})
    } 

    //if user found
    //now we need image to the password
    //these images are available at  `${req.protocol}://${req.get("host")}/${api}/images/alp_icons/${starting_letter}.png
    const title = req.body.title;

    //to get first charecter
    const first_char = title[0].toUpperCase();

    //image path is
    const image_path = `${req.protocol}://${req.get("host")}${api}/static/images/alp_icons/${first_char}.png`

    //if there is no error
    const password = Password({
        title:req.body.title,
        username:req.body.username,
        password:req.body.password,
        emailId:req.body.emailId,
        category:req.body.category,
        image: image_path,
        note: req.body.note,
        userId: req.body.userId
    });

    try {
        savedPassword = await password.save();
        return res.status(200).json({message:"Password Created Successfully"});
    } catch (error) {
        return res.status(400).json({message:`${error}`});
    }
});


//TO get all passwords of the user
router.get("/get-password/:userId",verify,paginatedResults(Password),async (req,res) => {
    res.json(res.paginatedResults);
});


//Exporting the password module
module.exports = router;