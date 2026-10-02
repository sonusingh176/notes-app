'use strict';

import Subject from "../models/Subject.js";

const createSubject =async(req, res, next)=>{

    try {

       const { name, description, icon } = req.body;
       const existing = await Subject.findOne({name});
       
       if(existing){
            return res.status(409).json({success:false,message:'Subject already Exist.'});
       }
       const subject = await Subject.create({
        name,
        description,
        icon,
        createdBy:req.user._id // req.user poora document hai, isliye _id nikala
    });

       res.status(201).json({
        success:true,
        message:'Subject added successfully.',
        subject,// frontend ko turant naya subject data mil jaaye
       })
    } catch (error) {
         next(error);
    }

}

const getAllSubjects =async(req, res, next)=>{
     try {

        const subjects = await Subject.find().sort({ createdAt: -1 });
       
        res.status(200).json({
            success:true,
            message:"Fetch all subjects",
            subjects
        });
    } catch (error) {
         next(error);
    }
}

const updateSubject =async(req, res, next)=>{
     try {
        const { id } = req.params;
        const{name,description,icon} = req.body;
        const subject = await Subject.findById(id);

        if(!subject){
            return res.status(404).json({
                success:false,
                message: "Subject not found.",
            });
        }

        const existing = await Subject.findOne({
            name,
            _id:{$ne:id},
        });

        if(existing){
            return res.status(409).json({
                success:false,
                message:"Subject already exists."
            })
        }

        subject.name=name;
        subject.description=description;
        subject.icon=icon;

        await subject.save();

        res.status(200).json({
            success:true,
            message: "Subject updated successfully.",
            subject,

        })
        
    } catch (error) {
         next(error);
    }
}


const deleteSubject =async(req, res, next)=>{
     try {
        const {id} = req.params;
        const subject = await Subject.findById(id);

        if(!subject){
            return res.status(404).json({
                success:false,
                message:"Subject not found.",
            })
        }

        await subject.deleteOne();
        res.status(200).json({
            success:true,
            message:"Subject deleted successfully.",
        });
        
    } catch (error) {
        next(error);
    }
}

export { createSubject, getAllSubjects, updateSubject,deleteSubject };