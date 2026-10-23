import { SKILLS } from "./skills.js";
import { wordCount } from "./text.js";

const SECTION_KEYWORDS: Record<string, string[]> = {
  summary: ["summary", "objective", "profile"],
  experience: ["experience", "employment", "work history"],
  education: ["education", "academic"],
  skills: ["skills", "technologies", "tech stack"],
  projects: ["projects"],
};

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/;
const PHONE_RE = /(\+?\d[\d\s().-]{8,}\d)/;

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// lookarounds instead of \b so "c++" and "node.js" still match properly
const skillPattern = (skill: string) =>
  new RegExp(`(?<![a-z0-9+#.])${escapeRe(skill)}(?![a-z0-9+#])`, "i");

export function extractSkills(text: string, skillList: string[] = SKILLS): Set<string> {
  return new Set(skillList.filter((s) => skillPattern(s).test(text)));
}

export function findSections(text: string): string[] {
  const lower = text.toLowerCase();
  return Object.entries(SECTION_KEYWORDS)
    .filter(([, words]) => words.some((w) => new RegExp(`^\\s*${w}\\b`, "m").test(lower)))
    .map(([name]) => name);
}

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function analyze(resumeText: string, jobText = "") {
  const resumeSkills = extractSkills(resumeText);
  const sections = findSections(resumeText);
  const words = wordCount(resumeText);
  const hasEmail = EMAIL_RE.test(resumeText);
  const hasPhone = PHONE_RE.test(resumeText);

  let matched: string[] = [];
  let missing: string[] = [];
  let matchPct: number | null = null;
  if (jobText.trim()) {
    const jobSkills = extractSkills(jobText);
    matched = [...jobSkills].filter((s) => resumeSkills.has(s));
    missing = [...jobSkills].filter((s) => !resumeSkills.has(s));
    if (jobSkills.size) {
      matchPct = Math.round((matched.length / jobSkills.size) * 100);
    }
  }

  // --- scoring: simple and easy to tweak ---
  const sectionScore = (sections.length / Object.keys(SECTION_KEYWORDS).length) * 25;
  const contactScore = (Number(hasEmail) + Number(hasPhone)) * 7.5;
  const lengthScore = words >= 300 && words <= 900 ? 10 : words >= 150 ? 5 : 0;
  const skillsScore = (Math.min(resumeSkills.size, 10) / 10) * 25;
  const jobScore = matchPct !== null ? (matchPct / 100) * 25 : 25 * 0.6; // no JD given -> neutral-ish

  const total = Math.round(sectionScore + contactScore + lengthScore + skillsScore + jobScore);

  const tips: string[] = [];
  if (!hasEmail) tips.push("Add a professional email address.");
  if (!hasPhone) tips.push("Add a phone number.");
  for (const name of Object.keys(SECTION_KEYWORDS)) {
    if (!sections.includes(name)) tips.push(`Consider adding a '${titleCase(name)}' section.`);
  }
  if (words < 300) tips.push("Resume looks short - add more detail on your impact.");
  if (words > 900) tips.push("Resume is long - try to keep it to 1-2 pages.");
  if (missing.length) {
    tips.push(`Job description mentions skills you didn't list: ${[...missing].sort().join(", ")}.`);
  }

  return {
    score: Math.min(total, 100),
    word_count: words,
    skills_found: [...resumeSkills].sort(),
    sections_found: sections,
    has_email: hasEmail,
    has_phone: hasPhone,
    matched_skills: matched.sort(),
    missing_skills: missing.sort(),
    match_pct: matchPct,
    tips,
  };
}
