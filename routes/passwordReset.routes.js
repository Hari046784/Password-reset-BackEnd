const express = require('express');
const Joi = require('joi');
const { User } = require('../model/user.model');
const router = express.Router();
const Token = require('../model/token.model');
const crypto = require('crypto');
const sendEmail = require('../utils/sendMail');
const passwordComplexity = require('joi-password-complexity');
const bcrypt = require('bcrypt');


//Send password link
router.post("/password-reset", async (req, res)=>{
    
    try {
        const emailSchema = Joi.object({
            email: Joi.string().email().required().label("Email"),
        });
    
        const { error } = emailSchema.validate(req.body);
        if (error) {
            return res.status(400).send({
                message: error.details[0].message
            });
        };
    
        let user = await User.findOne({email: req.body.email});
        if (!user) {
            return res.status(400).send({
                message: "User given email id is does not exist"
            });
        };
    
        let token = await Token.findOne({userId: user._id});
        // console.log("Token:", token);
    
        if (!token) {
           token = await new Token({
            userId: user._id,
            token: crypto.randomBytes(32).toString('hex'),
           }).save();
        };
        // console.log("Token for crypto creation:", token);
    
        const url = `${process.env.BASE_URL}/password-reset/${user._id}/${token.token}/`;
        await sendEmail(user.email, "password Reset", url);
        res.status(200).send({
            message: "Password reset link sent to your email account"
        });
        // console.log("URL for password reset:", url);

    } catch (error) {
        res.status(500).send({
            message: "Internal Server Error"
        });
    };
});

// Verify the URL
router.get("/password-reset/:id/:token", async (req, res) => {
    try {
        const user = await User.findOne({_id: req.params.id});
        if(!user) {
            return res.status(400).send({
                message: "Invalid Link"
            });
        }
        const token = await Token.findOne({
            userId: user._id,
            token: req.params.token,
        });
        console.log("token verfiy url:", token);
        if(!token) {
            return res.status(400).send({
                message: "Invalid Link"
            });
        };
    
        res.status(200).send("Valid Url");
            
        
    } catch (error) {
        res.status(500).send({
            message: "Internal Server error"
        });
    };
});

//Reset Password

router.post("/password-reset/:id/:token", async (req, res) => {
    try {
        const passwordSchema = Joi.object({
            password: passwordComplexity().required().label("Password"),
        });
    
        const {error} = passwordSchema.validate(req.body);
        if(error){
            return res.status(400).send({
                message: error.details[0].message
            });
        };
    
        const user = await User.findOne({_id: req.params.id});
        if (!user) {
            return res.status(400).send({
                message: "Invalid Link"
            });
        }
    
        const token = await Token.findOne({
            userId: user._id,
            token: req.params.token,
        });
        console.log("token:", token);
    
        if(!token) {
            return res.status(400).send({
                message: "Invalide Link"
            });
        };
    
        const salt = 10;
        const hashPassword = await bcrypt.hash(req.body.password, salt);
    
        user.password = hashPassword;
        await user.save();
        await token.remove();
        res.status(200).send({
            message: "Password reset successfully"
        });
    } catch (error) {
        res.status(500).send({
            message: "Internal Server error"
        });
    };
});

module.exports = router;