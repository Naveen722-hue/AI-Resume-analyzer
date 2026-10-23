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

## Deploy to Render

The local address above only works on the computer running the app. To open it
from a phone over the internet, deploy it to a hosting service first. Render
will provide the public address after deployment.

This repository includes a `render.yaml` deployment configuration. To deploy:

1. Create a GitHub account if you don't already have one, then create a
   repository and upload this project. Do not upload `.env`, `.venv`, or
   `__pycache__` folders, and do not publish API keys.
2. Sign in to Render, choose **New** > **Web Service**, and connect the GitHub
   repository.
3. Render reads `render.yaml` to install dependencies and start the app. After
   deployment, Render displays the public URL; open that URL on your phone.

The Render URL remains the same between deployments, though free services may
spin down after inactivity and take a little while to respond to the next
request. Resume uploads are temporary and the app deletes them after parsing.
AI feedback is optional; configure `ANTHROPIC_API_KEY` privately in the Render
service environment only if you want that feature.

## Tests
```bash
pytest
```

## Ideas for next steps
- OCR for scanned PDFs
- Store past analyses in SQLite
- Better skill extraction (spaCy)
- Export report as PDF
