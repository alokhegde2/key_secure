const nodemailer = require("nodemailer");
const path = require("path");
//importing dot env
require("dotenv/config");

const api = process.env.API_URL;

//Sending confirmation mail function
module.exports = async function SendMail(
  token,
  email,
  name,
  bodyType,
  request
) {
  //url for confirming mail
  const url = `${request.protocol}://${request.get(
    "host"
  )}${api}/user/register/verify-user/${token}`;

  //url for reset password page
  const reset_url = `${request.protocol}://${request.get(
    "host"
  )}${api}/user/login/forgot-pass/reset/${token}`;

  //mail body dictionary
  const mailBody = {
    confirm: `
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
    `,
    forgot: `
    <body style="background-color:#EEEEEE;border-radius:20px">
  <center>
    <h1 style="font-family:Times New Roman;">Key Secure</h1>
  </center>
      <div style="margin:10px;border:5px solid #859AFF">
        <center>
          <h2 style="color:#3A4043;font-family:Times New Roman;">Password Reset</h2>
          <p style="color:#363636;font-family:Times New Roman;">If you've lost your password or wish to reset it,<br/>use the link below to get started</p>
      <br/>
      <a href="${reset_url}"><button style="background-color:#768bf5;border:none;padding:10px;margin-bottom:10px;color:white;border-radius:5px;cursor:pointer;font-family:Times New Roman;font-weight:bold">Reset Your Password</button></a><br/>
      <small style="color:#7d7d7d;">If you did not request a password reset,you can safely ignore this email. Only<br/>a person with access to your email can reset your account password</small><br/><br/>
        </center>
      </div>
      <div style="margin:20px;display:flex;flex-direction:row;flex-wrap: wrap;justify-content: space-around;">
        <small style="color:#3A4043">© 2021 Key Secure</small>
        <small style="color:#7d7d7d;">Follow us on <a href="https://github.com/alokhegde2/" style="color:#7d7d7d;">Github</a></small>
      </div>
      </body>
    `,
  };

  //DIctionary for mail subject
  const mailSubject = {
    confirm: "Please confirm your account",
    forgot: "Link to reset your password",
  };

  //body of the mail
  const body = mailBody[bodyType];

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
    subject: `${mailSubject[bodyType]}`, // Subject line
    html: body, // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
};
