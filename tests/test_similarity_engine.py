
from backend.app.services.similarity_engine import (
    calculate_text_similarity,
)


def test_similarity_returns_percentage():
    score = calculate_text_similarity(
        "Python developer experienced in FastAPI and REST APIs",
        "Looking for a Python engineer to build APIs using FastAPI",
    )

    assert 0 <= score <= 100


def test_identical_text_has_high_similarity():
    text = (
        "Python developer with experience in FastAPI "
        "and machine learning"
    )

    score = calculate_text_similarity(text, text)

    assert score > 95


def test_empty_resume_returns_zero():
    score = calculate_text_similarity(
        "",
        "Looking for a Python developer",
    )

    assert score == 0.0


def test_empty_job_description_returns_zero():
    score = calculate_text_similarity(
        "Python developer with API experience",
        "",
    )

    assert score == 0.0
