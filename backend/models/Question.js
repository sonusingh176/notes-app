'use strict';

import mongoose from "mongoose";

const questionSchema= new mongoose.Schema({
    questionText:{
        type:String,
        required:true,
        trim:true
    },

    answer:{
        type:String,
        required:true,
    },
    subject:{
     type:mongoose.Schema.Types.ObjectId,
     ref:'Subject',
     required:true,
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    status:{
        type:String,
        enum:['active','inactive'],
        default:'active'
    }
},{
    timestamps:true
})

const Question = mongoose.model('Question',questionSchema);

export default Question;