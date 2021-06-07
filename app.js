const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");

//Initializing app
const app = express();

//All routes goes here

app.get('/',(req,res)=>{
    res.send("Hello from server")
})

//Initializing port
const port = 3000;

//Running server
app.listen(port,()=>{
    console.log(`Server is running at port ${port} ...`)
})