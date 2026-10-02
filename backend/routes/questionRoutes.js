import express from 'express';
import {body} from 'express-validator';

import { createQuestion ,getQuestionsBySubject,updateQuestion,deleteQuestion} from '../controllers/QuestionController.js';
import { authenticate } from '../middleware/auth.js';
import { validateRequest } from '../middleware/errorHandler.js';

const router= express.Router();


router.post('/create-question', authenticate, createQuestion);
router.get('/get-question/:id',authenticate,getQuestionsBySubject);
router.put('/update-question/:id',authenticate,updateQuestion);
router.delete('/delete-question/:id',authenticate,deleteQuestion);

export default router;