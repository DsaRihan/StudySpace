const User = require("../models/User")
const sendmail = require("../utils/mailSender")

//resetPasswordToken
exports.resetPasswordToken = async (req, res) => {
    try{
        // fetch the email
        const email = req.body.email;
        // email validation
        const emailValidation = await User.findOne({ email: email});
        if(!emailValidation){
            res.json({
                success: false,
                message:"Your email is not registered"
            });
        }
        // generate token
        const token = crypto.randomUUID();
        // update the user by adding the token and expiration
        const updateDetails = await User.findOneAndUpdate({ email: email},
            {token: token, expirationToken: Date.now()+5*60*1000},
            {new: true});
        
        // create url
        const url = `http://localhost:3000/update-password/${token}`;
        await sendmail(email,"Password reset Link",`Password reset link: ${url}`)

        // return response
        return res.json({
            success: true,
            message: "Mail sent successfully, Please change your Password"
        })
    }
    catch(err){
        res.status(400).json({
            success:false,
            message:"something went wrong in the process"
        })
    }
}

//resetPassword