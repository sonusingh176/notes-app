// "use client";
// import { useAuth } from "@/context/AuthContext";

// export default function ProfilePage() {
//   const { user } = useAuth();

//   return (
//     <div className="max-w-md space-y-6">
//       <h2 className="text-xl font-bold text-[var(--text-primary)]">Profile & Settings</h2>
//       <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 space-y-4">
//         <div className="flex items-center gap-4">
//           <div className="h-16 w-16 rounded-full bg-[var(--accent)] flex items-center justify-center text-2xl font-bold text-white">
//             {user?.name?.charAt(0).toUpperCase()}
//           </div>
//           <div>
//             <p className="text-lg font-semibold text-[var(--text-primary)]">{user?.name}</p>
//             <p className="text-sm text-[var(--text-secondary)]">{user?.role?.name}</p>
//           </div>
//         </div>
//         <hr className="border-[var(--border)]" />
//         <div className="space-y-3">
//           <div>
//             <p className="text-xs uppercase text-[var(--text-secondary)] mb-1">Email</p>
//             <p className="text-sm text-[var(--text-primary)]">{user?.email}</p>
//           </div>
//           <div>
//             <p className="text-xs uppercase text-[var(--text-secondary)] mb-1">Member Since</p>
//             <p className="text-sm text-[var(--text-primary)]">
//               {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";
import { useAuth } from "@/context/AuthContext";
import { profileApi } from "@/lib/api";

import { useEffect, useState } from "react";
import {
  UploadCloud,
  Sparkles,
  User,
  Briefcase,
  GraduationCap,
  Link2,
  Wrench,
  Plus,
  Trash2,
  Save,
  FileText,
} from "lucide-react";

const EMPTY_EXPERIENCE = {
  company: "",
  role: "",
  startDate: "",
  endDate: "",
  isCurrent: false,
  description: "",
  technologiesText: "",
};

const EMPTY_EDUCATION = {
  institution: "",
  degree: "",
  fieldOfStudy: "",
  startYear: "",
  endYear: "",
};

const EMPTY_FORM = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  headline: "",
  summary: "",
  links: {
    linkedin: "",
    github: "",
    portfolio: "",
  },
  skillsText: "",
  experience: [{ ...EMPTY_EXPERIENCE }],
  education: [{ ...EMPTY_EDUCATION }],
};

function mapDataToForm(source) {
  if (!source) return null;

  return {
    fullName: source.fullName || "",
    email: source.email || "",
    phone: source.phone || "",
    location: source.location || "",
    headline: source.headline || "",
    summary: source.summary || "",
    links: {
      linkedin: source.links?.linkedin || "",
      github: source.links?.github || "",
      portfolio: source.links?.portfolio || "",
    },
    skillsText: Array.isArray(source.skills) ? source.skills.join(", ") : "",
    experience:
      Array.isArray(source.experience) && source.experience.length > 0
        ? source.experience.map((exp) => ({
            company: exp.company || "",
            role: exp.role || "",
            startDate: exp.startDate || "",
            endDate: exp.endDate || "",
            isCurrent: Boolean(exp.isCurrent),
            description: exp.description || "",
            technologiesText: Array.isArray(exp.technologies)
              ? exp.technologies.join(", ")
              : "",
          }))
        : [{ ...EMPTY_EXPERIENCE }],
    education:
      Array.isArray(source.education) && source.education.length > 0
        ? source.education.map((edu) => ({
            institution: edu.institution || "",
            degree: edu.degree || "",
            fieldOfStudy: edu.fieldOfStudy || "",
            startYear: edu.startYear ?? "",
            endYear: edu.endYear ?? "",
          }))
        : [{ ...EMPTY_EDUCATION }],
  };
}

// Sirf UI preview ke liye sample auto-fill data (network call nahi)
const SAMPLE_AUTOFILL_DRAFT = {
  fullName: "Sonu Kumar Singh",
  email: "sonusingh82601@gmail.com",
  phone: "+91-9771010903",
  location: "Indore, India",
  headline: "Full Stack Developer",
  summary:
    "Full stack developer building scalable web applications with React, Next.js, Node.js, and relational/document databases.",
  links: {
    linkedin: "https://linkedin.com/in/sonu-kr",
    github: "https://github.com/example",
    portfolio: "https://example.com",
  },
  skillsText: "JavaScript, React.js, Next.js, Node.js, Express.js, MySQL",
  experience: [
    {
      company: "Votive Technology",
      role: "Full-Stack Web Developer",
      startDate: "2025-07",
      endDate: "",
      isCurrent: true,
      description: "Working on ERP, e-commerce, and ticketing platforms.",
      technologiesText: "Next.js, Node.js, MySQL",
    },
  ],
  education: [
    {
      institution: "CIMAGE College, Patna",
      degree: "BCA",
      fieldOfStudy: "Computer Applications",
      startYear: "2012",
      endYear: "2015",
    },
  ],
};

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  const [selectedFileName, setSelectedFileName] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const [data,setData] =useState([]);
  
  const [form, setForm] = useState(EMPTY_FORM);


   // 1.load profile details (GET /api/profile)
  useEffect(()=>{
    let active=true;

    profileApi.getProfile()
        .then((res)=>{
          if (!active) return;
          const mapped = mapDataToForm(res?.profile);
          if (mapped) {
          setForm(mapped);
        }
        })
       .catch((err) => {
        console.error(err);
        if (active) setStatusMessage("Saved profile load karne mein problem aayi.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

        return () => {
      active = false;
    };

  },[])



  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFileName(file.name);
    setStatusMessage(`Selected "${file.name}". Click "Extract & Auto-Fill" to fill form.`);
  };

  // UI-only auto-fill preview (baad mein yahan POST /api/profile/resume connect hoga)
  const handleAutoFillPreview = () => {
    if (!selectedFileName) {
      setStatusMessage("Please select a PDF resume first.");
      return;
    }
    setForm(SAMPLE_AUTOFILL_DRAFT);
    setStatusMessage("Form auto-filled from resume preview. Review or edit manually before saving.");
  };

  const handleClearManual = () => {
    setSelectedFileName("");
    setForm({
      fullName: "",
      email: "",
      phone: "",
      location: "",
      headline: "",
      summary: "",
      links: { linkedin: "", github: "", portfolio: "" },
      skillsText: "",
      experience: [{ ...EMPTY_EXPERIENCE }],
      education: [{ ...EMPTY_EDUCATION }],
    });
    setStatusMessage("Cleared form for manual entry.");
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateLink = (key, value) => {
    setForm((prev) => ({
      ...prev,
      links: { ...prev.links, [key]: value },
    }));
  };

  const updateExperience = (index, key, value) => {
    setForm((prev) => {
      const updated = [...prev.experience];
      updated[index] = {
        ...updated[index],
        [key]: value,
        ...(key === "isCurrent" && value ? { endDate: "" } : {}),
      };
      return { ...prev, experience: updated };
    });
  };

  const addExperience = () => {
    setForm((prev) => ({
      ...prev,
      experience: [...prev.experience, { ...EMPTY_EXPERIENCE }],
    }));
  };

  const removeExperience = (index) => {
    setForm((prev) => ({
      ...prev,
      experience:
        prev.experience.length > 1
          ? prev.experience.filter((_, i) => i !== index)
          : [{ ...EMPTY_EXPERIENCE }],
    }));
  };

  const updateEducation = (index, key, value) => {
    setForm((prev) => {
      const updated = [...prev.education];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, education: updated };
    });
  };

  const addEducation = () => {
    setForm((prev) => ({
      ...prev,
      education: [...prev.education, { ...EMPTY_EDUCATION }],
    }));
  };

  const removeEducation = (index) => {
    setForm((prev) => ({
      ...prev,
      education:
        prev.education.length > 1
          ? prev.education.filter((_, i) => i !== index)
          : [{ ...EMPTY_EDUCATION }],
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setStatusMessage("UI preview ready: Profile data looks good to submit.");
  };

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-[#0e1322] px-3.5 py-2.5 text-sm text-gray-100 placeholder-gray-500 outline-none transition focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f97316]/20";

  const labelClass = "mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-400";

  if (loading) {
    return (
      <section className="mx-auto flex w-full max-w-5xl justify-center px-4 py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-[#f97316]" />
      </section>
    );
  }
  
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 rounded-2xl border border-[#f59e0b]/25 bg-gradient-to-r from-[#13192b] via-[#181f33] to-[#1b2231] p-6 sm:flex-row sm:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f59e0b]/30 bg-[#f97316]/10 px-3 py-1 text-xs font-semibold text-[#fbbf24]">
            <Sparkles size={13} />
            Auto-Fill or Manual Profile
          </span>
          <h1 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
            Candidate{" "}
            <span className="bg-gradient-to-r from-[#f97316] to-[#fbbf24] bg-clip-text text-transparent">
              Profile
            </span>
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Upload a PDF resume to auto-fill fields, or fill and edit everything manually.
          </p>
        </div>

        <button
          type="button"
          onClick={handleClearManual}
          className="self-start rounded-xl border border-white/15 bg-[#13192b] px-4 py-2.5 text-xs font-semibold text-gray-300 transition hover:border-[#f97316]/50 hover:text-[#fbbf24] sm:self-center"
        >
          Fill Manually / Reset
        </button>
      </div>

      {/* Resume Upload & Extract Button Card */}
      <div className="mb-8 rounded-2xl border border-[#f59e0b]/25 bg-[#13192b] p-6 shadow-xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#f59e0b]/25 bg-gradient-to-br from-[#f97316]/20 to-[#fbbf24]/15 text-[#fbbf24]">
              <UploadCloud size={24} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white sm:text-lg">
                Upload PDF Resume
              </h2>
              <p className="mt-1 text-xs text-gray-400 sm:text-sm">
                Select a PDF file and click the button to extract details and auto-fill your profile.
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#f59e0b]/40 bg-[#f97316]/10 px-4 py-2 text-xs font-semibold text-[#fbbf24] transition hover:bg-[#f97316]/20">
                  <FileText size={15} />
                  Choose PDF
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                <span className="text-xs text-gray-400">
                  {selectedFileName || "No PDF selected yet"}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAutoFillPreview}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#f97316] to-[#f59e0b] px-5 py-3 text-sm font-semibold text-[#0b0f19] shadow-[0_0_24px_-6px_rgba(249,115,22,0.65)] transition hover:brightness-110"
          >
            <Sparkles size={16} />
            Extract & Auto-Fill
          </button>
        </div>

        {statusMessage && (
          <div className="mt-4 rounded-xl border border-[#f59e0b]/20 bg-[#f97316]/[0.06] px-4 py-2.5 text-xs font-medium text-[#fbbf24]">
            {statusMessage}
          </div>
        )}
      </div>

      {/* Main Profile Form (Auto-filled or Manual) */}
      <form onSubmit={handleFormSubmit} className="space-y-8">
        {/* Basic Details */}
        <div className="rounded-2xl border border-white/10 bg-[#13192b] p-6">
          <div className="mb-5 flex items-center gap-2.5 border-b border-white/10 pb-3">
            <User size={18} className="text-[#f97316]" />
            <h3 className="text-base font-semibold text-white">Basic Details</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Full Name</label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => updateField("fullName", e.target.value)}
                placeholder="e.g. Sonu Kumar Singh"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Headline</label>
              <input
                type="text"
                value={form.headline}
                onChange={(e) => updateField("headline", e.target.value)}
                placeholder="e.g. Full Stack Developer"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="name@example.com"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="+91-9876543210"
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => updateField("location", e.target.value)}
                placeholder="e.g. Indore, India"
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Summary</label>
              <textarea
                rows={4}
                value={form.summary}
                onChange={(e) => updateField("summary", e.target.value)}
                placeholder="Write a short professional summary..."
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Links & Skills */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-[#13192b] p-6">
            <div className="mb-5 flex items-center gap-2.5 border-b border-white/10 pb-3">
              <Link2 size={18} className="text-[#fbbf24]" />
              <h3 className="text-base font-semibold text-white">Links</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelClass}>LinkedIn URL</label>
                <input
                  type="url"
                  value={form.links.linkedin}
                  onChange={(e) => updateLink("linkedin", e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>GitHub URL</label>
                <input
                  type="url"
                  value={form.links.github}
                  onChange={(e) => updateLink("github", e.target.value)}
                  placeholder="https://github.com/..."
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Portfolio URL</label>
                <input
                  type="url"
                  value={form.links.portfolio}
                  onChange={(e) => updateLink("portfolio", e.target.value)}
                  placeholder="https://yourportfolio.com"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#13192b] p-6">
            <div className="mb-5 flex items-center gap-2.5 border-b border-white/10 pb-3">
              <Wrench size={18} className="text-[#f97316]" />
              <h3 className="text-base font-semibold text-white">Skills</h3>
            </div>

            <label className={labelClass}>Skills (Comma Separated)</label>
            <textarea
              rows={5}
              value={form.skillsText}
              onChange={(e) => updateField("skillsText", e.target.value)}
              placeholder="React.js, Next.js, Node.js, Express.js, MySQL"
              className={inputClass}
            />
            <p className="mt-2 text-xs text-gray-400">
              Separate skills with commas for quick editing.
            </p>
          </div>
        </div>

        {/* Experience Section */}
        <div className="rounded-2xl border border-white/10 bg-[#13192b] p-6">
          <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5">
              <Briefcase size={18} className="text-[#f97316]" />
              <h3 className="text-base font-semibold text-white">Experience</h3>
            </div>

            <button
              type="button"
              onClick={addExperience}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#f59e0b]/35 bg-[#f97316]/10 px-3 py-1.5 text-xs font-semibold text-[#fbbf24] transition hover:bg-[#f97316]/20"
            >
              <Plus size={14} />
              Add Experience
            </button>
          </div>

          <div className="space-y-5">
            {form.experience.map((exp, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-5"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-lg border border-[#f59e0b]/25 bg-[#f97316]/10 px-2.5 py-1 text-xs font-semibold text-[#fbbf24]">
                    Role #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeExperience(idx)}
                    className="inline-flex items-center gap-1 text-xs text-gray-400 transition hover:text-[#f97316]"
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Company</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateExperience(idx, "company", e.target.value)}
                      placeholder="Company name"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Role / Title</label>
                    <input
                      type="text"
                      value={exp.role}
                      onChange={(e) => updateExperience(idx, "role", e.target.value)}
                      placeholder="e.g. Full-Stack Web Developer"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Start Month (YYYY-MM)</label>
                    <input
                      type="month"
                      value={exp.startDate}
                      onChange={(e) => updateExperience(idx, "startDate", e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>End Month (YYYY-MM)</label>
                    <input
                      type="month"
                      value={exp.endDate}
                      disabled={exp.isCurrent}
                      onChange={(e) => updateExperience(idx, "endDate", e.target.value)}
                      className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-50`}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-gray-300">
                      <input
                        type="checkbox"
                        checked={exp.isCurrent}
                        onChange={(e) => updateExperience(idx, "isCurrent", e.target.checked)}
                        className="h-4 w-4 rounded border-white/20 accent-[#f97316]"
                      />
                      Currently working here
                    </label>
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelClass}>Technologies (Comma Separated)</label>
                    <input
                      type="text"
                      value={exp.technologiesText}
                      onChange={(e) =>
                        updateExperience(idx, "technologiesText", e.target.value)
                      }
                      placeholder="React.js, Node.js, MySQL"
                      className={inputClass}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelClass}>Description</label>
                    <textarea
                      rows={3}
                      value={exp.description}
                      onChange={(e) => updateExperience(idx, "description", e.target.value)}
                      placeholder="Key responsibilities and achievements..."
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Education Section */}
        <div className="rounded-2xl border border-white/10 bg-[#13192b] p-6">
          <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5">
              <GraduationCap size={18} className="text-[#fbbf24]" />
              <h3 className="text-base font-semibold text-white">Education</h3>
            </div>

            <button
              type="button"
              onClick={addEducation}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#f59e0b]/35 bg-[#f97316]/10 px-3 py-1.5 text-xs font-semibold text-[#fbbf24] transition hover:bg-[#f97316]/20"
            >
              <Plus size={14} />
              Add Education
            </button>
          </div>

          <div className="space-y-5">
            {form.education.map((edu, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-5"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-lg border border-[#f59e0b]/25 bg-[#f97316]/10 px-2.5 py-1 text-xs font-semibold text-[#fbbf24]">
                    Education #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeEducation(idx)}
                    className="inline-flex items-center gap-1 text-xs text-gray-400 transition hover:text-[#f97316]"
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Institution</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => updateEducation(idx, "institution", e.target.value)}
                      placeholder="College / University name"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Degree</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => updateEducation(idx, "degree", e.target.value)}
                      placeholder="e.g. BCA / B.Tech"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Field of Study</label>
                    <input
                      type="text"
                      value={edu.fieldOfStudy}
                      onChange={(e) => updateEducation(idx, "fieldOfStudy", e.target.value)}
                      placeholder="e.g. Computer Science"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Start Year</label>
                    <input
                      type="number"
                      min="1950"
                      max="2100"
                      value={edu.startYear}
                      onChange={(e) => updateEducation(idx, "startYear", e.target.value)}
                      placeholder="2012"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>End Year</label>
                    <input
                      type="number"
                      min="1950"
                      max="2100"
                      value={edu.endYear}
                      onChange={(e) => updateEducation(idx, "endYear", e.target.value)}
                      placeholder="2015"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#f97316] to-[#f59e0b] px-6 py-3 text-sm font-semibold text-[#0b0f19] shadow-[0_0_24px_-6px_rgba(249,115,22,0.65)] transition hover:brightness-110"
          >
            <Save size={17} />
            Save Profile
          </button>
        </div>
      </form>
    </section>
  );
}