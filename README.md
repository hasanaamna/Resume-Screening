# TalentAI — AI-Powered Resume Screening System

An AI-powered resume screening application that analyzes resumes against job descriptions, evaluates candidate suitability, and helps recruiters organize candidates using an interactive dashboard.

TalentAI combines **Natural Language Processing (NLP), semantic similarity, machine learning techniques, and a FastAPI backend** to streamline the initial resume screening process.

## Overview

Recruiters often spend significant time reviewing resumes, identifying relevant skills, comparing qualifications, and shortlisting candidates.

TalentAI helps automate this initial screening workflow by extracting information from resumes, comparing candidate profiles with job requirements, calculating matching scores, and generating screening recommendations.

The application also maintains a history of screened candidates, making it easier to review previous results through a web-based dashboard.

## Key Features

- **Resume Upload:** Upload resumes in PDF and DOCX formats.
- **Resume Parsing:** Extract text and identify candidate information, including names, email addresses, phone numbers, education, experience, and job titles where available.
- **Skill Extraction:** Identify relevant skills using skill dictionaries and aliases.
- **Job Description Analysis:** Process job requirements to identify relevant skills, qualifications, and experience expectations.
- **AI-Based Matching:** Evaluate candidates using skills, experience, education, job-title relevance, and semantic text similarity.
- **Weighted Scoring:** Combine individual matching scores into an overall candidate score.
- **Screening Recommendations:** Categorize candidates according to their overall scores.
- **Candidate Database:** Store screening results and retrieve previously screened candidates using SQLite.
- **Interactive Dashboard:** Review candidates, search records, filter recommendations, and sort results.
- **REST API:** Expose screening and candidate-management functionality through FastAPI.
- **Automated Testing:** Validate core API and semantic similarity functionality with pytest.

## Technology Stack

| Category | Technologies |
|---|---|
| Language | Python, JavaScript |
| Backend | FastAPI, Uvicorn |
| Frontend | HTML5, CSS3, JavaScript |
| AI / NLP | Sentence Transformers, NLP-based text processing |
| Embeddings | `sentence-transformers/all-MiniLM-L6-v2` |
| Machine Learning | Scikit-learn, cosine similarity |
| Document Processing | PyPDF, python-docx |
| Data Processing | Pandas, NumPy |
| Database | SQLite |
| Testing | Pytest |
| Development Tools | VS Code, Git, GitHub |

## How It Works

```text
                 Resume Upload
                       |
                       v
              PDF / DOCX Parsing
                       |
                       v
                Text Processing
                       |
                       v
             Candidate Information
               and Skill Extraction
                       |
                       v
              Job Description Input
                       |
                       v
             Candidate Matching Engine
                       |
          +------------+------------+
          |            |            |
          v            v            v
        Skills     Experience    Education
          |            |            |
          +------------+------------+
                       |
                       v
             Job Title and Semantic
                Text Similarity
                       |
                       v
              Weighted Match Score
                       |
                       v
             Screening Recommendation
                       |
                       v
             SQLite Candidate History
                       |
                       v
               TalentAI Dashboard
```

## Candidate Matching Methodology

TalentAI evaluates candidates across five dimensions:

| Matching dimension | Weight |
|---|---:|
| Skills match | 40% |
| Experience match | 25% |
| Education match | 15% |
| Job-title match | 10% |
| Semantic text similarity | 10% |
| **Total** | **100%** |

The overall score is calculated as a weighted combination of the component scores:

\[
S = 0.40S_s + 0.25S_e + 0.15S_d + 0.10S_t + 0.10S_m
\]

Where:

- \(S_s\) = Skills match score
- \(S_e\) = Experience match score
- \(S_d\) = Education match score
- \(S_t\) = Job-title match score
- \(S_m\) = Semantic text similarity score

The semantic similarity component uses sentence embeddings from `all-MiniLM-L6-v2` and cosine similarity to estimate how closely the resume text relates to the job description.

### Screening Recommendations

The current recommendation thresholds are:

| Overall score | Recommendation |
|---|---|
| 90% and above | Strong Shortlist |
| 75% to below 90% | Shortlist |
| 60% to below 75% | Review |
| Below 60% | Not Recommended |

These thresholds are configurable screening rules, not guarantees of job performance. Final hiring decisions should include human review.

## Project Structure

```text
Resume-Screening/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routes/
│   │   │   └── screen.py
│   │   ├── services/
│   │   │   ├── matching_engine.py
│   │   │   └── similarity_engine.py
│   │   └── models/
│   └── uploads/
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── data/
├── models/
├── notebooks/
├── tests/
│   ├── test_api.py
│   └── test_similarity_engine.py
├── .gitignore
├── requirements.txt
└── README.md
```

*Note: The structure above highlights the principal project components. Some directories may contain additional files depending on your current version.*

## Installation and Setup

### Prerequisites

- Python 3.11 or a compatible Python version
- pip
- Git
- A modern web browser

### 1. Clone the repository

Replace the placeholder with your actual GitHub repository URL.

```bash
git clone https://github.com/YOUR-USERNAME/Resume-Screening.git
cd Resume-Screening
```

### 2. Create and activate a virtual environment

**Windows PowerShell:**

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

If PowerShell blocks script execution for this session, run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\venv\Scripts\Activate.ps1
```

### 3. Install dependencies

```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

The semantic similarity engine uses the `sentence-transformers/all-MiniLM-L6-v2` model. Its first use may require downloading the model, so an internet connection may be needed during initial setup.

### 4. Start the FastAPI backend

From the project root, with the virtual environment activated:

```bash
uvicorn backend.app.main:app --reload
```

The backend should be available at:

- API base URL: `http://127.0.0.1:8000`
- Interactive API documentation: `http://127.0.0.1:8000/docs`

Keep this terminal running.

### 5. Start the frontend

Open a second terminal and run:

```powershell
cd C:\future\Resume-Screening\frontend
python -m http.server 5500 --bind 127.0.0.1
```

Open the dashboard at:

`http://127.0.0.1:5500/`

Keep the frontend terminal running as well.

## API Endpoints

The primary API endpoints include:

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/screen` | Upload and analyze a resume against a job description |
| `GET` | `/candidates` | Retrieve previously screened candidates |
| `GET` | `/candidates/{id}` | Retrieve an individual candidate's screening record, if enabled in the current backend |

Explore the interactive API documentation at `http://127.0.0.1:8000/docs` to inspect request fields, responses, and available endpoints.

### Example: Retrieve candidates

```bash
curl http://127.0.0.1:8000/candidates
```

A successful response includes candidate records with available fields such as:

- Candidate ID
- Name and contact information
- Job title
- Overall matching score
- Screening recommendation
- Individual matching scores
- Matched and missing skills
- Experience and education details
- Screening timestamp

The exact fields depend on the API response schema and the information extracted from each resume.

## Running Tests

Run the automated test suite from the project root:

```bash
python -m pytest -v
```

The test suite covers API behavior and semantic similarity functionality.

The latest recorded test run passed **9 tests**. Run the command above on your current checkout to verify that the tests still pass.

## Security and Privacy

- Do not commit real resumes, candidate databases, API keys, passwords, or other sensitive information.
- Keep environment-specific secrets in local environment files excluded by `.gitignore`.
- Use synthetic or anonymized resumes for public demonstrations.
- Treat candidate scores as decision-support signals rather than automatic hiring decisions.
- Before using the application with real recruitment data, review access controls, retention requirements, privacy obligations, and secure file-handling practices.

## Current Scope and Future Improvements

Potential next steps include:

- More robust resume parsing and structured extraction.
- Improved skill normalization and matching evaluation.
- Candidate-detail views and screening-history management.
- Better validation and error handling for uploaded documents.
- Additional unit and integration tests.
- Authentication, role-based access control, and secure deployment.
- Dashboard screenshots, deployment instructions, and performance evaluation.

## What This Project Demonstrates

TalentAI demonstrates practical implementation of:

- Building REST APIs using FastAPI.
- Processing PDF and DOCX documents.
- Extracting structured information from unstructured text.
- Implementing NLP and embedding-based semantic similarity.
- Designing weighted scoring and recommendation logic.
- Persisting screening history with SQLite.
- Connecting a JavaScript frontend to a Python backend.
- Writing automated tests for application functionality.

## Disclaimer

TalentAI is a resume-screening and candidate-matching prototype intended to support recruiter review. Matching scores depend on the quality of extracted data, job-description wording, and configured scoring rules. They should not be treated as definitive measures of candidate suitability.

## Author

**Aamna Hasan**

Computer Science & Engineering | AI/ML | Python | FastAPI | NLP

---

If you find this project useful, consider starring the repository or contributing suggestions for future improvements.
