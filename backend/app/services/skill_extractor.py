import re


SKILLS = [

    # =========================
    # Programming / Software
    # =========================
    "python",
    "java",
    "javascript",
    "typescript",
    "react",
    "react.js",
    "node.js",
    "html",
    "css",
    "sql",

    # =========================
    # Data / AI
    # =========================
    "machine learning",
    "deep learning",
    "artificial intelligence",
    "natural language processing",
    "nlp",
    "llm",
    "rag",
    "langchain",
    "tensorflow",
    "pytorch",
    "scikit-learn",
    "pandas",
    "numpy",

    # =========================
    # Backend / APIs
    # =========================
    "fastapi",
    "django",
    "flask",
    "rest api",
    "rest apis",

    # =========================
    # Databases
    # =========================
    "mysql",
    "postgresql",
    "mongodb",
    "database",

    # =========================
    # Cloud / DevOps
    # =========================
    "docker",
    "kubernetes",
    "aws",
    "azure",
    "git",
    "github",
    "linux",

    # =========================
    # Data / Analytics
    # =========================
    "power bi",
    "tableau",
    "excel",
    "microsoft excel",
    "data analysis",
    "data analytics",

    # =========================
    # HR
    # =========================
    "human resources",
    "hr",
    "recruitment",
    "talent acquisition",
    "employee relations",
    "performance management",
    "hr policies",
    "workplace compliance",
    "people management",

    # =========================
    # Legal
    # =========================
    "property law",
    "real estate law",
    "commercial law",
    "contract law",
    "labour law",
    "employment law",
    "corporate law",
    "civil law",
    "litigation",
    "legal research",
    "legal drafting",
    "contract drafting",
    "contract vetting",
    "due diligence",
    "risk assessment",
    "statutory compliance",
    "dispute resolution",
    "mediation",
    "property registration",
    "title verification",
    "sale deeds",
    "lease agreements",
    "legal notices",
    "commercial disputes",
    "employment contracts",
    "industrial disputes",
    "pleadings",
    "court proceedings",
    "court appearances",
    "bail matters",
    "juvenile matters",
    "rti applications",
    "e-filing",

    # =========================
    # Business / Management
    # =========================
    "operations",
    "logistics",
    "supply chain",
    "vendor management",
    "stakeholder management",
    "team management",
    "team leadership",
    "project management",
    "business operations",
    "process management",

    # =========================
    # Soft Skills
    # =========================
    "negotiation",
    "client handling",
    "communication",
    "time management",
    "attention to detail",
]


def extract_skills(text: str) -> list:
    """
    Extract skills from resume text.

    Parameters
    ----------
    text : str
        Cleaned or raw resume text.

    Returns
    -------
    list
        List of detected skills.
    """

    text_lower = text.lower()

    found_skills = []

    for skill in SKILLS:

        pattern = r"(?<!\w)" + re.escape(skill.lower()) + r"(?!\w)"

        if re.search(pattern, text_lower):
            found_skills.append(skill)

    return sorted(set(found_skills))