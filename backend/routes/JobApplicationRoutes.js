import express from 'express';
import { 
    createApplication,
    getApplications,
    getApplicationById,
    updateApplication,
    updateApplicationStatus,
    deleteApplication,
    getStatuses
 } from '../controllers/JobApplicationController.js';

 import { authenticate } from "../middleware/auth.js";


 const router = express.Router();


 router.get("/statuses", authenticate, getStatuses);
// Job Applications
router.post("/create", authenticate, createApplication);

router.get("/get", authenticate, getApplications);

router.get("/:id", authenticate, getApplicationById);

router.put("/:id", authenticate, updateApplication);

router.patch("/:id/status", authenticate, updateApplicationStatus);

router.delete("/:id", authenticate, deleteApplication);





 
export default router;