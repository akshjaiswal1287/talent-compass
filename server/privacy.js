const MAX_RESUME_LENGTH = 30000;

function redactIdentity(text) {
  return String(text)
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted email]")
    .replace(/\+?\d[\d\s().-]{7,}\d/g, "[redacted phone]")
    .replace(/\b(?:https?:\/\/|www\.)\S+/gi, "[redacted link]")
    .replace(/^\s*(?:name|address|location)\s*:\s*.*$/gim, "[redacted identity field]")
    .trim();
}

function prepareResumeForScreening(value) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("Resume text is required.");
  }

  if (value.length > MAX_RESUME_LENGTH) {
    throw new Error(`Resume text must be ${MAX_RESUME_LENGTH} characters or fewer.`);
  }

  return redactIdentity(value);
}

function validateScreening(result) {
  const score = Number(result?.score);
  const experienceYears = Number(result?.experience_years);
  const skills = Array.isArray(result?.skills) ? result.skills.filter((skill) => typeof skill === "string").slice(0, 5) : [];

  if (!Number.isFinite(score) || score < 0 || score > 100) {
    throw new Error("Screening service returned an invalid score.");
  }
  if (!Number.isFinite(experienceYears) || experienceYears < 0) {
    throw new Error("Screening service returned invalid experience years.");
  }

  return { score: Math.round(score), skills, experience_years: Math.round(experienceYears * 10) / 10 };
}

module.exports = { MAX_RESUME_LENGTH, redactIdentity, prepareResumeForScreening, validateScreening };
