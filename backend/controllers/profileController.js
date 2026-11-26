import fs from "fs";




// Upload the resume and return its basic information
const uploadResume = async(req,res,next)=>{

    try {
        // Check whether the user uploaded a file.
      if(!req.file){
        return res.status(400).json({
            success:false,
            message:"Please upload a PDF resume"
        });
      }

    // Agar diskStorage hai to path se padho, warna memoryStorage ka buffer lo
    const buffer= req.file.buffer || (await fs.readFile(req.file.path));
    const extractedText = await extractTextFromPdfBuffer(buffer);

    if(extractedText.length < 30){
        return res.status(422).json({
        success: false,
        message:
          "Very little or no text found in PDF.  you can fill your profile manually.",
      });
    }

    // Return information about the uploaded file.
    return res.status(200).json({
        success:true,
        message:"Resume text extracted successfully.",
        file:{
            name:req.file.originalname,
            size:req.file.size,
        },
        textLength:extractedText.length,
        textPreview: extractedText.slice(0, 1000),

    })

    } catch (error) {
        next(error);
    }

     




}

export { uploadResume };