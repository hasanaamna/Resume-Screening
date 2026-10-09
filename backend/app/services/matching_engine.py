
from backend.app.services.skill_aliases import SKILL_ALIASES
from backend.app.services.similarity_engine import (
    calculate_text_similarity,
)


def calculate_skill_match(
    resume_skills,
    required_skills,
    resume_text="",
):
    """Calculate skill compatibility using exact matches and aliases."""

    if not required_skills:
        return 100.0, [], []

    resume_skills = {
        skill.lower().strip()
        for skill in resume_skills
    }

    matched_skills = []
    missing_skills = []

    for required_skill in required_skills:
        required_skill = required_skill.lower().strip()

        if required_skill in resume_skills:
            matched_skills.append(required_skill)
            continue

        aliases = SKILL_ALIASES.get(required_skill, [])
        alias_found = False

        for alias in aliases:
            if alias.lower().strip() in resume_skills:
                matched_skills.append(required_skill)
                alias_found = True
                break

        if not alias_found:
            missing_skills.append(required_skill)

    score = (
        len(set(matched_skills)) / len(required_skills)
    ) * 100

    return (
        round(score, 2),
        sorted(set(matched_skills)),
        sorted(set(missing_skills)),
    )


def calculate_experience_match(
    candidate_experience,
    required_experience,
):
    """Compare candidate experience against the minimum requirement."""

    if required_experience is None:
        return 100.0

    if candidate_experience is None:
        return 0.0

    if candidate_experience >= required_experience:
        return 100.0

    if required_experience <= 0:
        return 100.0

    score = (
        candidate_experience / required_experience
    ) * 100

    return round(max(0.0, min(score, 100.0)), 2)


def calculate_education_match(
    candidate_education,
    required_education,
):
    """Check whether a required qualification is present."""

    if not required_education:
        return 100.0

    candidate_education = {
        education.lower().strip()
        for education in candidate_education
    }

    required_education = {
        education.lower().strip()
        for education in required_education
    }

    if candidate_education.intersection(required_education):
        return 100.0

    return 0.0


def calculate_job_title_match(
    candidate_titles,
    job_title,
):
    """Calculate basic job-title compatibility."""

    if not job_title:
        return 100.0

    if not candidate_titles:
        return 0.0

    job_title = job_title.lower().strip()

    candidate_titles = [
        title.lower().strip()
        for title in candidate_titles
    ]

    if job_title in candidate_titles:
        return 100.0

    job_words = set(job_title.split())

    for title in candidate_titles:
        title_words = set(title.split())

        if job_words.intersection(title_words):
            return 70.0

    return 0.0


def generate_recommendation(score):
    """Convert the overall score into a recommendation."""

    if score >= 90:
        return "STRONG SHORTLIST"
    elif score >= 75:
        return "SHORTLIST"
    elif score >= 60:
        return "REVIEW"
    else:
        return "NOT RECOMMENDED"


def calculate_match_score(resume_data, job_data):
    """
    Calculate the complete screening score.

    Text similarity is provided by the configured semantic
    similarity engine. The other scoring components retain
    their existing weights.
    """

    # Skills: 40%
    (
        skill_score,
        matched_skills,
        missing_skills,
    ) = calculate_skill_match(
        resume_data.get("skills", []),
        job_data.get("required_skills", []),
        resume_data.get("text", ""),
    )

    # Experience: 25%
    experience_score = calculate_experience_match(
        resume_data.get("years_of_experience"),
        job_data.get("minimum_experience"),
    )

    # Education: 15%
    education_score = calculate_education_match(
        resume_data.get("education", []),
        job_data.get("education", []),
    )

    # Job title: 10%
    title_score = calculate_job_title_match(
        resume_data.get("job_titles", []),
        job_data.get("job_title"),
    )

    # Semantic text similarity: 10%
    similarity_score = calculate_text_similarity(
        resume_data.get("text", ""),
        job_data.get("text", job_data.get("description", "")),
    )

    # Weighted overall score
    overall_score = (
        skill_score * 0.40
        + experience_score * 0.25
        + education_score * 0.15
        + title_score * 0.10
        + similarity_score * 0.10
    )

    overall_score = round(overall_score, 2)

    recommendation = generate_recommendation(overall_score)

    return {
        "overall_score": overall_score,
        "skill_score": skill_score,
        "experience_score": experience_score,
        "education_score": education_score,
        "job_title_score": title_score,
        "similarity_score": similarity_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "recommendation": recommendation,
    }
