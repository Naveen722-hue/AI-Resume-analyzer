import re

from app.utils.skills import SKILLS
from app.utils.text_cleaner import word_count

SECTION_KEYWORDS = {
    "summary": ["summary", "objective", "profile"],
    "experience": ["experience", "employment", "work history"],
    "education": ["education", "academic"],
    "skills": ["skills", "technologies", "tech stack"],
    "projects": ["projects"],
}

EMAIL_RE = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
PHONE_RE = re.compile(r"(\+?\d[\d\s().-]{8,}\d)")


def _skill_pattern(skill: str) -> re.Pattern:
    # lookarounds instead of \b so "c++" and "node.js" still match properly
    return re.compile(
        rf"(?<![a-z0-9+#.]){re.escape(skill)}(?![a-z0-9+#])", re.IGNORECASE
    )


def extract_skills(text: str, skill_list=None) -> set:
    skill_list = skill_list or SKILLS
    return {s for s in skill_list if _skill_pattern(s).search(text)}


def find_sections(text: str) -> list:
    lower = text.lower()
    return [
        name
        for name, words in SECTION_KEYWORDS.items()
        if any(re.search(rf"^\s*{w}\b", lower, re.MULTILINE) for w in words)
    ]


def analyze(resume_text: str, job_text: str = "") -> dict:
    resume_skills = extract_skills(resume_text)
    sections = find_sections(resume_text)
    words = word_count(resume_text)
    has_email = bool(EMAIL_RE.search(resume_text))
    has_phone = bool(PHONE_RE.search(resume_text))

    matched, missing, match_pct = set(), set(), None
    if job_text.strip():
        job_skills = extract_skills(job_text)
        matched = resume_skills & job_skills
        missing = job_skills - resume_skills
        if job_skills:
            match_pct = round(len(matched) / len(job_skills) * 100)

    # --- scoring: simple and easy to tweak ---
    section_score = len(sections) / len(SECTION_KEYWORDS) * 25
    contact_score = (has_email + has_phone) * 7.5
    length_score = 10 if 300 <= words <= 900 else 5 if words >= 150 else 0
    skills_score = min(len(resume_skills), 10) / 10 * 25

    if match_pct is not None:
        job_score = match_pct / 100 * 25
    else:
        job_score = 25 * 0.6  # no JD given -> neutral-ish

    total = round(section_score + contact_score + length_score + skills_score + job_score)

    tips = []
    if not has_email:
        tips.append("Add a professional email address.")
    if not has_phone:
        tips.append("Add a phone number.")
    for name in SECTION_KEYWORDS:
        if name not in sections:
            tips.append(f"Consider adding a '{name.title()}' section.")
    if words < 300:
        tips.append("Resume looks short - add more detail on your impact.")
    if words > 900:
        tips.append("Resume is long - try to keep it to 1-2 pages.")
    if missing:
        tips.append("Job description mentions skills you didn't list: "
                    + ", ".join(sorted(missing)) + ".")

    return {
        "score": min(total, 100),
        "word_count": words,
        "skills_found": sorted(resume_skills),
        "sections_found": sections,
        "has_email": has_email,
        "has_phone": has_phone,
        "matched_skills": sorted(matched),
        "missing_skills": sorted(missing),
        "match_pct": match_pct,
        "tips": tips,
    }
