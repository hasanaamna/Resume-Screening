
from pathlib import Path
import shutil
import uuid

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from backend.app.services.resume_parser import extract_resume_text
from backend.app.services.text_preprocessor import clean_text
from backend.app.services.skill_extractor import extract_skills
from backend.app.services.resume_extractor import extract_resume_information
from backend.app.services.job_description_parser import parse_job_description
from backend.app.services.matching_engine import calculate_match_score
from backend.app.services.database import save_candidate


router = APIRouter(
    prefix="/screen",
    tags=["Resume Screening"],
)

# Resolve the upload directory relative to this file's project structure.
BASE_DIR = Path(__file__).resolve().parents[3]
UPLOAD_DIR = BASE_DIR / "backend" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".docx"}


@router.post("")
async def screen_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
):
    """Screen a resume against a job description and save the result."""

    file_path = None

    try:
        # 1. Validate the uploaded resume.
        if not resume.filename:
            raise HTTPException(
                status_code=400,
                detail="Resume file is required.",
            )

        extension = Path(resume.filename).suffix.lower()

        if extension not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail="Only PDF and DOCX resumes are supported.",
            )

        if not job_description.strip():
            raise HTTPException(
                status_code=400,
                detail="Job description cannot be empty.",
            )

        # 2. Save the resume temporarily.
        unique_filename = f"{uuid.uuid4().hex}{extension}"
        file_path = UPLOAD_DIR / unique_filename

        with file_path.open("wb") as buffer:
            shutil.copyfileobj(resume.file, buffer)

        # 3. Extract and clean resume text.
        raw_resume = extract_resume_text(str(file_path))

        if not raw_resume.strip():
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from the uploaded resume.",
            )

        cleaned_resume = clean_text(raw_resume)

        # 4. Extract candidate information and skills.
        resume_information = extract_resume_information(cleaned_resume)
        resume_skills = extract_skills(cleaned_resume)

        resume_data = {
            **resume_information,
            "skills": resume_skills,
            "text": cleaned_resume,
        }

        # 5. Parse the job description.
        job_data = parse_job_description(job_description)
        job_data["text"] = job_description
        job_data["description"] = job_description

        # 6. Calculate the screening result.
        result = calculate_match_score(resume_data, job_data)

        candidate_data = {
            "name": resume_information.get("name"),
            "email": resume_information.get("email"),
            "phone": resume_information.get("phone"),
        }

        job_result = {
            "title": job_data.get("job_title"),
            "minimum_experience": job_data.get("minimum_experience"),
            "required_education": job_data.get("education", []),
        }

        screening_result = {
            "overall_score": result["overall_score"],
            "recommendation": result["recommendation"],
            "scores": {
                "skills": result["skill_score"],
                "experience": result["experience_score"],
                "education": result["education_score"],
                "job_title": result["job_title_score"],
                "text_similarity": result["similarity_score"],
            },
            "matched_skills": result["matched_skills"],
            "missing_skills": result["missing_skills"],
        }

        resume_result = {
            "skills": resume_skills,
            "education": resume_information.get("education", []),
            "years_of_experience": resume_information.get(
                "years_of_experience"
            ),
            "job_titles": resume_information.get("job_titles", []),
        }

        # 7. Save this screening as a separate history record.
        # Every successful screening creates a new database ID.
        candidate_id = save_candidate(
            candidate=candidate_data,
            job=job_result,
            screening=screening_result,
            resume=resume_result,
        )

        # 8. Return the API response.
        return {
            "candidate_id": candidate_id,
            "screening_id": candidate_id,
            "candidate": candidate_data,
            "job": job_result,
            "screening": screening_result,
            "resume": resume_result,
        }

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Resume screening failed: {str(exc)}",
        ) from exc

    finally:
        # Remove the temporary uploaded resume.
        if file_path is not None and file_path.exists():
            file_path.unlink()

        await resume.close()
