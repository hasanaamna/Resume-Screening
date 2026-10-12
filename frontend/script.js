// ======================================================
// TalentAI - Resume Screening Frontend
// ======================================================

const API_URL = "http://127.0.0.1:8000";
const MAX_FILE_SIZE = 10 * 1024 * 1024;

let allCandidates = [];

// ======================================================
// DOM HELPERS
// ======================================================

function getElement(id) {
    return document.getElementById(id);
}

function setText(id, value) {
    const element = getElement(id);
    if (element) {
        element.textContent = value ?? "";
    }
}

function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = String(value ?? "");
    return div.innerHTML;
}

function getInitials(name) {
    const words = String(name || "Candidate")
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
    }

    return (words[0][0] + words[words.length - 1][0])
        .toUpperCase();
}

function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function getCandidateName(candidate) {
    return (
        candidate?.name ||
        candidate?.candidate_name ||
        candidate?.candidate?.name ||
        "Unknown Candidate"
    );
}

function getCandidateEmail(candidate) {
    return (
        candidate?.email ||
        candidate?.candidate_email ||
        candidate?.candidate?.email ||
        "No email detected"
    );
}

function getCandidateId(candidate) {
    return (
        candidate?.id ??
        candidate?.screening_id ??
        candidate?.candidate_id ??
        ""
    );
}

function getScore(candidate) {
    const score = Number(
        candidate?.overall_score ??
        candidate?.screening?.overall_score
    );

    return Number.isFinite(score) ? score : 0;
}

function getRecommendation(candidate) {
    return (
        candidate?.recommendation ||
        candidate?.screening?.recommendation ||
        "REVIEW"
    );
}

function getExperience(candidate) {
    return (
        candidate?.years_of_experience ??
        candidate?.experience ??
        candidate?.resume?.years_of_experience
    );
}

// ======================================================
// ERROR HANDLING
// ======================================================

function showError(message) {
    const error = getElement("error");

    if (!error) {
        console.error(message);
        return;
    }

    error.textContent = message;
    error.classList.remove("hidden");

    error.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

function hideError() {
    getElement("error")?.classList.add("hidden");
}

// ======================================================
// FILE VALIDATION AND UPLOAD UI
// ======================================================

function validateFile(file) {
    if (!file) {
        showError("Please select a resume.");
        return false;
    }

    const extension = file.name
        .split(".")
        .pop()
        .toLowerCase();

    if (!["pdf", "docx"].includes(extension)) {
        showError("Please upload a PDF or DOCX resume.");
        return false;
    }

    if (file.size > MAX_FILE_SIZE) {
        showError("File is too large. Maximum allowed size is 10 MB.");
        return false;
    }

    hideError();
    return true;
}

function handleFile(file) {
    if (!validateFile(file)) return;

    setText("fileName", file.name);
    setText("fileSize", formatFileSize(file.size));

    const fileIcon = getElement("fileIcon");

    if (fileIcon) {
        fileIcon.textContent = file.name
            .split(".")
            .pop()
            .toUpperCase();
    }

    getElement("uploadContent")?.classList.add("hidden");
    getElement("selectedFile")?.classList.remove("hidden");
}

function removeSelectedFile() {
    const input = getElement("resume");

    if (input) input.value = "";

    getElement("selectedFile")?.classList.add("hidden");
    getElement("uploadContent")?.classList.remove("hidden");
    hideError();
}

// ======================================================
// RECOMMENDATION STYLING
// ======================================================

function applyRecommendationStyle(element, recommendation) {
    if (!element) return;

    const value = String(recommendation).toLowerCase();

    element.className = "recommendation";

    if (value.includes("strong")) {
        element.style.background = "#ecfdf3";
        element.style.color = "#15803d";
    } else if (value.includes("shortlist")) {
        element.style.background = "#eff6ff";
        element.style.color = "#2563eb";
    } else if (value.includes("review")) {
        element.style.background = "#fff7ed";
        element.style.color = "#c2410c";
    } else {
        element.style.background = "#fef2f2";
        element.style.color = "#dc2626";
    }
}

function getRecommendationClass(recommendation) {
    const value = String(recommendation || "").toLowerCase();

    if (value.includes("strong")) return "status-shortlist";
    if (value.includes("shortlist")) return "status-shortlist";
    if (value.includes("review")) return "status-review";

    return "status-rejected";
}

// ======================================================
// SCORE DISPLAY
// ======================================================

function updateScoreRing(score) {
    const ring = document.querySelector(".score-ring");
    if (!ring) return;

    const safeScore = Math.max(0, Math.min(100, Number(score) || 0));
    const degrees = safeScore * 3.6;

    ring.style.background = `conic-gradient(
        #2563eb ${degrees}deg,
        #dbeafe ${degrees}deg
    )`;
}

function setScore(elementId, value) {
    const element = getElement(elementId);
    if (!element) return;

    const number = Number(value);
    element.textContent = Number.isFinite(number)
        ? `${number.toFixed(1)}%`
        : "0.0%";
}

function updateProgress(progressId, labelId, value) {
    const number = Math.max(
        0,
        Math.min(100, Number(value) || 0)
    );

    const progress = getElement(progressId);
    const label = getElement(labelId);

    if (progress) progress.style.width = `${number}%`;
    if (label) label.textContent = `${number.toFixed(1)}%`;
}

// ======================================================
// SKILL DISPLAY
// ======================================================

function populateSkills(elementId, skills, type) {
    const container = getElement(elementId);
    if (!container) return;

    container.replaceChildren();

    if (!Array.isArray(skills) || skills.length === 0) {
        const empty = document.createElement("span");
        empty.className = `skill-chip ${type}`;
        empty.textContent = type === "matched"
            ? "No matched skills"
            : "No missing skills";

        container.appendChild(empty);
        return;
    }

    skills.forEach(skill => {
        const chip = document.createElement("span");
        chip.className = `skill-chip ${type}`;
        chip.textContent = type === "matched"
            ? `✓ ${skill}`
            : `× ${skill}`;

        container.appendChild(chip);
    });
}

// ======================================================
// SCREENING RESULTS
// ======================================================

function displayResults(data) {
    if (!data || !data.screening) {
        showError("The API returned an incomplete screening result.");
        return;
    }

    const screening = data.screening;
    const candidate = data.candidate || {};
    const resume = data.resume || {};
    const scores = screening.scores || {};

    const score = Number(screening.overall_score) || 0;
    const recommendation = screening.recommendation || "REVIEW";

    setText("overallScore", `${score.toFixed(1)}%`);
    updateScoreRing(score);

    const recommendationElement = getElement("recommendation");

    if (recommendationElement) {
        recommendationElement.textContent = recommendation;
        applyRecommendationStyle(
            recommendationElement,
            recommendation
        );
    }

    const name = getCandidateName(candidate);

    setText("candidateName", name);
    setText("candidateEmail", getCandidateEmail(candidate));
    setText(
        "candidatePhone",
        candidate.phone || "Phone not detected"
    );
    setText("candidateAvatar", getInitials(name));

    setScore("skillsScore", scores.skills);
    setScore("experienceScore", scores.experience);
    setScore("educationScore", scores.education);
    setScore("jobTitleScore", scores.job_title);
    setScore("similarityScore", scores.text_similarity);

    updateProgress(
        "skillsProgress",
        "breakdownSkills",
        scores.skills
    );

    updateProgress(
        "experienceProgress",
        "breakdownExperience",
        scores.experience
    );

    updateProgress(
        "educationProgress",
        "breakdownEducation",
        scores.education
    );

    updateProgress(
        "jobTitleProgress",
        "breakdownJobTitle",
        scores.job_title
    );

    updateProgress(
        "similarityProgress",
        "breakdownSimilarity",
        scores.text_similarity
    );

    const matchedSkills = Array.isArray(screening.matched_skills)
        ? screening.matched_skills
        : [];

    const missingSkills = Array.isArray(screening.missing_skills)
        ? screening.missing_skills
        : [];

    populateSkills("matchedSkills", matchedSkills, "matched");
    populateSkills("missingSkills", missingSkills, "missing");

    setText("matchedCount", matchedSkills.length);
    setText("missingCount", missingSkills.length);

    const years = resume.years_of_experience;

    setText(
        "experience",
        years !== null && years !== undefined
            ? `${years} years`
            : "Not detected"
    );

    const education = Array.isArray(resume.education)
        ? resume.education
        : [];

    setText(
        "education",
        education.length ? education.join(", ") : "Not detected"
    );

    const jobTitles = Array.isArray(resume.job_titles)
        ? resume.job_titles
        : [];

    setText(
        "jobTitles",
        jobTitles.length ? jobTitles.join(", ") : "Not detected"
    );

    getElement("results")?.classList.remove("hidden");

    getElement("results")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// ======================================================
// SCREEN RESUME
// ======================================================

async function screenResume() {
    hideError();

    const results = getElement("results");
    const loading = getElement("loading");
    const button = getElement("screenButton");
    const resumeInput = getElement("resume");
    const jobDescription = getElement("jobDescription");

    results?.classList.add("hidden");

    if (!resumeInput?.files?.length) {
        showError("Please upload a candidate resume first.");
        return;
    }

    if (!jobDescription?.value.trim()) {
        showError("Please enter a job description first.");
        return;
    }

    const resume = resumeInput.files[0];

    if (!validateFile(resume)) return;

    const formData = new FormData();
    formData.append("resume", resume);
    formData.append("job_description", jobDescription.value.trim());

    loading?.classList.remove("hidden");

    if (button) {
        button.disabled = true;
        button.textContent = "Analyzing...";
    }

    try {
        const response = await fetch(`${API_URL}/screen`, {
            method: "POST",
            body: formData
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(
                data.detail ||
                `Resume screening failed. Server returned ${response.status}.`
            );
        }

        displayResults(data);
        await loadCandidates();
    } catch (error) {
        console.error("Screening error:", error);

        showError(
            error.message ||
            "Unable to connect to the screening API. Check that FastAPI is running."
        );
    } finally {
        loading?.classList.add("hidden");

        if (button) {
            button.disabled = false;
            button.textContent = "✦ Analyze Resume";
        }
    }
}

// ======================================================
// RESET SCREENING
// ======================================================

function resetScreening() {
    getElement("results")?.classList.add("hidden");
    getElement("error")?.classList.add("hidden");

    const resumeInput = getElement("resume");
    if (resumeInput) resumeInput.value = "";

    getElement("selectedFile")?.classList.add("hidden");
    getElement("uploadContent")?.classList.remove("hidden");

    const jobDescription = getElement("jobDescription");

    if (jobDescription) {
        jobDescription.value = "";
    }

    setText("characterCount", "0 characters");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// ======================================================
// LOAD CANDIDATES
// ======================================================

async function loadCandidates() {
    const tableBody = getElement("candidatesTableBody");

    if (!tableBody) return;

    tableBody.innerHTML = `
        <tr>
            <td colspan="6" class="empty-table">
                Loading candidates...
            </td>
        </tr>
    `;

    try {
        const response = await fetch(`${API_URL}/candidates`);

        if (!response.ok) {
            throw new Error(
                `Candidates API returned ${response.status}`
            );
        }

        const data = await response.json();

        // Support either an array response or { candidates: [...] }.
        if (Array.isArray(data)) {
            allCandidates = data;
        } else if (Array.isArray(data.candidates)) {
            allCandidates = data.candidates;
        } else {
            allCandidates = [];
        }

        console.log("Candidates loaded:", allCandidates);

        applyCandidateFilters();
    } catch (error) {
        console.error("Candidate loading error:", error);

        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-table">
                    Unable to load candidates.
                    Make sure the FastAPI backend is running.
                </td>
            </tr>
        `;
    }
}

// ======================================================
// SEARCH, FILTER AND SORT
// ======================================================

function applyCandidateFilters() {
    const searchInput = getElement("candidateSearch");
    const filter = getElement("recommendationFilter");
    const sort = getElement("candidateSort");

    const search = (searchInput?.value || "").trim().toLowerCase();
    const recommendation = filter?.value || "all";
    const sortValue = sort?.value || "score-desc";

    let filtered = [...allCandidates];

    // Search candidate name, email, and job title.
    if (search) {
        filtered = filtered.filter(candidate => {
            const name = getCandidateName(candidate).toLowerCase();
            const email = getCandidateEmail(candidate).toLowerCase();
            const position = String(candidate.job_title || "").toLowerCase();

            return (
                name.includes(search) ||
                email.includes(search) ||
                position.includes(search)
            );
        });
    }

    // Filter recommendation.
    if (recommendation !== "all") {
        filtered = filtered.filter(candidate => {
            const value = getRecommendation(candidate).toLowerCase();

            if (recommendation === "strong") {
                return value.includes("strong");
            }

            if (recommendation === "shortlist") {
                return (
                    value.includes("shortlist") &&
                    !value.includes("strong")
                );
            }

            if (
                recommendation === "not recommended" ||
                recommendation === "rejected"
            ) {
                return (
                    value.includes("not recommended") ||
                    value.includes("reject")
                );
            }

            return value.includes(recommendation.toLowerCase());
        });
    }

    // Sort candidates.
    filtered.sort((a, b) => {
        if (sortValue === "score-desc") {
            return getScore(b) - getScore(a);
        }

        if (sortValue === "score-asc") {
            return getScore(a) - getScore(b);
        }

        if (sortValue === "newest") {
            return (
                new Date(b.created_at || 0) -
                new Date(a.created_at || 0)
            );
        }

        if (sortValue === "oldest") {
            return (
                new Date(a.created_at || 0) -
                new Date(b.created_at || 0)
            );
        }

        if (sortValue === "name") {
            return getCandidateName(a).localeCompare(
                getCandidateName(b)
            );
        }

        return 0;
    });
    console.log("Candidate passed to renderer:", filtered[0]);
    console.log("Candidate name resolved:", getCandidateName(filtered[0]));
    renderCandidates(filtered);
}

// ======================================================
// RENDER CANDIDATE TABLE
// ======================================================


    
function renderCandidates(candidates) {
    const tableBody = document.getElementById("candidatesTableBody");

    if (!tableBody) {
        console.error("Candidate table body not found.");
        return;
    }

    tableBody.innerHTML = "";

    if (!Array.isArray(candidates) || candidates.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-table">
                    No matching candidates found.
                </td>
            </tr>
        `;
        return;
    }

    candidates.forEach(candidate => {
        const row = document.createElement("tr");

        // Correct API field names
        const candidateName =
            candidate.name ||
            candidate.candidate_name ||
            "Unknown Candidate";

        const candidateEmail =
            candidate.email ||
            candidate.candidate_email ||
            "No email detected";

        const candidateId =
            candidate.id ??
            candidate.screening_id ??
            candidate.candidate_id ??
            "";

        const initials = getInitials(candidateName);

        const recommendation = candidate.recommendation || "REVIEW";
        const recommendationClass = getRecommendationClass(recommendation);

        const score = Number(candidate.overall_score ?? 0);
        const experience = candidate.years_of_experience;

        const formattedExperience =
            experience !== null && experience !== undefined
                ? `${experience} years`
                : "—";

        const formattedDate = formatDate(candidate.created_at);

        // Enable opening candidate details if an ID is available
        if (candidateId !== "") {
            row.dataset.screeningId = String(candidateId);
        }

        row.innerHTML = `
            <td>
                <div class="candidate-table-name">
                    <div class="table-avatar">
                        ${escapeHtml(initials)}
                    </div>

                    <div class="table-candidate-info">
                        <strong>${escapeHtml(candidateName)}</strong>
                        <span>${escapeHtml(candidateEmail)}</span>
                    </div>
                </div>
            </td>

            <td>
                ${escapeHtml(candidate.job_title || "Not specified")}
            </td>

            <td>${escapeHtml(formattedExperience)}</td>

            <td>
                <span class="match-score">${score.toFixed(1)}%</span>
            </td>

            <td>
                <span class="status-badge ${recommendationClass}">
                    ${escapeHtml(recommendation)}
                </span>
            </td>

            <td>${escapeHtml(formattedDate)}</td>
        `;

        tableBody.appendChild(row);
    });
}



// ======================================================
// CANDIDATE DETAILS MODAL
// ======================================================

function escapeDetailHtml(value) {
    return escapeHtml(value);
}

function formatDetailDate(value) {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short"
    });
}

function renderDetailSkills(skills, missing = false) {
    if (!Array.isArray(skills) || !skills.length) {
        return '<p class="detail-empty">No skills to display.</p>';
    }

    return `
        <div class="detail-skill-list">
            ${skills.map(skill => `
                <span class="detail-skill ${missing ? "missing" : ""}">
                    ${escapeDetailHtml(skill)}
                </span>
            `).join("")}
        </div>
    `;
}

function renderScoreBreakdown(scores) {
    if (!scores || typeof scores !== "object") {
        return '<p class="detail-empty">No score breakdown available.</p>';
    }

    const labels = {
        skills: "Skills",
        experience: "Experience",
        education: "Education",
        job_title: "Job title",
        text_similarity: "Text similarity"
    };

    return `
        <div class="detail-grid">
            ${Object.entries(labels).map(([key, label]) => {
                const value = Number(scores[key]);
                const score = Number.isFinite(value)
                    ? `${value.toFixed(1)}%`
                    : "Not available";

                return `
                    <div class="detail-field">
                        <span>${label}</span>
                        <strong>${score}</strong>
                    </div>
                `;
            }).join("")}
        </div>
    `;
}

async function openCandidateDetails(candidateId) {
    const modal = getElement("candidateDetailModal");
    const content = getElement("candidateDetailContent");
    const title = getElement("candidateDetailTitle");
    const meta = getElement("detailScreeningMeta");

    if (!modal || !content) {
        console.warn(
            "Candidate detail modal elements were not found in index.html."
        );
        return;
    }

    modal.classList.remove("hidden");

    if (title) title.textContent = "Candidate Details";
    if (meta) meta.textContent = `Screening record #${candidateId}`;

    content.innerHTML =
        '<p class="detail-muted">Loading screening details...</p>';

    try {
        const response = await fetch(
            `${API_URL}/candidates/${encodeURIComponent(candidateId)}`
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(
                data.detail || "Could not load screening details."
            );
        }

        // Support either a direct candidate object or a wrapped object.
        const candidate = data.candidate || data;
        const screening = data.screening || candidate;

        const name = getCandidateName(candidate);
        const email = getCandidateEmail(candidate);
        const score = Number(
            screening.overall_score ?? candidate.overall_score
        );
        const scoreText = Number.isFinite(score)
            ? `${score.toFixed(1)}%`
            : "Not available";

        if (title) title.textContent = name;

        if (meta) {
            meta.textContent =
                `Screening #${candidate.id ?? candidateId} · ` +
                formatDetailDate(candidate.created_at);
        }

        const education = Array.isArray(candidate.education)
            ? candidate.education.join(", ") || "Not available"
            : "Not available";

        const jobTitles = Array.isArray(candidate.job_titles)
            ? candidate.job_titles.join(", ") || "Not available"
            : "Not available";

        const years = getExperience(candidate);
        const scores = screening.scores || candidate.scores || {};

        const matchedSkills = candidate.matched_skills || [];
        const missingSkills = candidate.missing_skills || [];
        const resumeSkills = candidate.resume_skills || [];

        content.innerHTML = `
            <div class="detail-score-card">
                <div class="detail-score">${scoreText}</div>
                <div>Overall match score</div>
                <span class="detail-recommendation">
                    ${escapeDetailHtml(getRecommendation(candidate))}
                </span>
            </div>

            <div class="detail-grid">
                <div class="detail-field">
                    <span>Email</span>
                    <strong>${escapeDetailHtml(email)}</strong>
                </div>

                <div class="detail-field">
                    <span>Phone</span>
                    <strong>${escapeDetailHtml(candidate.phone || "Not available")}</strong>
                </div>

                <div class="detail-field">
                    <span>Position</span>
                    <strong>${escapeDetailHtml(candidate.job_title || "Not specified")}</strong>
                </div>

                <div class="detail-field">
                    <span>Experience</span>
                    <strong>
                        ${years == null
                            ? "Not available"
                            : `${escapeDetailHtml(years)} years`}
                    </strong>
                </div>

                <div class="detail-field">
                    <span>Education</span>
                    <strong>${escapeDetailHtml(education)}</strong>
                </div>

                <div class="detail-field">
                    <span>Previous roles</span>
                    <strong>${escapeDetailHtml(jobTitles)}</strong>
                </div>
            </div>

            <section class="detail-section">
                <h3>Score breakdown</h3>
                ${renderScoreBreakdown(scores)}
            </section>

            <section class="detail-section">
                <h3>Matched skills (${Array.isArray(matchedSkills) ? matchedSkills.length : 0})</h3>
                ${renderDetailSkills(matchedSkills)}
            </section>

            <section class="detail-section">
                <h3>Missing skills (${Array.isArray(missingSkills) ? missingSkills.length : 0})</h3>
                ${renderDetailSkills(missingSkills, true)}
            </section>

            <section class="detail-section">
                <h3>Skills extracted from resume</h3>
                ${renderDetailSkills(resumeSkills)}
            </section>
        `;
    } catch (error) {
        console.error("Candidate detail error:", error);

        content.innerHTML = `
            <div class="detail-error">
                ${escapeDetailHtml(
                    error.message || "Unable to load candidate details."
                )}
            </div>
        `;
    }
}

function closeCandidateDetails() {
    getElement("candidateDetailModal")?.classList.add("hidden");
}

// ======================================================
// SIDEBAR NAVIGATION
// ======================================================

function setupNavigation() {
    const navItems = document.querySelectorAll(".nav-item");

    navItems.forEach(item => {
        item.addEventListener("click", function () {
            navItems.forEach(nav => nav.classList.remove("active"));
            this.classList.add("active");
        });
    });
}

// ======================================================
// INITIALIZE APPLICATION
// ======================================================

document.addEventListener("DOMContentLoaded", () => {
    setupNavigation();

    // Browse button.
    getElement("browseButton")?.addEventListener("click", () => {
        getElement("resume")?.click();
    });

    // Select a resume.
    getElement("resume")?.addEventListener("change", event => {
        const file = event.target.files?.[0];
        if (file) handleFile(file);
    });

    // Remove selected resume.
    getElement("removeFile")?.addEventListener(
        "click",
        removeSelectedFile
    );

    // Drag and drop.
    const dropZone = getElement("dropZone");

    if (dropZone) {
        dropZone.addEventListener("dragover", event => {
            event.preventDefault();
            dropZone.classList.add("dragover");
        });

        dropZone.addEventListener("dragleave", () => {
            dropZone.classList.remove("dragover");
        });

        dropZone.addEventListener("drop", event => {
            event.preventDefault();
            dropZone.classList.remove("dragover");

            const file = event.dataTransfer?.files?.[0];
            const input = getElement("resume");

            if (!file || !input || !validateFile(file)) return;

            try {
                const transfer = new DataTransfer();
                transfer.items.add(file);
                input.files = transfer.files;
            } catch (error) {
                console.warn("Could not assign dropped file:", error);
            }

            handleFile(file);
        });
    }

    // Job description character count.
    getElement("jobDescription")?.addEventListener("input", event => {
        setText(
            "characterCount",
            `${event.target.value.length} characters`
        );
    });

    // Screening button.
    getElement("screenButton")?.addEventListener(
        "click",
        screenResume
    );

    // Search, filter, and sorting.
    getElement("candidateSearch")?.addEventListener(
        "input",
        applyCandidateFilters
    );

    getElement("recommendationFilter")?.addEventListener(
        "change",
        applyCandidateFilters
    );

    getElement("candidateSort")?.addEventListener(
        "change",
        applyCandidateFilters
    );

    // Refresh candidate history.
    getElement("refreshCandidatesButton")?.addEventListener(
        "click",
        async event => {
            const button = event.currentTarget;
            button.disabled = true;
            button.textContent = "↻ Loading...";

            try {
                await loadCandidates();
            } finally {
                button.disabled = false;
                button.textContent = "↻ Refresh";
            }
        }
    );

    // Close candidate details.
    getElement("closeCandidateModal")?.addEventListener(
        "click",
        closeCandidateDetails
    );

    getElement("candidateDetailModal")
        ?.querySelector("[data-close-modal]")
        ?.addEventListener("click", closeCandidateDetails);

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeCandidateDetails();
        }
    });

    // Click a candidate row to open its details.
    getElement("candidatesTableBody")?.addEventListener(
        "click",
        event => {
            const row = event.target.closest("tr[data-screening-id]");

            if (row) {
                openCandidateDetails(row.dataset.screeningId);
            }
        }
    );

    getElement("candidatesTableBody")?.addEventListener(
        "keydown",
        event => {
            const row = event.target.closest("tr[data-screening-id]");

            if (
                row &&
                (event.key === "Enter" || event.key === " ")
            ) {
                event.preventDefault();
                openCandidateDetails(row.dataset.screeningId);
            }
        }
    );

    // Initial candidate load.
    loadCandidates();
});