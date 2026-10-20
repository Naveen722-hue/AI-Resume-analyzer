import uuid
from pathlib import Path

from flask import Blueprint, current_app, flash, redirect, render_template, request, url_for
from werkzeug.utils import secure_filename

from .services.ai_feedback import get_ai_feedback
from .services.parser import UnsupportedFileError, extract_text
from .services.scorer import analyze

main = Blueprint("main", __name__)


@main.route("/")
def index():
    return render_template("index.html")


@main.route("/analyze", methods=["POST"])
def analyze_resume():
    file = request.files.get("resume")
    job_text = request.form.get("job_description", "")
    use_ai = request.form.get("use_ai") == "on"

    if not file or file.filename == "":
        flash("Please choose a resume file.")
        return redirect(url_for("main.index"))

    ext = Path(file.filename).suffix.lower()
    if ext not in current_app.config["ALLOWED_EXTENSIONS"]:
        flash("Only PDF, DOCX and TXT files are supported.")
        return redirect(url_for("main.index"))

    save_name = f"{uuid.uuid4().hex}_{secure_filename(file.filename)}"
    save_path = Path(current_app.config["UPLOAD_FOLDER"]) / save_name
    file.save(save_path)

    try:
        text = extract_text(save_path)
    except UnsupportedFileError as err:
        flash(str(err))
        return redirect(url_for("main.index"))
    except Exception:
        flash("Couldn't read that file. Is it corrupted or password protected?")
        return redirect(url_for("main.index"))
    finally:
        save_path.unlink(missing_ok=True)  # don't keep people's resumes around

    if len(text) < 50:
        flash("Couldn't find enough text. Scanned PDFs aren't supported yet.")
        return redirect(url_for("main.index"))

    result = analyze(text, job_text)
    ai_feedback = get_ai_feedback(text, job_text) if use_ai else None

    return render_template(
        "result.html",
        result=result,
        ai_feedback=ai_feedback,
        asked_for_ai=use_ai,
        filename=file.filename,
    )
