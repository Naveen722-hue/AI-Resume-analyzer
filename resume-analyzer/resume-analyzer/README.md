# AI Resume Analyzer

A small Flask app that reads a resume (PDF / DOCX / TXT), scores it, compares it
against a job description, and optionally asks Claude for written feedback.

## Features
- Text extraction from PDF, DOCX and TXT
- Skill detection and job-description matching
- Section / contact-info checks and a 0-100 score
- Optional AI feedback (Anthropic API)
- Uploaded files are deleted right after parsing

## Project structure
```
resume-analyzer/
├── app/
│   ├── services/      # parser, scorer, ai_feedback
│   ├── utils/         # text cleaning, skill list
│   ├── templates/     # Jinja pages
│   ├── static/        # css + js
│   ├── config.py
│   └── routes.py
├── data/              # sample resume + job description
├── tests/             # pytest tests
├── uploads/           # temp storage (git-ignored)
├── run.py
└── requirements.txt
```

## Setup (VS Code)
```bash
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             # add your ANTHROPIC_API_KEY (optional)
python run.py
```
Open http://127.0.0.1:5000. In VS Code you can also press F5 ("Run Resume Analyzer").

## Tests
```bash
pytest
```

## Ideas for next steps
- OCR for scanned PDFs
- Store past analyses in SQLite
- Better skill extraction (spaCy)
- Export report as PDF
