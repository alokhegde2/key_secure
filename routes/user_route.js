const express = require('express');
const router = express.Router();


//All user routes goes here

router.get('/:id',(req,res) => {
    res.send("Hello this is user test route")
})

//Exporting the user module
module.exports = router;