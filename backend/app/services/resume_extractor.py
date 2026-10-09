import re


def extract_email(text: str):
    """Extract email address from resume."""

    pattern = r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"

    match = re.search(pattern, text)

    if match:
        return match.group(0)

    return None


def extract_phone(text: str):
    """Extract Indian phone number."""

    pattern = r"(?<!\d)[6-9]\d{9}(?!\d)"

    match = re.search(pattern, text)

    if match:
        return match.group(0)

    return None


def extract_name(text: str):
    """
    Extract probable candidate name.

    Most resumes place the candidate's name near the beginning.
    """

    lines = [
        line.strip()
        for line in text.splitlines()
        if line.strip()
    ]

    if not lines:
        return None

    # Check first few lines
    for line in lines[:5]:

        # Ignore lines containing common resume information
        lower_line = line.lower()

        if any(keyword in lower_line for keyword in [
            "@",
            "resume",
            "cv",
            "phone",
            "mobile",
            "email",
            "developer",
            "engineer",
            "advocate",
            "manager",
            "student"
        ]):
            continue

        # Candidate name usually contains only alphabetic characters
        # and spaces.
        if re.fullmatch(r"[A-Za-z ]{3,50}", line):
            return line.strip()

    return None


def extract_years_of_experience(text: str):
    """
    Extract explicit years of experience.

    Examples:
    '5 years of experience'
    '3+ years experience'
    '2 years'
    """

    patterns = [
        r"(\d+(?:\.\d+)?)\+?\s+years?\s+(?:of\s+)?experience",
        r"(\d+(?:\.\d+)?)\+?\s+years?\s+experience",
        r"(\d+(?:\.\d+)?)\+?\s+years?"
    ]

    for pattern in patterns:

        matches = re.findall(
            pattern,
            text,
            flags=re.IGNORECASE
        )

        if matches:
            values = [float(value) for value in matches]

            return max(values)

    return None


def extract_education(text: str):
    """Extract educational qualifications from the education section."""

    lines = [line.strip() for line in text.splitlines() if line.strip()]

    education_section = []

    inside_education = False

    for line in lines:

        upper_line = line.upper()

        if "EDUCATION" in upper_line:
            inside_education = True
            continue

        if inside_education:

            # Stop when another major resume section begins
            if any(section in upper_line for section in [
                "EXPERIENCE",
                "CAREER",
                "SKILLS",
                "COMPETENCIES",
                "REGISTRATION",
                "PROFESSIONAL SUMMARY",
                "WHY HIRE"
            ]):
                break

            education_section.append(line)

    education_text = " ".join(education_section).lower()

    found = []

    # Longer / unambiguous qualifications first
    if re.search(r"\bmba\b", education_text):
        found.append("MBA")

    if re.search(r"\bll\.?\s*b\.?\b", education_text):
        found.append("LL.B.")

    if re.search(r"\bb\.?\s*tech\b", education_text):
        found.append("B.Tech")

    if re.search(r"\bm\.?\s*tech\b", education_text):
        found.append("M.Tech")

    if re.search(r"\bbca\b", education_text):
        found.append("BCA")

    if re.search(r"\bmca\b", education_text):
        found.append("MCA")

    if re.search(r"\bbba\b", education_text):
        found.append("BBA")

    if re.search(r"\bb\.?\s*com\b", education_text):
        found.append("B.Com")

    # Standalone B.A. and M.A.
    if re.search(r"(?<![a-z])b\.a\.(?![a-z])", education_text):
        found.append("B.A.")

    if re.search(r"(?<![a-z])m\.a\.(?![a-z])", education_text):
        found.append("M.A.")

    if re.search(r"\bph\.?\s*d\.?\b", education_text):
        found.append("PhD")

    return found

def extract_job_titles(text: str):
    """Extract common job titles."""

    job_titles = [
        "software engineer",
        "software developer",
        "python developer",
        "backend developer",
        "frontend developer",
        "full stack developer",
        "data scientist",
        "data analyst",
        "machine learning engineer",
        "ai engineer",
        "intern",
        "manager",
        "operations manager",
        "logistics manager",
        "hr manager",
        "project manager",
        "advocate",
        "law associate",
        "legal associate",
        "legal advisor",
        "legal counsel",
        "consultant",
        "analyst",
        "developer",
        "engineer"
    ]

    found = []

    text_lower = text.lower()

    for title in job_titles:

        if title.lower() in text_lower:
            found.append(title)

    return sorted(set(found))


def extract_resume_information(text: str):
    """Extract structured information from resume."""

    return {
        "name": extract_name(text),
        "email": extract_email(text),
        "phone": extract_phone(text),
        "years_of_experience": extract_years_of_experience(text),
        "education": extract_education(text),
        "job_titles": extract_job_titles(text),
    }