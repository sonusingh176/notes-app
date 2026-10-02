'use strict';

import JobApplication from '../models/JobApplication.js'


// =====================================================
// CREATE JOB APPLICATION
// POST /api/job-applications
// =====================================================

const createApplication = async (req, res, next) => {

    try {
        const { 
            companyName,
            role,
            jobPostingUrl,
            appliedDate,
            source,
            location,
            workMode
         } = req.body;

        // Basic validation
        if (!companyName || !role || !location) {
            return res.status(400).json({
                success: false,
                message: 'Company name, role and location are required.'
            });
        }

        const application = await JobApplication.create({
           user: req.user._id,
            companyName,
            role,
            jobPostingUrl,
            appliedDate,
            source,
            location,
            workMode,

            // Initial status
            currentStatus: 'applied',

            // Add first status history
            statusHistory: [
                {
                    status: 'applied',
                    date: appliedDate || new Date(),
                    note: 'Application submitted'
                }
            ]

        });

        return res.status(201).json({
            success: true,
            message: 'Job application created successfully.',
            data: application
        });

    } catch (error) {
        next(error)
    }
}


// =====================================================
// GET ALL JOB APPLICATIONS
// GET /api/job-applications
// =====================================================

const getApplications =async (req,res,next)=>{
    try {
         const {
            status,
            source,
            tech,
            search
        } = req.query;

        // Only logged-in user's applications
        const filter = {
            user: req.user._id
        };

         // Filter by status
        if (status) {
            filter.currentStatus = status;
        }

        // Filter by source
        if (source) {
            filter.source = source;
        }

         // Search company or role
        // if (search) {
        //     filter.$or = [
        //         {
        //             companyName: {
        //                 $regex: search,
        //                 $options: 'i'
        //             }
        //         },
        //         {
        //             role: {
        //                 $regex: search,
        //                 $options: 'i'
        //             }
        //         }
        //     ];
        // }

         const applications = await JobApplication
            .find(filter)
            .sort({ appliedDate: -1 });

        return res.status(200).json({
            success: true,
            count: applications.length,
            data: applications
        });



    } catch (error) {
         next(error);
    }
}


// =====================================================
// GET SINGLE JOB APPLICATION
// GET /api/job-applications/:id
// =====================================================

const getApplicationById = async (req, res, next) => {
    try {
               const application = await JobApplication.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Job application not found.'
            });
        }

        return res.status(200).json({
            success: true,
            data: application
        });
    } catch (error) {
        next(error);
    }
}


// =====================================================
// UPDATE JOB APPLICATION
// PUT /api/job-applications/:id
// =====================================================

const updateApplication = async (req, res, next) => {
    try {
         const {
            companyName,
            role,
            jobPostingUrl,
            appliedDate,
            source,
            location,
            workMode,
            currentStatus,
        } = req.body;

        const application = await JobApplication.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Job application not found.'
            });
        }

           // Update fields
        if (companyName !== undefined) {
            application.companyName = companyName;
        }

        if (role !== undefined) {
            application.role = role;
        }

        if (jobPostingUrl !== undefined) {
            application.jobPostingUrl = jobPostingUrl;
        }

        if (appliedDate !== undefined) {
            application.appliedDate = appliedDate;
        }

        if (source !== undefined) {
            application.source = source;
        }

        if (location !== undefined) {
            application.location = location;
        }

        if (workMode !== undefined) {
            application.workMode = workMode;
        }

        if(currentStatus !== undefined){
            application.currentStatus=currentStatus;
        }

        await application.save();

        return res.status(200).json({
            success: true,
            message: 'Job application updated successfully.',
            data: application
        });

    } catch (error) {
         next(error);
    }
}


// =====================================================
// UPDATE STATUS
// PATCH /api/job-applications/:id/status
// =====================================================

const updateApplicationStatus = async (req, res, next) => {
    try {
        const { status, note } = req.body;

          const allowedStatuses = [
            'applied',
            'interview_scheduled',
            'interview_completed',
            'offered',
            'rejected',
            'withdrawn'
        ];

          // Validate status
        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required.'
            });
        }

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid application status.'
            });
        }

         const application = await JobApplication.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Job application not found.'
            });
        }

        // Update current status
        application.currentStatus = status;

        // Add status history
        application.statusHistory.push({
            status,
            date: new Date(),
            note: note || ''
        });

        await application.save();

        return res.status(200).json({
            success: true,
            message: 'Application status updated successfully.',
            data: application
        });

    } catch (error) {
        next(error);
    }
}

// =====================================================
// DELETE JOB APPLICATION
// DELETE /api/job-applications/:id
// =====================================================
const deleteApplication = async (req, res, next) => {
    try {
        const application = await JobApplication.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Job application not found.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Job application deleted successfully.'
        });

    } catch (error) {
        next(error);
    }
};


const getStatuses = (req, res) => {
  res.json({
    success: true,
    data: ['applied', 'interview_scheduled', 'interview_completed', 'offered', 'rejected', 'withdrawn']
  });
};


export {createApplication ,getApplications,getApplicationById,updateApplication,updateApplicationStatus,deleteApplication,getStatuses}

