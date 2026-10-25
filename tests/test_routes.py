from io import BytesIO

from app import create_app


def test_analyze_creates_missing_upload_directory(tmp_path):
    upload_folder = tmp_path / "uploads" / "nested"
    app = create_app()
    app.config.update(TESTING=True, UPLOAD_FOLDER=upload_folder)

    response = app.test_client().post(
        "/analyze",
        data={
            "resume": (
                BytesIO(
                    b"Jane Doe\njane@example.com\n"
                    b"Experience\nBuilt Python and Flask applications for clients."
                ),
                "resume.txt",
            )
        },
        content_type="multipart/form-data",
    )

    assert response.status_code == 200
    assert b"Results for resume.txt" in response.data
    assert upload_folder.is_dir()
    assert list(upload_folder.iterdir()) == []
