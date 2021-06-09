const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");

//importing dot env
require("dotenv/config");

//initializing api
//which is the initial route of api
const api = process.env.API_URL;

//Initializing app
const app = express();

//Routes
const registerUserRoute = require("./routes/register_user");
const passwordRoute = require("./routes/password_route");

//CORS
app.use(cors());
app.options("*", cors());

//Middlewares
//Middleware to serve static files
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(morgan("tiny"));

//All route middlewares goes here
app.use(`${api}/user/register/`, registerUserRoute);
app.use(`${api}/password`, passwordRoute);
//http://localhost:3000/api/v2/static/images/alp_icons/A.png   --- to get the image
app.use(`${api}/static`, express.static('public'));

//Connecting to mongodb database
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "Key-Secure-v2",
  })
  .then(() => {
    console.log("Database connection is ready");
  })
  .catch((err) => {
    console.log(err);
  });

//Initializing port
const port = process.env.PORT || 3000;

//Running server
app.listen(port, () => {
  console.log(`Server is running at port ${port} ...`);
});
