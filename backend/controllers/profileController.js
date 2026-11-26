
// Upload the resume and return its basic information
const uploadResume = (req,res)=>{

      // Check whether the user uploaded a file.
      if(!req.file){
        return res.status(400).json({
            success:false,
            message:"Please upload a PDF resume"
        });
      }

        // Return information about the uploaded file.

        return res.status(200).json({
            success:true,
            message:"Resume uploaded successfully",

            file:{
                name: req.file.originalname,
                size: req.file.size,
                type: req.file.mimetype,
            },

        })

}

export { uploadResume };