
import User from '../models/User.js';


const getAllUsers =async(req,res)=>{
    try {
        const users=await User.find({role:"user"}).select("-password").sort({ createdAt: -1 })
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({success:false,message:"Users can't fetch"})
    }

}


export {getAllUsers}