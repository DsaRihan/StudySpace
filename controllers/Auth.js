const User = require('../models/User')
const OTP = require('../models/OTP');
const otpgen = require("otp-generator")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

//sendOTP
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

//signUp
exports.signUp = async(req, res) => {
    try{
        // fetch the data
        const {firstName, lastName, email, password, confirmPassword, accountType, contactNumber, otp} = req.body;

        // validate
        if(!firstName || !lastName || !email || !password || !accountType || !contactNumber || !otp){
            return res.status(400).json({
                success:false,
                message : "All fields are required "
            })} 
        
        // compare the password
        if(password != confirmPassword){
            res.status(400).json({
                success:false,
                message : "Password mismatch"
            });
        }

        // check if the user already exists
        const checkuser = await User.findOne({ email})
        if(checkuser){
            return res.status(400).json({
                success:false,
                message : "User already exists"
            })
        }

        // find the most recent otp of the user
        const recentotp = await OTP.find({ email}).sort({createdAt:-1}).limit(1)

        // validate the otp
        if(recentotp.length == 0){
            return res.status(400).json({
                success:false,
                message : "otp not found"
            })
        }else if(otp != recentotp){
            return res.status(400).json({
                success:false,
                message : "invalid otp"
            })
        }

        // hash the password
        const hashedpassword = await bcrypt.hash(password,10)

        // create entry in the database
        const profiledetails = await Profile.create({
            gender:null,
            dateofBirth:null,
            about:null,
            contactNumber:null,
        })

        const user = await User.create({
            firstName, lastName, email, password:hashedpassword, confirmPassword, accountType,
            contactNumber, additionalDetails:profiledetails._id,
            image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
        })

        return res.status(200).json({
            success: true,
            message:"Successfully registered"
        })
    }
    catch(err){
        return res.status(400).json({
            success:false,
            message:err.message
        })
    }
}

//Login
exports.logIn = async(req,res)=>{
    try{
        // extract the data 
        const {email, password} = req.body;

        // validate
        if(!email || !password){
            res.status(403).json({
                success:false,
                message:"please fill in both details"
            })
        }

        // check if the user exists
        const user = await User.findOne({email})
        if(!user){
            res.status(400).json({
                success:false,
                message:"user not found, please sign up"
            })   
        }

        // password match and generate JWT
        if(await bcrypt.compare(password, user.password)) {
            const payload = {
                email: user.email,
                id: user._id,
                role: user.accountType
            };
            const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "2h"});
            user.token = token;
            user.password = undefined;
            
            const options = {
            expires:new Date(Date.now()+3*24*60*60*1000),
            httpOnly: true, 
        }
        res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: "Login successful"
        })
        }
        else {
        return res.status(401).json({
            success: false,
            message: "password is incorrect"
        })
        }
    }
    catch(err){
        console.log(err)
        return res.status(401).json({
        success: false,
        message: "Login failed"
        });
    }
}

//changePassword

