
from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")

    assert response.status_code == 200
    assert response.json()["message"] == (
        "AI Resume Screening API is running"
    )


def test_health_endpoint():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_candidates_endpoint():
    response = client.get("/candidates")

    assert response.status_code == 200

    data = response.json()

    assert "total" in data
    assert "candidates" in data
    assert isinstance(data["candidates"], list)


def test_candidates_search_endpoint():
    response = client.get(
        "/candidates",
        params={"search": "test"},
    )

    assert response.status_code == 200
    assert isinstance(
        response.json()["candidates"],
        list,
    )


def test_candidates_invalid_sort():
    response = client.get(
        "/candidates",
        params={"sort": "invalid_sort"},
    )

    assert response.status_code == 400
