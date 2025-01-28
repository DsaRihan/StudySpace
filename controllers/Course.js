const User = require("../models/User")
const Tag = require("../models/tags")
const Course = require("../models/Course")
const {uploadImagecloud} = require("../utils/imageUpload")
require("dotenv").config()

// create the course
exports.createCourse = async (req,res )=>{
    try{
        // extract the data
        const {courseName, courseDescription, whatYouWillLearn, price, tag} = req.body;
        // get the thumbnail
        const thumbnail = req.files.thumbnailimage;
        // validation
        if(!thumbnail || !courseDescription || !courseName || !whatYouWillLearn || !tag || !price){
            return res.status(404).json({
                success: false,
                message:"All fields are required"
            })
        }
        // check  for the instructor
        const userid = req.user.id;
        const instructordetails = await User.findById(userid);
        console.log(instructordetails);

        if(!instructordetails){
            return res.status(404).json({
                success: false,
                message:"Instructor details not found"
            });
        }
        // check if the given tag is valid or not
        const tagdetails = await Tag.findById(tag);
        if(tagdetails){
            return res.status(404).json({
                success: false,
                message:"Tag details not found"
            });
        }
        // upload image to cloudinary server
        const thumbnailimage = await uploadImagecloud(thumbnail, process.env.FOLDER_NAME)

        // create entry in the new course
        const newCourse = await Course.create({
            courseName, courseDescription, instructor : instructordetails._id, whatYouWillLearn,
            price, tag : tagdetails._id, thumbnail : thumbnailimage.secure_url
        })
        // add new course to the user schema
        await User.findByIdAndUpdate(
            {_id:instructordetails._id},
            {
                $push:{
                    courses:newCourse._id
                }
            },
            {new:true}
        )
        // update the tag schema

        // return response
        return res.status(200).json({
            success:true,
            message: 'Course created successfully'
        })
    }
    catch(e){
        return res.status(400).json({
            success:false,
            message: 'Failed to create course'
        })
    }
}

// get all courses
exports.showallCourses = async (req, res) => {
    try{
        const show = await Course.find({},{courseName:true, price:true, instructor:true, studentsEnrolled:true,
                                            ratingAndReviews:true, thumbnail:true
        }).populate("instructor").exec();

        return res.status(200).json({
            success:true,
            message: 'Data found successfully',
            data: show
        })
    }
    catch(e){
        return res.status(400).json({
            success:false,
            message: 'Failed to get all courses'
        })
    }
}