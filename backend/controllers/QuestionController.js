'use strict';

import Question from "../models/Question.js";
import Subject from "../models/Subject.js";

const createQuestion = async (req, res, next)=>{
    try {
        const {questionText,answer,subject,status} =req.body;

        const subjectExists = await Subject.findById(subject);
        
        if (!subjectExists) {
                return res.status(404).json({ success: false, message: 'subject not found' });
        }

        const addQuestion = await Question.create({
            questionText,
            answer,
            subject,
            status,
            createdBy:req.user._id
        });

        res.status(201).json({
            success:true,
            message:'Question added successfully',
            addQuestion,
        })

    } catch (error) {
          next(error);
    }
}

const getQuestionsBySubject = async (req, res, next)=>{
     try {
        const { id } = req.params;
        const subject = await Subject.findById(id).select('name status');

        if(!subject){
            return res.status(404).json({
                success:false,
                message: "Subject not found.",
            });
        }
 
        // if (subject.status !== 'active') {
        //     return res.status(404).json({ success: false, message: "???" }); // socho kya message sahi rahega
        // }

        const questions= await Question.find({subject:id}).sort({ createdAt: -1});

        res.status(200).json({
            success: true,
            message: "Fetched questions successfully.",
            subject,     // frontend ko pata chale kis subject ke questions hain
            questions,
        });


    } catch (error) {
        next(error);
    }
}

const updateQuestion = async (req, res, next) => {
    try {

        const { id } = req.params;
        const { questionText, answer, subject, status } = req.body;

        const question = await Question.findById(id);

        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question not found.",
            });
        }

        // Check whether the selected subject exists
        const subjectExists = await Subject.findById(subject);

        if (!subjectExists) {
            return res.status(404).json({
                success: false,
                message: "Subject not found.",
            });
        }

        question.questionText = questionText;
        question.answer = answer;
        question.subject = subject;
        question.status = status;

        await question.save();

        res.status(200).json({
            success: true,
            message: "Question updated successfully.",
            question,
        });

    } catch (error) {
        next(error);
    }
};

const deleteQuestion = async(req, res, next)=>{
     try {
        const {id} = req.params;
        const question = await Question.findById(id);

        if(!question){
             return res.status(404).json({
                success:false,
                message:"Question not found.",
            })
        }

        await Question.deleteOne();
        res.status(200).json({
            success:true,
            message:"Question deleted successfully.",
        })

    } catch (error) {
         next(error);
    }
}

const getAllQuestions = async (req, res, next) => {
  try {
    const questions = await Question.find()
      .populate("subject", "name") // subject ka naam bhi aaye
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      questions,
    });
  } catch (error) {
    next(error);
  }
};

export { createQuestion, getQuestionsBySubject, getAllQuestions, updateQuestion, deleteQuestion };
