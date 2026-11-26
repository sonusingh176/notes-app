import express from 'express';
import { authenticate } from "../middleware/auth.js";
import { getAllUsers } from '../controllers/adminUserController.js';


const router=express.Router();

router.get('/',authenticate,getAllUsers);

 
export default router;