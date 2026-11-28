// import fs from "fs";
import { readFile } from 'node:fs/promises';
import { extractTextFromPdfBuffer } from "../services/resumeTextService.js";

import { extractProfileFromText } from '../services/resumeLLMService.js';
import { sanitizeResumeDraft } from '../services/resumerSanitizer.js';

import Profile from "../models/Profile.js";


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

const getProfile = async(req, res, next)=>{
    try {
        // console.log(req.user)
        const profile = await Profile.findOne({user:req.user._id});

        // console.log(profile)
        return res.status(200).json({
            success:true,
            profile:profile || null,
        });
    } catch (error) {
        next(error);
    }
}

const saveProfile =async(req,res,next)=>{

console.log(req.body)
/*

{
  draft: {
    fullName: 'SONU KUMAR SINGH',
    phone: '+91-9771010903',
    location: '',
    headline: 'Full Stack Developer',
    summary: 'Result-oriented Full Stack Developer with 3+ years of experience building responsive, scalable web applications using Laravel, Node.js, Next.js, React.js, and MySQL. Delivered end-to-end e-commerce platforms, SaaS-based ERP systems, and CRM solutions. Skilled in REST API design, role-based access control, real-time features, and cloud deployments.',
    links: {
      linkedin: 'https://linkedin.com/in/sonu-kr',
      github: '',
      portfolio: ''
    },
    skills: [
      'HTML',
      'CSS',
      'JavaScript',
      'React.js',
      'Next.js',
      'Node.js',
      'Express.js',
      'PHP',
      'Laravel',
      'MySQL',
      'MongoDB',
      'Docker',
      'GitHub Actions',
      'AWS (EC2, S3, CloudWatch, Lambda)',
      'RAG',
      'Tool calling',
      'MCP',
      'Git',
      'GitHub',
      'Postman',
      'Swagger',
      'Chrome DevTools'
    ],
    experience: [ [Object], [Object], [Object] ],
    education: [ [Object], [Object], [Object] ]
  }
}

*/

    try {
        const{
            fullName,
            email,
            phone,
            location,
            headline,
            summary,
            links,
            skills,
            experience,
            education,
        }= req.body.draft;


        // Agar link khali string ("") hai to hata do, taaki URL regex validation error na de
    const cleanLinks = {};
    if (links?.linkedin?.trim()) cleanLinks.linkedin = links.linkedin.trim();
    if (links?.github?.trim()) cleanLinks.github = links.github.trim();
    if (links?.portfolio?.trim()) cleanLinks.portfolio = links.portfolio.trim();


    let profile = await Profile.findOne({user:req.user._id});
    
    profile.fullName = fullName ?? "";
    profile.email = email ?? "";
    profile.phone = phone ?? "";
    profile.location = location ?? "";
    profile.headline = headline ?? "";
    profile.summary = summary ?? "";
    profile.links = cleanLinks;

    profile.skills = Array.isArray(skills) ? skills : [];
    profile.experience = Array.isArray(experience) ? experience: [];
    profile.education = Array.isArray(education) ? education : [];

    await profile.save();

    return res.status(200).json({
        success:true,
        message: "Profile saved successfully.",
        profile,
    })

    } catch (error) {
        next(error)
    }
}



export { uploadResume ,getProfile,saveProfile};