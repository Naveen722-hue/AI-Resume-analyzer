from app.utils.text_cleaner import clean_text, word_count


def test_clean_text_collapses_whitespace():
    assert clean_text("hello    world\n\n\n\nbye") == "hello world\n\nbye"


def test_word_count():
    assert word_count("one two three") == 3
