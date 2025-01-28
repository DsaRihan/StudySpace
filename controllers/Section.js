const Section = require("../models/Section")
const Course = require("../models/Course")

exports.createSection = async (req, res) => {
    try{
        // fetch the data
        const {sectionName, courseId} = req.body;
        // validate
        if(!sectionName || !courseId){
            return res.status(404).json({
                success: false,
                message:"Missing required fields"
            })
        }
        // create the section
        const newSection = await Section.create({sectionName})
        // update the course with the new objextID
        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,{$push:{courseContent:newSection._id}},{new:true}
        )
        // return response
        return res.status(200).json({
            success: true,
            message:"Section created successfully",
            updatedCourse,
        })
    }
    catch(err){
        return res.status(500).json({
            success: false,
            message:"Error creating Section"
        })
    }
}

// update section
exports.updatedCourse = async (req, res) => {
    try{
        // fetch the data
        const {sectionName, sectionId } = req.body
        // validate
        if(!sectionName || !courseId){
            return res.status(404).json({
                success: false,
                message:"Missing required fields"
            })
        }
        // update the data
        const section =  await Section.findByIdAndUpdate(sectionId,{sectionName},{new:true});
        // response
        return res.status(200).json({
            success:true,
            message:" updated the course"
        })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"Error in updating the course"
        })
    }
}