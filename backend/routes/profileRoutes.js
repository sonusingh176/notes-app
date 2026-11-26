import express from "express";
import { uploadResume as uploadResumeController} from "../controllers/profileController.js";
import { uploadResume } from "../middleware/uploadResume.js";


const router= express.Router();

router.post("/resume",uploadResume,uploadResumeController);

export default router;