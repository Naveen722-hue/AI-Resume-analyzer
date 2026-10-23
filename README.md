# AI-Resume-analyzer
AI Resume Analyzer extracts text from uploaded resumes, detects skills and key sections, and compares them with a job description to show a match percentage and missing skills. It gives a 0–100 score with practical suggestions, and can add written feedback from Claude through the Anthropic API.

## Deployment (Netlify)
The live site runs on Netlify as a static page (`public/`) plus two Netlify Functions:
`/api/analyze` (text extraction + scoring, see `lib/`) and `/api/feedback` (Claude feedback via
Netlify AI Gateway, so no API key is needed). Run it locally with `npm install && netlify dev`.
The original Flask version is still in `resume-analyzer/resume-analyzer/` for local Python use.
