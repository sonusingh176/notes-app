// LLM se aaye JSON ko form auto-fill ke liye clean aur safe banata hai
const YEAR_MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

function cleanUrl(val) {
  if (typeof val !== "string") return "";
  const trimmed = val.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^(www\.|linkedin\.com|github\.com)/i.test(trimmed)) return `https://${trimmed}`;
  return "";
}

export function sanitizeResumeDraft(raw = {}) {
  const links = raw.links && typeof raw.links === "object" ? raw.links : {};

  const skills = Array.isArray(raw.skills)
    ? [...new Set(raw.skills.map((s) => (typeof s === "string" ? s.trim() : "")).filter(Boolean))]
    : [];

  const experience = Array.isArray(raw.experience)
    ? raw.experience
        .filter((exp) => exp && typeof exp.company === "string" && exp.company.trim())
        .map((exp) => {
          const isCurrent = Boolean(exp.isCurrent);
          const startDate =
            typeof exp.startDate === "string" && YEAR_MONTH_REGEX.test(exp.startDate.trim())
              ? exp.startDate.trim()
              : "";
          const rawEndDate =
            typeof exp.endDate === "string" && YEAR_MONTH_REGEX.test(exp.endDate.trim())
              ? exp.endDate.trim()
              : "";

          return {
            company: exp.company.trim(),
            role: typeof exp.role === "string" ? exp.role.trim() : "",
            startDate,
            endDate: isCurrent ? "" : rawEndDate,
            isCurrent,
            technologies: Array.isArray(exp.technologies)
              ? [...new Set(exp.technologies.map((t) => (typeof t === "string" ? t.trim() : "")).filter(Boolean))]
              : [],
            description: typeof exp.description === "string" ? exp.description.trim() : "",
          };
        })
    : [];

  const education = Array.isArray(raw.education)
    ? raw.education
        .filter((edu) => edu && typeof edu.institution === "string" && edu.institution.trim())
        .map((edu) => ({
          institution: edu.institution.trim(),
          degree: typeof edu.degree === "string" ? edu.degree.trim() : "",
          fieldOfStudy: typeof edu.fieldOfStudy === "string" ? edu.fieldOfStudy.trim() : "",
          startYear: Number.isInteger(edu.startYear) ? edu.startYear : null,
          endYear: Number.isInteger(edu.endYear) ? edu.endYear : null,
        }))
    : [];

  return {
    fullName: typeof raw.fullName === "string" ? raw.fullName.trim() : "",
    phone: typeof raw.phone === "string" ? raw.phone.trim() : "",
    location: typeof raw.location === "string" ? raw.location.trim() : "",
    headline: typeof raw.headline === "string" ? raw.headline.trim() : "",
    summary: typeof raw.summary === "string" ? raw.summary.trim() : "",
    links: {
      linkedin: cleanUrl(links.linkedin),
      github: cleanUrl(links.github),
      portfolio: cleanUrl(links.portfolio),
    },
    skills,
    experience,
    education,
  };
}