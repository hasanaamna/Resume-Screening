
import json
import sqlite3
from pathlib import Path
from typing import Any

DATABASE_PATH = Path(__file__).resolve().parents[2] / "candidates.db"


def get_connection():
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DATABASE_PATH, timeout=10)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    with get_connection() as connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS candidates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                email TEXT,
                phone TEXT,
                job_title TEXT,
                overall_score REAL NOT NULL,
                recommendation TEXT NOT NULL,
                scores_json TEXT NOT NULL,
                matched_skills_json TEXT NOT NULL,
                missing_skills_json TEXT NOT NULL,
                resume_skills_json TEXT NOT NULL,
                education_json TEXT NOT NULL,
                years_of_experience REAL,
                job_titles_json TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT
                    (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
            )
        """)


def save_candidate(
    candidate: dict[str, Any],
    job: dict[str, Any],
    screening: dict[str, Any],
    resume: dict[str, Any],
) -> int:
    """Save every screening attempt as a new history record."""
    with get_connection() as connection:
        cursor = connection.execute(
            """
            INSERT INTO candidates (
                name, email, phone, job_title,
                overall_score, recommendation, scores_json,
                matched_skills_json, missing_skills_json,
                resume_skills_json, education_json,
                years_of_experience, job_titles_json
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                candidate.get("name"),
                candidate.get("email"),
                candidate.get("phone"),
                job.get("title"),
                float(screening["overall_score"]),
                screening["recommendation"],
                json.dumps(screening.get("scores", {})),
                json.dumps(screening.get("matched_skills", [])),
                json.dumps(screening.get("missing_skills", [])),
                json.dumps(resume.get("skills", [])),
                json.dumps(resume.get("education", [])),
                resume.get("years_of_experience"),
                json.dumps(resume.get("job_titles", [])),
            ),
        )
        return int(cursor.lastrowid)


def _serialize_candidate(row: sqlite3.Row) -> dict[str, Any]:
    item = dict(row)

    json_fields = {
        "scores_json": "scores",
        "matched_skills_json": "matched_skills",
        "missing_skills_json": "missing_skills",
        "resume_skills_json": "resume_skills",
        "education_json": "education",
        "job_titles_json": "job_titles",
    }

    for database_field, response_field in json_fields.items():
        item[response_field] = json.loads(item.pop(database_field) or "[]")

    return item


def list_candidates(
    search: str = "",
    recommendation: str = "",
    sort: str = "newest",
) -> list[dict[str, Any]]:
    conditions = []
    parameters: list[Any] = []

    if search.strip():
        term = f"%{search.strip()}%"
        conditions.append(
            "(name LIKE ? OR email LIKE ? OR job_title LIKE ?)"
        )
        parameters.extend([term, term, term])

    if recommendation.strip():
        conditions.append("recommendation = ?")
        parameters.append(recommendation.strip())

    where_clause = (
        "WHERE " + " AND ".join(conditions)
        if conditions
        else ""
    )

    sort_options = {
        "newest": "created_at DESC, id DESC",
        "oldest": "created_at ASC, id ASC",
        "score_high": "overall_score DESC, id DESC",
        "score_low": "overall_score ASC, id ASC",
        "name": "name COLLATE NOCASE ASC, id DESC",
    }
    order_clause = sort_options.get(sort, sort_options["newest"])

    with get_connection() as connection:
        rows = connection.execute(
            f"""
            SELECT * FROM candidates
            {where_clause}
            ORDER BY {order_clause}
            """,
            parameters,
        ).fetchall()

    return [_serialize_candidate(row) for row in rows]


def get_candidate(candidate_id: int) -> dict[str, Any] | None:
    with get_connection() as connection:
        row = connection.execute(
            "SELECT * FROM candidates WHERE id = ?",
            (candidate_id,),
        ).fetchone()

    return _serialize_candidate(row) if row else None
