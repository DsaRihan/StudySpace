const Tag = require("../models/tags")

exports.createTag = async(req,res) => {
    try{
        // fetch the data
        const{name, description} = req.body;
        // validate
        if(!name || !description){
            return res.status(400).json({message:"All fields must be provided"});
        }
        // entry data in the database
        const data = await Tag.create({name:name, description:description});
        // return the response
        return res.status(200).json({
            success: true,
            message: "tag created successfully"
        });
    }
    catch(err){
        res.status(500).json({
            success: false,
            message:err.message
        })
    }
}