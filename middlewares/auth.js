const jwt = require('jsonwebtoken');
require("dotenv").config()
const User = require("../models/User")

//auth
exports.getAuth = async (req,res,next)=>{
    try{
        // extract the token
        const token = req.header("Authorization").replace("Bearer ", "");

        // if the token is missing
        if(!token){
            return res.status(403).json({
                success: false,
                message: "Invalid token"
            })
        }

        // verify the token
        try{
            const decode = await jwt.verify(token, process.env.JWT_SECRET);
            req.user = decode;
        }
        catch(err){
            res.status(403).json({
                success: false,
                message: "Invalid token"
            });
        }
        next();
    }
    catch(e){
        res.status(403).json({
            success: false,
            message: "Something went wrong"
        });
    }
}

//isStudent
exports.isStudent = async (req, res, next) => {
    try{
        if(req.user.accountType !== "Student"){
            res.status(403).json({
                success: false,
                message: "Invalid account type Student"
            });
        }
        next();
    }
    catch(err){
        res.status(403).json({
            success: false,
            message: "Role could not be verified"
        });
    }
}

//isInstructor
exports.isInstructor = async (req, res, next) => {
    try{
        if(req.user.accountType !== "Instructor"){
            res.status(403).json({
                success: false,
                message: "Invalid account type Instructor"
            });
        }
        next();
    }
    catch(err){
        res.status(403).json({
            success: false,
            message: "Role could not be verified"
        });
    }
}

//isAdmin
exports.isAdmin = async (req, res, next) => {
    try{
        if(req.user.accountType !== "Admin"){
            res.status(403).json({
                success: false,
                message: "Invalid account type Admin"
            });
        }
        next();
    }
    catch(err){
        res.status(403).json({
            success: false,
            message: "Role could not be verified"
        });
    }
}