from pathlib import Path

from app.services.scorer import analyze, extract_skills

DATA = Path(__file__).resolve().parent.parent / "data"


def test_extract_skills_handles_special_chars():
    found = extract_skills("Worked with C++, Node.js and Python.")
    assert {"c++", "node.js", "python"} <= found


def test_no_false_match_inside_words():
    assert "r" not in extract_skills("I love programming")


def test_analyze_with_job_description():
    resume = (DATA / "sample_resume.txt").read_text()
    job = (DATA / "sample_job_description.txt").read_text()
    result = analyze(resume, job)

    assert result["has_email"] and result["has_phone"]
    assert "python" in result["matched_skills"]
    assert "docker" in result["missing_skills"]
    assert 0 <= result["score"] <= 100
