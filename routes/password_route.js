const express = require('express');
const router = express.Router();


//All password routes goes here

router.get('/all-pass',(req,res) =>{
    res.send("Gives all the password")
});


//Exporting the password module
module.exports = router;