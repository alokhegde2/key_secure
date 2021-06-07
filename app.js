const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require('cors');

//importing dot env
require("dotenv/config");

//initializing api 
//which is the initial route of api
const api = process.env.API_URL;

//Initializing app
const app = express();

//Routes
const userRoute = require("./routes/user_route");
const passwordRoute = require("./routes/password_route");

//CORS
app.use(cors())
app.options('*',cors())

//Middlewares
app.use(bodyParser.json());
app.use(morgan("tiny"));

//All route middlewares goes here

app.use(`${api}/user`,userRoute);
app.use(`${api}/password`,passwordRoute);

//Initializing port
const port = 3000;

//Running server
app.listen(port,()=>{
    console.log(`Server is running at port ${port} ...`)
})