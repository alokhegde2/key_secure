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
const { newPassword, updatedPassword } = require("../helpers/validation");
//importing pagination middleware
const paginatedResults = require("../helpers/pagination");

//api url
const api = process.env.API_URL;

//image path initialization
var image_path;

//All password routes goes here

//Creating new password
router.post("/new-password", verify, async (req, res) => {
    //validating user inputs

    const { error } = newPassword(req.body);

    //if there is any error
    if (error) {
        return res.status(400).json({ message: `${error.details[0].message}` })
    }

    //verifying user_id
    //checking for user_id validity
    if (!mongoose.isValidObjectId(req.body.userId)) {
        return res.status(400).json({ message: "Invalid User Id" });
    }

    const user = await User.findById(req.body.userId);

    //if user not found 
    if (!user) {
        return res.status(400).json({ message: "User not found" })
    }

    //if user found
    //now we need image to the password
    //these images are available at  `${req.protocol}://${req.get("host")}/${api}/images/alp_icons/${starting_letter}.png
    const title = req.body.title;

    //to get first charecter
    const first_char = title[0].toUpperCase();

    //checking for image url present in body
    //if not there
    var data = [`affinity`, `amazon`, `applepay`, `behance`, `digitalocean`, `docker`, `dribbble`, `dropbox`, `facebook`, `github`, `google`, `gpay`, `instagram`, `linkedin`, `medium`, `messenger`, `microsoft`, `netflix`, `paypal`, `pinterest`, `prime`, `sketch`,`skype`, `slack`, `snapchat`, `spotify`, `stackoverflow`, `tumbler`, `twitch`, `twitter`, `whatsapp`, `wordpress`, `youtube`, `other`]
    if (req.body.image == null || req.body.image == "") {
        if (data.find(e => e == title.toLowerCase().split(" ").join(""))) {
            image_path = `${req.protocol}://${req.get("host")}${api}/static/images/icons/${title.toLowerCase().split(" ").join("")}.png`
        } else {
            image_path = `${req.protocol}://${req.get("host")}${api}/static/images/alp_icons/${first_char}.png`;
        }
    } else {
        image_path = req.body.image;
    }

    //image path is

    //if there is no error
    const password = Password({
        title: req.body.title,
        username: req.body.username,
        password: req.body.password,
        emailId: req.body.emailId,
        category: req.body.category,
        image: image_path,
        note: req.body.note,
        userId: req.body.userId
    });

    try {
        savedPassword = await password.save();
        return res.status(200).json({ message: "Password Created Successfully" });
    } catch (error) {
        return res.status(400).json({ message: `${error}` });
    }
});


//TO get all passwords of the user
router.get("/get-password/:userId", verify, paginatedResults(Password), async (req, res) => {
    res.json(res.paginatedResults);
});


//To get a single password
//Using userId and passwordId
router.get("/get-single-password/:passId", verify, async (req, res) => {
    //verify the object id's
    //passId validation
    if (!mongoose.isValidObjectId(req.params.passId)) {
        return res.status(400).json({ message: "Invalid password id" });
    }

    //checking for the requested password is present or not
    const password = await Password.findById(req.params.passId);

    //if password is not present 
    if (!password) {
        return res.status(400).json({ message: "Password not found" });
    }

    //if password present
    //return the password
    return res.status(200).json({ result: password })
});


//To update the single password
router.put('/update-password/:passId', verify, async (req, res) => {
    //Validting password id
    if (!mongoose.isValidObjectId(req.params.passId)) {
        return res.status(400).json({ message: "Invalid password id" });
    }

    //if password id is valid
    //now verify the req body
    const { error } = updatedPassword(req.body);

    //if there is any error
    if (error) {
        return res.status(400).json({ message: `${error.details[0].message}` })
    }

    //checking for image url present in body
    //if not there
    const title = req.body.title;

    //to get first charecter
    const first_char = title[0].toUpperCase();

    //checking for image url present in body
    //if not there
    var data = [`affinity`, `amazon`, `applepay`, `behance`, `digitalocean`, `docker`, `dribbble`, `dropbox`, `facebook`, `github`, `google`, `gpay`, `instagram`, `linkedin`, `medium`, `messenger`, `microsoft`, `netflix`, `paypal`, `pinterest`, `prime`, `sketch`, `slack`, `snapchat`, `spotify`, `stackoverflow`, `tumbler`, `twitch`, `twitter`, `whatsapp`, `wordpress`, `youtube`, `other`]
    if (req.body.image == null || req.body.image == "") {
        if (data.find(e => e == title.toLowerCase().split(" ").join(""))) {
            image_path = `${req.protocol}://${req.get("host")}${api}/static/images/icons/${title.toLowerCase().split(" ").join("")}.png`
        } else {
            image_path = `${req.protocol}://${req.get("host")}${api}/static/images/alp_icons/${first_char}.png`;
        }
    } else {
        image_path = req.body.image;
    }


    //if all data are correct 
    //now we can update password
    const updatedPass = await Password.findByIdAndUpdate(req.params.passId, {
        title: req.body.title,
        username: req.body.username,
        password: req.body.password,
        emailId: req.body.emailId,
        category: req.body.category,
        image: image_path,
        note: req.body.note,
    }, { new: true });

    //check for updated or not 
    //if not updated
    if (!updatedPass) {
        return res.status(400).json({ message: "Password is not updated" });
    }

    //if updated
    return res.status(200).json({ message: "Password updated " })
});

//To toggle isImportant of password
router.put('/update-password/important/:passId', verify, async (req, res) => {
    //Validting password id
    if (!mongoose.isValidObjectId(req.params.passId)) {
        return res.status(400).json({ message: "Invalid password id" });
    }

    const updatePassword = await Password.findByIdAndUpdate(
        req.params.passId,
        {
            isImportant: req.body.isImportant,
        },
        { new: true }
    );

    //if password is not updated
    if (!updatePassword) {
        return res.status(400).json({ message: "Unable to add/remove from important" });
    }

    return res.status(200).json({ message: "Added/Removed from important" });
});


//To delete the single password
router.delete('/delete-password/:passId', verify, async (req, res) => {
    //Validting password id
    if (!mongoose.isValidObjectId(req.params.passId)) {
        return res.status(400).json({ message: "Invalid password id" });
    }

    const deletedPassword = await Password.findByIdAndRemove(req.params.passId);

    //checking for password deleted or not
    if (!deletedPassword) {
        return res.status(400).json({ message: "Password is not deleted" });
    }
    //if deleted
    return res.status(200).json({ message: "Password deleted" });
});


//To delete many passwords
router.delete('/delete-passwords', verify, async (req, res) => {
    //Getting all ids need to be deleted
    const data = req.body.id;

    //deleting all records selected

    const deletedPasswords = await Password.deleteMany({
        _id: {
            $in: data
        }
    });

    //checking for deleted or not 
    if (!deletedPasswords) {
        return res.status(400).json({ message: "Passwords are not deleted" })
    }

    return res.status(200).json({ message: "Passwords Deleted" })

});


//Exporting the password module
module.exports = router;