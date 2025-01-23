const User = require('../models/User')
const OTP = require('../models/OTP');
const otpgen = require("otp-generator")

exports.SendOtp = async(req,res)=>{
    try{
        // fetch the emial
        const {email} = req.body;

        // check if the email already exists
        const checkEmail = await User.findOne({email});
        if(checkEmail){
            return res.status(401).json({
                success: false,
                message :"User already exists"
            })
        }

        // generate otp
        let otp;
        do {
            otp = otpgen.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
        } while (await OTP.exists({ otp })); // Assuming OTP is a model that stores generated OTPs

        // create entry in database
        const otpbody = await OTP.create({
            email: email,
            otp: otp
        });

        res.status(200).json({
            success: true,
            message :"OTP sent successfully"
        })
    }
    catch(err){
        res.status(400).json({
            success: false,
            message :err.message
        });
    }
}

//sendOTP

//signUp

//Login

//changePassword

