'use strict';

import mongoose from "mongoose";

const APPLICATION_STATUSES = ['applied', 'interview_scheduled', 'interview_completed', 'offered', 'rejected', 'withdrawn'];

const jobApplicationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    companyName: {
        type: String,
        required: true,
    },
    // HR / Recruiter email
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    role: {
        type: String,
        required: true,
    },
    // Technology / Tech stack
    // Example: MERN, Laravel, Node.js
    tech: {
        type: String,
        trim: true
    },
    jobPostingUrl: {
        type: String,
        required: false,
    },
    appliedDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    // Where you found the job
    // Example: LinkedIn, Naukri, Indeed, Company Website
    source: {
        type: String,
    },
    location: {
        type: String,
        required: true,
    },
    workMode: {
        type: String,
        enum: ['remote', 'onsite', 'hybrid'],
        default: 'onsite'
    },
    // Current application status
    currentStatus: {
        type: String,
        enum: APPLICATION_STATUSES,
        default: 'applied',
    },
    statusHistory: [{
        status: { type: String, enum: APPLICATION_STATUSES, required: true },
        date: { type: Date, default: Date.now },
        note: String,
    }],
    // Additional notes
    notes: {
        type: String,
        trim: true
    },

}, {
    timestamps: true
});

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);
export default JobApplication;