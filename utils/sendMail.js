const nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

module.exports = async (email, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            service: process.env.SERVICE,
            port: 587,
            secure: true,
            auth: {
                user: process.env.USER,
                pass: process.env.PASS,
            },
        });
    
        await transporter.sendMail({
            from: process.env.USER,
            to: email,
            subject: subject,
            text: text,
        });
        console.log("Message: Mail Sent Sucessfully");

    } catch (error) {
        console.log("Mail Not Send Successfully", error);
    };
};