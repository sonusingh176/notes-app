'use strict';


import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    slug:{
        type:String,
        required:false,
        unique:true,
    },
    description:{
        type:String,
        required:false,
    },
    icon:{
        type:String,
        required:false,
    },
    status:{
        type:String,
        enum:['active','inactive'],
        default:'active'
    },
    createdBy: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'User'// Must match the exact string name of the target model
    },
},{
    timestamps:true
});


subjectSchema.pre('save',async function(next){

    // Case 1: agar slug already diya gaya hai (ya name change hi nahi hua), kuch mat karo
    if(!this.isModified('name')){
        return next();
    }

    // Case 2: name se slug generate karo
    this.slug=this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
     
    next();
});


const Subject = mongoose.model('Subject',subjectSchema);

export default Subject;