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
const {
  registerValidation,
  newMasterPasswordValidation,
} = require("../helpers/validation");
const { func } = require("joi");

const api = process.env.API_URL;

//Sending confirmation mail function
async function SendMail(token, email, name) {
  //url for confirming mail
  const url = `${req.protocol}://${req.get(
    "host"
  )}/${api}/register/verify-user/${token}`;

  //body of the mail
  const body = `
  <body style="background-color:#EEEEEE;border-radius:20px">
    <div style="margin:20px;display:flex;flex-direction:row;flex-wrap: wrap;justify-content: space-around;">
      <h3 style="color:#3A4043">Key Secure</h3>
      <img src="https://github.com/alokhegde2/key-secure/raw/main/images/logo.svg" alt="" width="50px">
    </div>
    <div style="margin:10px;border:5px solid #859AFF">
      <center>
        <h4 style="color:#3A4043">Hi ${name},</h4>
        <p style="color:#363636">You have successfully created a Key Secure account,<br/>Please click on the link below to verify your email<br/> address and complete your registration</p>
    <br/>
    <a href="${url}"><button style="background-color:#768bf5;border:none;padding:10px;margin-bottom:10px;color:white;border-radius:5px;cursor:pointer">Verify your email</button></a><br/>
    <small style="color:#7d7d7d">or copy and paste this link into your browser:</small><br/>
    <a href="${url}"style="font-size:12px;color:#76a0f5;">${url}</a><br/><br/>
    <small style="color:#7d7d7d;">Didn't create a Key Seure account? It's likely someone just typed in your email<br/>address by accident.Feel free to ignore this email</small><br/><br/>
      </center>
    </div>
    <div style="margin:20px;display:flex;flex-direction:row;flex-wrap: wrap;justify-content: space-around;">
      <small style="color:#3A4043">&copy 2021 Key Secure</small>
      <small style="color:#7d7d7d;">Follow us on <a href="https://github.com/alokhegde2/" style="color:#7d7d7d;">Github</a></small>
    </div>
    </body>
  `;

  //Admin mail and password
  const admin_mail = process.env.MAIL_ID;
  const admin_pass = process.env.PASSWORD;
  console.log(admin_mail, admin_pass);

  let transporter = nodemailer.createTransport({
    // host: "mail.google.com",
    service: "Gmail",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: admin_mail, // generated gmail user
      pass: admin_pass, // generated gmail password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: `"Key Secure"  <${admin_mail}>`, // sender address
    to: `${email}`, // list of receivers
    subject: "Please confirm your account", // Subject line
    html: body, // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

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
    SendMail(token, req.body.email, req.body.name);
    res.status(200).send({ message: "User registered successfully" });
  } catch (error) {
    res.status(400).send(error);
  }
});

/*Add the master password*/
router.put("/new-master-pass/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "User not found" });
  }

  const { error } = newMasterPasswordValidation(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  //Hashing the masterPassword
  //creating salt for hashing
  const salt = await bcrypt.genSalt(10);
  const hashedMasterPassword = await bcrypt.hash(req.body.masterPassword, salt);

  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      masterPassword: hashedMasterPassword,
    },
    { new: true }
  );

  if (!user) {
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
