import express from "express";

import { authenticate } from "../middleware/auth.js";

import { askAI,confirmAction ,cancelAction} from "../controllers/aiController.js";


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

router.post("/actions/:id/confirm", authenticate, confirmAction);
router.post("/actions/:id/cancel", authenticate, cancelAction);


export default router;