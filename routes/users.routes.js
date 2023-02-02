const express = require('express');
const { validate, User } = require('../model/user.model');
const router = express.Router();
const bcrypt = require('bcrypt');



//SignUp
router.post("/signup", async (req, res) => {

    try{
        const {error} = validate(req.body);
    if (error){
        return res.status(400).send({
            message: error.details[0].message
        });
    };

    let user = await User.findOne({email: req.body.email});
    if(user){
        return res.status(400).send({
            message: "User given email Id is already exist"
        });
    };

    const salt = 10;
    const hashPassword = await bcrypt.hash(req.body.password, salt);
    console.log("Hashpassword:",hashPassword);

    user = await new User ({...req.body, password: hashPassword}).save();
    console.log("user:",user);

    res.status(201).send({
        message: "User Sign Up successfully"
    });
    }catch (error) {
        res.status(500).send({
            message: "Internal Server Error"
        });
    };

});

module.exports = router;