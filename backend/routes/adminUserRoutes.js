import express from 'express';


const router=express.Router();

router.get('/',authenticate,getAllUsers);

 
export default router;