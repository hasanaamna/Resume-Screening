from backend.app.services.resume_parser import extract_resume_text
from backend.app.services.text_preprocessor import clean_text
from backend.app.services.skill_extractor import extract_skills
from backend.app.services.resume_extractor import (
    extract_resume_information
)
from backend.app.services.job_description_parser import (
    parse_job_description
)
from backend.app.services.matching_engine import (
    calculate_match_score
)


RESUME_PATH = "data/resumes/Adv Sana Resume U.pdf"

JOB_PATH = "data/job_descriptions/legal_associate.txt"


# ============================================
# RESUME
# ============================================

raw_resume = extract_resume_text(RESUME_PATH)

cleaned_resume = clean_text(raw_resume)

resume_information = extract_resume_information(
    cleaned_resume
)

resume_skills = extract_skills(cleaned_resume)


resume_data = {
    **resume_information,
    "skills": resume_skills,
    "text": cleaned_resume
}


# ============================================
# JOB DESCRIPTION
# ============================================

with open(
    JOB_PATH,
    "r",
    encoding="utf-8"
) as file:

    job_description = file.read()


job_data = parse_job_description(
    job_description
)

job_data["text"] = job_description


# ============================================
# MATCHING
# ============================================

result = calculate_match_score(
    resume_data,
    job_data
)


# ============================================
# DISPLAY
# ============================================

print("\n" + "=" * 60)
print("RESUME SCREENING RESULT")
print("=" * 60)

print(
    f"\nOverall Score: "
    f"{result['overall_score']}%"
)

print(
    f"\nSkills Match: "
    f"{result['skill_score']}%"
)

print(
    f"Experience Match: "
    f"{result['experience_score']}%"
)

print(
    f"Education Match: "
    f"{result['education_score']}%"
)

print(
    f"Job Title Match: "
    f"{result['job_title_score']}%"
)

print(
    f"Text Similarity: "
    f"{result['similarity_score']}%"
)

print("\n" + "-" * 60)

print("\nMATCHED SKILLS:")

for skill in result["matched_skills"]:
    print(f"✓ {skill}")


print("\nMISSING SKILLS:")

for skill in result["missing_skills"]:
    print(f"✗ {skill}")


print("\n" + "-" * 60)

print(
    f"\nRECOMMENDATION: "
    f"{result['recommendation']}"
)

print("\n" + "=" * 60)