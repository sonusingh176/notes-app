// ---------- SIRF TEST KE LIYE, kaam ke baad delete kar dena ----------

// .env file load karo (taaki OPENAI_API_KEY mile). Server me ye pehle se hota hai,
// lekin akeli script me khud karna padta hai.
import "dotenv/config";
import { extractProfileFromText } from "./services/resumeLLMService.js";

// Nakli (fake) resume, asli personal data test me mat daalo
const sampleResume = `
Rahul Sharma
Full-stack developer | Indore, India
Phone: 9876543210
GitHub: https://github.com/rahul-demo

SUMMARY
Developer with 4 years of experience building web apps.

EXPERIENCE
Software Developer - Votive Technology (Jan 2022 - Present)
Built dashboards using React and Node.js.

Junior Developer - ABC Soft (Jun 2020 - Dec 2021)
Worked on Laravel and MySQL projects.

EDUCATION
B.Tech in Computer Science, RGPV, 2016 - 2020

SKILLS
React, Node.js, MongoDB, Laravel, MySQL
`;

const result = await extractProfileFromText(sampleResume);
console.log(JSON.stringify(result, null, 2));