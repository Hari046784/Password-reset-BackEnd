const express = require('express');
const router = express.Router();
const {User} = require("../model/user.model");
const bcrypt = require('bcrypt');



//Sign In function
router.post("/signin", async (req, res) => {
    try {
        const {error} = req.body;
    if(error){
        return res.status(400).send({
            message: error.details[0].message
        });
    };

    const user = await User.findOne({email: req.body.email});
    if(!user){
        return res.status(400).send({
            message: "Invalid Email or Password"
        });
    };

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
        return res.status(400).send({
            message: "Invalid Email or Password"
        });
    };

    const token = user.generateAuthToken();
    res.status(200).send({
        data: token,
        message: "Signed in successfully"
    });
    } catch(error) {
        res.status.send({
            message: "Internal Server Error"
        });
    };

});

module.exports = router;