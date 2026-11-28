import mongoose from "mongoose";

// "2022-03" jaisa format. WHY string: Date me timezone ki wajah se mahina aage-peeche ho sakta hai
const YEAR_MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;
// WHY: sirf http(s) link allowed, warna "javascript:..." jaisa link href me chal sakta hai
const URL_RULE = [/^https?:\/\/.+/i, "Link http:// ya https:// se shuru hona chahiye"];

// max items ka validator (bahut bada array DB me na ghuse)
const maxItems = (max) => ({
  validator: (v) => v.length <= max,
  message: `Maximum ${max} items allowed`,
});

const experienceSchema = new mongoose.Schema({
  company: { type: String, required: [true, "Company name is required"], trim: true, maxlength: 100 },
  role: { type: String, trim: true, maxlength: 100 },
  startDate: { type: String, match: [YEAR_MONTH, "startDate YYYY-MM format me do"] },
  endDate: { type: String, match: [YEAR_MONTH, "endDate YYYY-MM format me do"] },
  isCurrent: { type: Boolean, default: false },
  technologies: { type: [{ type: String, trim: true, maxlength: 50 }], default: [] },
  description: { type: String, trim: true, maxlength: 1000 },
});

experienceSchema.pre("validate", function (next) {
  if (this.isCurrent) this.endDate = undefined; // current job ki end date nahi hoti
  // YYYY-MM strings ka seedha compare sahi chalta hai
  if (this.startDate && this.endDate && this.endDate < this.startDate) {
    this.invalidate("endDate", "End date, start date se pehle nahi ho sakti");
  }
  next();
});

const educationSchema = new mongoose.Schema({
  institution: { type: String, required: [true, "Institution is required"], trim: true, maxlength: 150 },
  degree: { type: String, trim: true, maxlength: 100 },
  fieldOfStudy: { type: String, trim: true, maxlength: 100 },
  startYear: { type: Number, min: 1950, max: 2100 },
  endYear: { type: Number, min: 1950, max: 2100 },
});

const profileSchema = new mongoose.Schema(
  {
    // user se 1:1 (unique), ek user ka ek hi profile
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    fullName: { type: String, trim: true, maxlength: 100 },
    email: {type: String,trim: true, maxlength: 100,},
    phone: { type: String, trim: true, maxlength: 20 },
    location: { type: String, trim: true, maxlength: 100 },
    headline: { type: String, trim: true, maxlength: 150 }, // jaise "Full-stack developer"
    summary: { type: String, trim: true, maxlength: 1000 },
    links: {
      linkedin: { type: String, trim: true, maxlength: 200, match: URL_RULE },
      github: { type: String, trim: true, maxlength: 200, match: URL_RULE },
      portfolio: { type: String, trim: true, maxlength: 200, match: URL_RULE },
    },
    skills: { type: [{ type: String, trim: true, maxlength: 50 }], validate: maxItems(50) },
    experience: { type: [experienceSchema], validate: maxItems(20) },
    education: { type: [educationSchema], validate: maxItems(10) },
  },
  { timestamps: true }
);

export default mongoose.model("Profile", profileSchema);