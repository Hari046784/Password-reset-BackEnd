const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const passwordComplexity = require('joi-password-complexity');



const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        required: "Email is mandatory"
    },
    contactNumber: {
        type: String,
        trim: true
    },
    password: {
        type: String,
        required: true
    }
});

userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({_id: this._id}, 
        process.env.SECRET_KEY, {
        expiresIn: "2d",
    });
    return token;
};

const User = mongoose.model("User", userSchema);

const validate = (data) => {
    const schema = Joi.object({
        name: Joi.string().required().label("Name"),
        email: Joi.string().email().label("Email"),
        contactNumber: Joi.string().required().label("ContactNumber"),
        password: passwordComplexity().required().label("Password"),
    });
    return schema.validate(data);
};
console.log("validate:", validate);

module.exports = {User, validate};