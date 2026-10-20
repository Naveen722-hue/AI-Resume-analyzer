import pytest

from app.services.parser import UnsupportedFileError, extract_text


def test_reads_txt(tmp_path):
    f = tmp_path / "cv.txt"
    f.write_text("Hello   resume")
    assert extract_text(f) == "Hello resume"


def test_rejects_unknown_type(tmp_path):
    f = tmp_path / "cv.exe"
    f.write_text("nope")
    with pytest.raises(UnsupportedFileError):
        extract_text(f)
