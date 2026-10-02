import express from 'express';
import {body} from 'express-validator';

import {createSubject,getAllSubjects,updateSubject,deleteSubject} from '../controllers/subjectController.js'
import { authenticate ,authorize} from '../middleware/auth.js';
import { validateRequest } from '../middleware/errorHandler.js';

const router = express.Router();

router.post('/create-subject', authenticate,createSubject);
// router.post('/create-subject', authenticate, authorize('super_admin'), createSubject);

router.get('/get-subject', authenticate, getAllSubjects);
router.put('/update-subject/:id', authenticate, updateSubject);
router.delete('/delete-subject/:id',authenticate, deleteSubject);


export default router;