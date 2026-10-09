import re

from backend.app.services.skill_extractor import extract_skills
from backend.app.services.resume_extractor import extract_education


def extract_minimum_experience(text: str):
    """
    Extract minimum years of experience from a job description.

    Examples:
        2+ years of experience
        3 years experience
        minimum 5 years
    """

    patterns = [
        r"(\d+(?:\.\d+)?)\+?\s*years?\s+of\s+experience",
        r"minimum\s+(\d+(?:\.\d+)?)\s*years?",
        r"at\s+least\s+(\d+(?:\.\d+)?)\s*years?",
        r"(\d+(?:\.\d+)?)\+?\s*years?\s+experience",
    ]

    values = []

    for pattern in patterns:

        matches = re.findall(
            pattern,
            text,
            flags=re.IGNORECASE
        )

        for match in matches:
            values.append(float(match))

    if values:
        return max(values)

    return None


def extract_job_title(text: str):
    """
    Extract a probable job title from the beginning of a JD.
    """

    lines = [
        line.strip()
        for line in text.splitlines()
        if line.strip()
    ]

    if not lines:
        return None

    # Common job-title keywords
    job_keywords = [
        "developer",
        "engineer",
        "analyst",
        "manager",
        "associate",
        "advocate",
        "lawyer",
        "consultant",
        "designer",
        "scientist",
        "specialist",
        "executive",
        "administrator",
        "intern",
    ]

    for line in lines[:10]:

        lower_line = line.lower()

        if any(keyword in lower_line for keyword in job_keywords):

            return line

    return lines[0]


def extract_required_education(text: str):
    """
    Extract educational requirements from a job description.
    """

    education = extract_education(text)

    return education

def extract_jd_education(text: str):
    """
    Extract educational qualifications required by a job description.
    """

    normalized = text.lower()

    education = []

    # LL.B.
    if re.search(r"\bll\.?\s*b\.?\b", normalized):
        education.append("LL.B.")

    # LL.M.
    if re.search(r"\bll\.?\s*m\.?\b", normalized):
        education.append("LL.M.")

    # MBA
    if re.search(r"\bmba\b", normalized):
        education.append("MBA")

    # B.Tech
    if re.search(r"\bb\.?\s*tech\b", normalized):
        education.append("B.Tech")

    # M.Tech
    if re.search(r"\bm\.?\s*tech\b", normalized):
        education.append("M.Tech")

    # BCA
    if re.search(r"\bbca\b", normalized):
        education.append("BCA")

    # MCA
    if re.search(r"\bmca\b", normalized):
        education.append("MCA")

    # BBA
    if re.search(r"\bbba\b", normalized):
        education.append("BBA")

    # B.Com
    if re.search(r"\bb\.?\s*com\b", normalized):
        education.append("B.Com")

    return education

def parse_job_description(text: str):
    """
    Convert a job description into structured requirements.
    """

    skills = extract_skills(text)

    education = extract_jd_education(text)

    experience = extract_minimum_experience(text)

    job_title = extract_job_title(text)

    return {
        "job_title": job_title,
        "required_skills": skills,
        "education": education,
        "minimum_experience": experience,
    }