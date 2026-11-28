import express from "express";
import { uploadResume as uploadResumeController, getProfile, saveProfile } from "../controllers/profileController.js";
import { uploadResume } from "../middleware/uploadResume.js";
import { authenticate } from "../middleware/auth.js";


const router= express.Router();

router.get("/", authenticate, getProfile);
router.put("/", authenticate, saveProfile);
router.post("/resume",authenticate,uploadResume,uploadResumeController);

export default router;