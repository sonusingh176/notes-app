import express from 'express';
import {body} from 'express-validator';

import { createQuestion ,getAllQuestions,getQuestionsBySubject,updateQuestion,deleteQuestion} from '../controllers/QuestionController.js';
import { authenticate } from '../middleware/auth.js';
import { validateRequest } from '../middleware/errorHandler.js';

const router= express.Router();

router.get("/public/:id", getQuestionsBySubject);


router.post('/create-question', authenticate, createQuestion);
router.get("/get-all-questions", authenticate, getAllQuestions);
router.get('/get-question/:id',authenticate,getQuestionsBySubject);
router.put('/update-question/:id',authenticate,updateQuestion);
router.delete('/delete-question/:id',authenticate,deleteQuestion);



export default router;