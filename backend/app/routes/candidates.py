
from fastapi import APIRouter, HTTPException, Query

from backend.app.services.database import (
    get_candidate,
    list_candidates,
)

router = APIRouter(
    prefix="/candidates",
    tags=["Candidates"],
)

ALLOWED_RECOMMENDATIONS = {
    "",
    "STRONG SHORTLIST",
    "SHORTLIST",
    "REVIEW",
    "NOT RECOMMENDED",
}

ALLOWED_SORTS = {
    "newest",
    "oldest",
    "score_high",
    "score_low",
    "name",
}


@router.get("")
def get_candidates(
    search: str = Query(default="", max_length=200),
    recommendation: str = Query(default="", max_length=50),
    sort: str = Query(default="newest"),
):
    if recommendation not in ALLOWED_RECOMMENDATIONS:
        raise HTTPException(
            status_code=400,
            detail="Invalid recommendation filter.",
        )

    if sort not in ALLOWED_SORTS:
        raise HTTPException(
            status_code=400,
            detail="Invalid sort option.",
        )

    records = list_candidates(
        search=search,
        recommendation=recommendation,
        sort=sort,
    )

    return {
        "total": len(records),
        "candidates": records,
    }


@router.get("/{candidate_id}")
def get_candidate_details(candidate_id: int):
    record = get_candidate(candidate_id)

    if record is None:
        raise HTTPException(
            status_code=404,
            detail="Screening record not found.",
        )

    return record
