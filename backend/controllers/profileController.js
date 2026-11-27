// import fs from "fs";
import { readFile } from 'node:fs/promises';
import { extractTextFromPdfBuffer } from "../services/resumeTextService.js";

import { extractProfileFromText } from '../services/resumeLLMService.js';
import { sanitizeResumeDraft } from '../services/resumerSanitizer.js';



const MAX_RESUME_CHARS = 12000;


// Upload the resume and return its basic information
const uploadResume = async (req, res, next)=>{

    try {
        // Check whether the user uploaded a file.
      if(!req.file){
        return res.status(400).json({
            success:false,
            message:"Please upload a PDF resume"
        });
      }

    // Agar diskStorage hai to path se padho, warna memoryStorage ka buffer lo
    const buffer= req.file.buffer || (await readFile(req.file.path));
    const extractedText = await extractTextFromPdfBuffer(buffer);

    if(extractedText.length < 30){
        return res.status(422).json({
        success: false,
        message:
          "Very little or no text found in PDF.  you can fill your profile manually.",
      });
    }

    // Cost aur token limit ke liye text ko safe size tak limit karo
    const boundedText = extractedText.slice(0, MAX_RESUME_CHARS);

    // LLM se structured profile data nikaalo aur form ke liye sanitize karo
    const rawProfile = await extractProfileFromText(boundedText);
    const draft = sanitizeResumeDraft(rawProfile);



    // Return information about the uploaded file.
    return res.status(200).json({
        success:true,
        message:"Resume text extracted successfully.Review and save your profile.",
        file:{
            name:req.file.originalname,
            size:req.file.size,
        },
        draft,
        // textLength:extractedText.length,
        // textPreview: extractedText.slice(0, 1000),
    })

    } catch (error) {
        next(error);
    }

}

export { uploadResume };