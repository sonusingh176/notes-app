import express from "express";

import { authenticate } from "../middleware/auth.js";

import { askAI } from "../controllers/aiController.js";


const router = express.Router();


/*
|--------------------------------------------------------------------------
| ASK AI
|--------------------------------------------------------------------------
|
| POST /api/ai/ask
|
| authenticate is VERY important.
|
| It makes sure req.user exists.
|
| Our AI controller then uses:
|
| req.user._id
|
| to access ONLY the logged-in user's applications.
|
|--------------------------------------------------------------------------
*/

router.post(
    "/ask",
    authenticate,
    askAI
);


export default router;