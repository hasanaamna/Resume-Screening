// ======================================================
// API CONFIGURATION
// ======================================================

const API_URL = "http://127.0.0.1:8000";


// ======================================================
// DOM ELEMENTS
// ======================================================

const resumeInput =
    document.getElementById("resume");

const dropZone =
    document.getElementById("dropZone");

const browseButton =
    document.getElementById("browseButton");

const uploadContent =
    document.getElementById("uploadContent");

const selectedFile =
    document.getElementById("selectedFile");

const fileName =
    document.getElementById("fileName");

const fileSize =
    document.getElementById("fileSize");

const fileIcon =
    document.getElementById("fileIcon");

const removeFile =
    document.getElementById("removeFile");

const jobDescription =
    document.getElementById("jobDescription");

const characterCount =
    document.getElementById("characterCount");


// ======================================================
// FILE UPLOAD
// ======================================================

if (browseButton) {

    browseButton.addEventListener(
        "click",
        () => {

            resumeInput.click();

        }
    );

}


if (resumeInput) {

    resumeInput.addEventListener(
        "change",
        () => {

            if (
                resumeInput.files.length > 0
            ) {

                handleFile(
                    resumeInput.files[0]
                );

            }

        }
    );

}


// ======================================================
// DRAG & DROP
// ======================================================

if (dropZone) {

    dropZone.addEventListener(
        "dragover",
        (event) => {

            event.preventDefault();

            dropZone.classList.add(
                "dragover"
            );

        }
    );


    dropZone.addEventListener(
        "dragleave",
        () => {

            dropZone.classList.remove(
                "dragover"
            );

        }
    );


    dropZone.addEventListener(
        "drop",
        (event) => {

            event.preventDefault();

            dropZone.classList.remove(
                "dragover"
            );


            const files =
                event.dataTransfer.files;


            if (!files.length) {
                return;
            }


            const file =
                files[0];


            if (
                !validateFile(file)
            ) {

                return;

            }


            try {

                const dataTransfer =
                    new DataTransfer();

                dataTransfer.items.add(
                    file
                );

                resumeInput.files =
                    dataTransfer.files;

            } catch (error) {

                console.warn(
                    "Could not assign dropped file:",
                    error
                );

            }


            handleFile(file);

        }
    );

}


// ======================================================
// FILE VALIDATION
// ======================================================

function validateFile(file) {

    if (!file) {
        return false;
    }


    const extension =
        file.name
            .split(".")
            .pop()
            .toLowerCase();


    if (
        !["pdf", "docx"].includes(
            extension
        )
    ) {

        showError(
            "Invalid file type. Please upload a PDF or DOCX resume."
        );

        return false;

    }


    if (
        file.size >
        10 * 1024 * 1024
    ) {

        showError(
            "File is too large. Maximum allowed size is 10 MB."
        );

        return false;

    }


    return true;

}


// ======================================================
// HANDLE FILE
// ======================================================

function handleFile(file) {

    if (
        !validateFile(file)
    ) {

        return;

    }


    if (fileName) {

        fileName.textContent =
            file.name;

    }


    if (fileSize) {

        fileSize.textContent =
            formatFileSize(
                file.size
            );

    }


    if (fileIcon) {

        const extension =
            file.name
                .split(".")
                .pop()
                .toUpperCase();


        fileIcon.textContent =
            extension;

    }


    if (uploadContent) {

        uploadContent.classList.add(
            "hidden"
        );

    }


    if (selectedFile) {

        selectedFile.classList.remove(
            "hidden"
        );

    }


    hideError();

}


// ======================================================
// REMOVE FILE
// ======================================================

if (removeFile) {

    removeFile.addEventListener(
        "click",
        () => {

            resumeInput.value = "";


            if (selectedFile) {

                selectedFile.classList.add(
                    "hidden"
                );

            }


            if (uploadContent) {

                uploadContent.classList.remove(
                    "hidden"
                );

            }

        }
    );

}


// ======================================================
// FORMAT FILE SIZE
// ======================================================

function formatFileSize(bytes) {

    if (bytes < 1024) {

        return `${bytes} B`;

    }


    if (
        bytes <
        1024 * 1024
    ) {

        return `${(
            bytes / 1024
        ).toFixed(1)} KB`;

    }


    return `${(
        bytes /
        (1024 * 1024)
    ).toFixed(1)} MB`;

}


// ======================================================
// CHARACTER COUNT
// ======================================================

if (jobDescription) {

    jobDescription.addEventListener(
        "input",
        () => {

            characterCount.textContent =
                `${jobDescription.value.length} characters`;

        }
    );

}


// ======================================================
// SCREEN RESUME
// ======================================================

async function screenResume() {

    const error =
        document.getElementById(
            "error"
        );

    const results =
        document.getElementById(
            "results"
        );

    const loading =
        document.getElementById(
            "loading"
        );

    const button =
        document.getElementById(
            "screenButton"
        );


    hideError();


    if (results) {

        results.classList.add(
            "hidden"
        );

    }


    // --------------------------------------------------
    // Validate resume
    // --------------------------------------------------

    if (
        !resumeInput ||
        !resumeInput.files.length
    ) {

        showError(
            "Please upload a candidate resume first."
        );

        return;

    }


    // --------------------------------------------------
    // Validate job description
    // --------------------------------------------------

    if (
        !jobDescription ||
        !jobDescription.value.trim()
    ) {

        showError(
            "Please enter a job description first."
        );

        return;

    }


    const resume =
        resumeInput.files[0];


    if (
        !validateFile(resume)
    ) {

        return;

    }


    const formData =
        new FormData();


    formData.append(
        "resume",
        resume
    );


    formData.append(
        "job_description",
        jobDescription.value.trim()
    );


    if (loading) {

        loading.classList.remove(
            "hidden"
        );

    }


    if (button) {

        button.disabled = true;

        button.innerHTML =
            `<span class="button-icon">◌</span> Analyzing...`;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/screen`,
                {
                    method: "POST",
                    body: formData
                }
            );


        let data;


        try {

            data =
                await response.json();

        } catch (jsonError) {

            throw new Error(
                "The server returned an invalid response."
            );

        }


        if (!response.ok) {

            throw new Error(
                data.detail ||
                `Resume screening failed. Server returned ${response.status}.`
            );

        }


        displayResults(data);


        // ------------------------------------------------
        // Refresh candidate database
        // ------------------------------------------------

        await loadCandidates();


    } catch (screeningError) {

        console.error(
            "Screening error:",
            screeningError
        );


        showError(
            screeningError.message ||
            "Unable to connect to the screening API."
        );

    } finally {

        if (loading) {

            loading.classList.add(
                "hidden"
            );

        }


        if (button) {

            button.disabled = false;

            button.innerHTML =
                `<span class="button-icon">✦</span> Analyze Resume`;

        }

    }

}


// ======================================================
// DISPLAY RESULTS
// ======================================================

function displayResults(data) {

    if (
        !data ||
        !data.screening
    ) {

        showError(
            "The API returned an incomplete screening result."
        );

        return;

    }


    const screening =
        data.screening;


    const score =
        Number(
            screening.overall_score
        ) || 0;


    // --------------------------------------------------
    // Overall score
    // --------------------------------------------------

    const overallScore =
        document.getElementById(
            "overallScore"
        );


    if (overallScore) {

        overallScore.textContent =
            `${score.toFixed(1)}%`;

    }


    updateScoreRing(
        score
    );


    // --------------------------------------------------
    // Recommendation
    // --------------------------------------------------

    const recommendation =
        document.getElementById(
            "recommendation"
        );


    const recommendationText =
        screening.recommendation ||
        "REVIEW";


    if (recommendation) {

        recommendation.textContent =
            recommendationText;


        recommendation.className =
            "recommendation";


        applyRecommendationStyle(
            recommendation,
            recommendationText
        );

    }


    // --------------------------------------------------
    // Candidate
    // --------------------------------------------------

    const candidate =
        data.candidate || {};


    const name =
        candidate.name ||
        "Candidate";


    setText(
        "candidateName",
        name
    );


    setText(
        "candidateEmail",
        candidate.email ||
        "Email not detected"
    );


    setText(
        "candidatePhone",
        candidate.phone ||
        "Phone not detected"
    );


    setText(
        "candidateAvatar",
        getInitials(name)
    );


    // --------------------------------------------------
    // Scores
    // --------------------------------------------------

    const scores =
        screening.scores || {};


    setScore(
        "skillsScore",
        scores.skills
    );


    setScore(
        "experienceScore",
        scores.experience
    );


    setScore(
        "educationScore",
        scores.education
    );


    setScore(
        "jobTitleScore",
        scores.job_title
    );


    setScore(
        "similarityScore",
        scores.text_similarity
    );


    // --------------------------------------------------
    // Score breakdown
    // --------------------------------------------------

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


    // --------------------------------------------------
    // Skills
    // --------------------------------------------------

    const matchedSkills =
        Array.isArray(
            screening.matched_skills
        )
            ? screening.matched_skills
            : [];


    const missingSkills =
        Array.isArray(
            screening.missing_skills
        )
            ? screening.missing_skills
            : [];


    populateSkills(
        "matchedSkills",
        matchedSkills,
        "matched"
    );


    populateSkills(
        "missingSkills",
        missingSkills,
        "missing"
    );


    setText(
        "matchedCount",
        matchedSkills.length
    );


    setText(
        "missingCount",
        missingSkills.length
    );


    // --------------------------------------------------
    // Resume profile
    // --------------------------------------------------

    const resume =
        data.resume || {};


    const years =
        resume.years_of_experience;


    setText(
        "experience",
        years !== null &&
        years !== undefined
            ? `${years} years`
            : "Not detected"
    );


    const education =
        Array.isArray(
            resume.education
        )
            ? resume.education
            : [];


    setText(
        "education",
        education.length
            ? education.join(", ")
            : "Not detected"
    );


    const jobTitles =
        Array.isArray(
            resume.job_titles
        )
            ? resume.job_titles
            : [];


    setText(
        "jobTitles",
        jobTitles.length
            ? jobTitles.join(", ")
            : "Not detected"
    );


    // --------------------------------------------------
    // Show results
    // --------------------------------------------------

    const results =
        document.getElementById(
            "results"
        );


    if (results) {

        results.classList.remove(
            "hidden"
        );


        setTimeout(
            () => {

                results.scrollIntoView(
                    {
                        behavior: "smooth",
                        block: "start"
                    }
                );

            },
            100
        );

    }

}


// ======================================================
// RECOMMENDATION STYLE
// ======================================================

function applyRecommendationStyle(
    element,
    recommendation
) {

    const value =
        String(
            recommendation
        ).toLowerCase();


    if (
        value.includes("strong")
    ) {

        element.style.background =
            "#ecfdf3";

        element.style.color =
            "#15803d";

        return;

    }


    if (
        value.includes("shortlist")
    ) {

        element.style.background =
            "#eff6ff";

        element.style.color =
            "#2563eb";

        return;

    }


    if (
        value.includes("review")
    ) {

        element.style.background =
            "#fff7ed";

        element.style.color =
            "#c2410c";

        return;

    }


    element.style.background =
        "#fef2f2";


    element.style.color =
        "#dc2626";

}


// ======================================================
// SCORE RING
// ======================================================

function updateScoreRing(score) {

    const ring =
        document.querySelector(
            ".score-ring"
        );


    if (!ring) {
        return;
    }


    const safeScore =
        Math.max(
            0,
            Math.min(
                100,
                Number(score) || 0
            )
        );


    const degrees =
        safeScore * 3.6;


    ring.style.background =
        `conic-gradient(
            #2563eb ${degrees}deg,
            #dbeafe ${degrees}deg
        )`;

}


// ======================================================
// SCORE HELPERS
// ======================================================

function setScore(
    elementId,
    value
) {

    const number =
        Number(value) || 0;


    const element =
        document.getElementById(
            elementId
        );


    if (!element) {
        return;
    }


    element.textContent =
        `${number.toFixed(1)}%`;

}


function updateProgress(
    progressId,
    labelId,
    value
) {

    const number =
        Math.max(
            0,
            Math.min(
                100,
                Number(value) || 0
            )
        );


    const progress =
        document.getElementById(
            progressId
        );


    const label =
        document.getElementById(
            labelId
        );


    if (progress) {

        progress.style.width =
            `${number}%`;

    }


    if (label) {

        label.textContent =
            `${number.toFixed(1)}%`;

    }

}


// ======================================================
// SKILLS
// ======================================================

function populateSkills(
    elementId,
    skills,
    type
) {

    const container =
        document.getElementById(
            elementId
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (
        !skills ||
        skills.length === 0
    ) {

        const empty =
            document.createElement(
                "span"
            );


        empty.className =
            `skill-chip ${type}`;


        empty.textContent =
            type === "matched"
                ? "No matched skills"
                : "No missing skills";


        container.appendChild(
            empty
        );


        return;

    }


    skills.forEach(
        skill => {

            const chip =
                document.createElement(
                    "span"
                );


            chip.className =
                `skill-chip ${type}`;


            chip.textContent =
                type === "matched"
                    ? `✓ ${skill}`
                    : `× ${skill}`;


            container.appendChild(
                chip
            );

        }
    );

}


// ======================================================
// GENERAL DOM HELPERS
// ======================================================

function setText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (element) {

        element.textContent =
            value;

    }

}


// ======================================================
// INITIALS
// ======================================================

function getInitials(name) {

    if (!name) {
        return "C";
    }


    const words =
        String(name)
            .trim()
            .split(/\s+/);


    if (
        words.length === 1
    ) {

        return words[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        words[0][0] +
        words[
            words.length - 1
        ][0]
    ).toUpperCase();

}


// ======================================================
// ERROR HANDLING
// ======================================================

function showError(message) {

    const error =
        document.getElementById(
            "error"
        );


    if (!error) {
        return;
    }


    error.textContent =
        message;


    error.classList.remove(
        "hidden"
    );


    error.scrollIntoView(
        {
            behavior: "smooth",
            block: "center"
        }
    );

}


function hideError() {

    const error =
        document.getElementById(
            "error"
        );


    if (error) {

        error.classList.add(
            "hidden"
        );

    }

}


// ======================================================
// RESET SCREENING
// ======================================================

function resetScreening() {

    const results =
        document.getElementById(
            "results"
        );


    const error =
        document.getElementById(
            "error"
        );


    if (results) {

        results.classList.add(
            "hidden"
        );

    }


    if (error) {

        error.classList.add(
            "hidden"
        );

    }


    if (resumeInput) {

        resumeInput.value = "";

    }


    if (selectedFile) {

        selectedFile.classList.add(
            "hidden"
        );

    }


    if (uploadContent) {

        uploadContent.classList.remove(
            "hidden"
        );

    }


    if (jobDescription) {

        jobDescription.value = "";

    }


    if (characterCount) {

        characterCount.textContent =
            "0 characters";

    }


    window.scrollTo(
        {
            top: 0,
            behavior: "smooth"
        }
    );

}


// ======================================================
// SIDEBAR NAVIGATION
// ======================================================

function setupNavigation() {

    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );


    navItems.forEach(
        item => {

            item.addEventListener(
                "click",
                function () {

                    navItems.forEach(
                        nav => {

                            nav.classList.remove(
                                "active"
                            );

                        }
                    );


                    this.classList.add(
                        "active"
                    );

                }
            );

        }
    );

}


// ======================================================
// CANDIDATES DATABASE
// ======================================================

let allCandidates = [];


// ======================================================
// LOAD CANDIDATES
// ======================================================

async function loadCandidates() {

    console.log(
        "Loading candidates..."
    );


    const tableBody =
        document.getElementById(
            "candidatesTableBody"
        );


    if (!tableBody) {

        console.error(
            "Candidates table not found."
        );

        return;

    }


    tableBody.innerHTML = `
        <tr>

            <td
                colspan="6"
                class="empty-table"
            >
                Loading candidates...
            </td>

        </tr>
    `;


    try {

        const response =
            await fetch(
                `${API_URL}/candidates`
            );


        console.log(
            "Candidates API status:",
            response.status
        );


        if (!response.ok) {

            throw new Error(
                `Candidates API returned ${response.status}`
            );

        }


        const data =
            await response.json();


        console.log(
            "Candidates API response:",
            data
        );


        allCandidates =
            Array.isArray(
                data.candidates
            )
                ? data.candidates
                : [];


        applyCandidateFilters();


    } catch (error) {

        console.error(
            "Candidate loading error:",
            error
        );


        tableBody.innerHTML = `
            <tr>

                <td
                    colspan="6"
                    class="empty-table"
                >

                    <strong>
                        Unable to load candidates
                    </strong>

                    <br>

                    <span
                        style="
                            display:block;
                            margin-top:6px;
                            color:#94a3b8;
                        "
                    >
                        Make sure the FastAPI backend
                        is running.
                    </span>

                </td>

            </tr>
        `;

    }

}


// ======================================================
// FILTER + SORT
// ======================================================

function applyCandidateFilters() {

    const searchInput =
        document.getElementById(
            "candidateSearch"
        );


    const filter =
        document.getElementById(
            "recommendationFilter"
        );


    const sort =
        document.getElementById(
            "candidateSort"
        );


    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const recommendation =
        filter
            ? filter.value
            : "all";


    const sortValue =
        sort
            ? sort.value
            : "score-desc";


    let filtered =
        [...allCandidates];


    // --------------------------------------------------
    // SEARCH
    // --------------------------------------------------

    if (search) {

        filtered =
            filtered.filter(
                candidate => {

                    const name =
                        String(
                            candidate.candidate_name ||
                            ""
                        ).toLowerCase();


                    const position =
                        String(
                            candidate.job_title ||
                            ""
                        ).toLowerCase();


                    const email =
                        String(
                            candidate.candidate_email ||
                            ""
                        ).toLowerCase();


                    return (
                        name.includes(search) ||
                        position.includes(search) ||
                        email.includes(search)
                    );

                }
            );

    }


    // --------------------------------------------------
    // RECOMMENDATION FILTER
    // --------------------------------------------------

    if (
        recommendation !== "all"
    ) {

        filtered =
            filtered.filter(
                candidate => {

                    const value =
                        String(
                            candidate.recommendation ||
                            ""
                        ).toLowerCase();


                    if (
                        recommendation ===
                        "strong"
                    ) {

                        return value.includes(
                            "strong"
                        );

                    }


                    if (
                        recommendation ===
                        "shortlist"
                    ) {

                        return (
                            value.includes(
                                "shortlist"
                            ) &&
                            !value.includes(
                                "strong"
                            )
                        );

                    }


                    if (
                        recommendation ===
                        "not recommended"
                    ) {

                        return (
                            value.includes(
                                "not recommended"
                            ) ||
                            value.includes(
                                "reject"
                            )
                        );

                    }


                    return value.includes(
                        recommendation
                    );

                }
            );

    }


    // --------------------------------------------------
    // SORT
    // --------------------------------------------------

    filtered.sort(
        (a, b) => {

            if (
                sortValue ===
                "score-desc"
            ) {

                return (
                    Number(
                        b.overall_score || 0
                    ) -
                    Number(
                        a.overall_score || 0
                    )
                );

            }


            if (
                sortValue ===
                "score-asc"
            ) {

                return (
                    Number(
                        a.overall_score || 0
                    ) -
                    Number(
                        b.overall_score || 0
                    )
                );

            }


            if (
                sortValue ===
                "newest"
            ) {

                return (
                    new Date(
                        b.created_at
                    ) -
                    new Date(
                        a.created_at
                    )
                );

            }


            if (
                sortValue ===
                "oldest"
            ) {

                return (
                    new Date(
                        a.created_at
                    ) -
                    new Date(
                        b.created_at
                    )
                );

            }


            if (
                sortValue ===
                "name"
            ) {

                return String(
                    a.candidate_name || ""
                ).localeCompare(
                    String(
                        b.candidate_name || ""
                    )
                );

            }


            return 0;

        }
    );


    renderCandidates(
        filtered
    );

}


// ======================================================
// RENDER CANDIDATES
// ======================================================

function renderCandidates(
    candidates
) {

    const tableBody =
        document.getElementById(
            "candidatesTableBody"
        );


    if (!tableBody) {
        return;
    }


    tableBody.innerHTML = "";


    if (
        !candidates ||
        candidates.length === 0
    ) {

        tableBody.innerHTML = `
            <tr>

                <td
                    colspan="6"
                    class="empty-table"
                >
                    No matching candidates found.
                </td>

            </tr>
        `;


        return;

    }


    candidates.forEach(
        candidate => {

            const row =
                document.createElement(
                    "tr"
                );


            const candidateName =
                candidate.candidate_name ||
                "Unknown Candidate";


            const initials =
                getInitials(
                    candidateName
                );


            const recommendation =
                candidate.recommendation ||
                "REVIEW";


            const recommendationClass =
                getRecommendationClass(
                    recommendation
                );


            const score =
                Number(
                    candidate.overall_score ||
                    0
                );


            const experience =
                candidate.years_of_experience;


            const formattedExperience =
                experience !== null &&
                experience !== undefined
                    ? `${experience} years`
                    : "—";


            const formattedDate =
                formatDate(
                    candidate.created_at
                );


            row.innerHTML = `

                <td>

                    <div
                        class="candidate-table-name"
                    >

                        <div class="table-avatar">

                            ${escapeHtml(
                                initials
                            )}

                        </div>


                        <div
                            class="table-candidate-info"
                        >

                            <strong>

                                ${escapeHtml(
                                    candidateName
                                )}

                            </strong>


                            <span>

                                ${escapeHtml(
                                    candidate.candidate_email ||
                                    "No email detected"
                                )}

                            </span>

                        </div>

                    </div>

                </td>


                <td>

                    ${escapeHtml(
                        candidate.job_title ||
                        "Not specified"
                    )}

                </td>


                <td>

                    ${escapeHtml(
                        formattedExperience
                    )}

                </td>


                <td>

                    <span
                        class="match-score"
                    >

                        ${score.toFixed(1)}%

                    </span>

                </td>


                <td>

                    <span
                        class="status-badge ${recommendationClass}"
                    >

                        ${escapeHtml(
                            recommendation
                        )}

                    </span>

                </td>


                <td>

                    ${escapeHtml(
                        formattedDate
                    )}

                </td>

            `;


            tableBody.appendChild(
                row
            );

        }
    );

}


// ======================================================
// RECOMMENDATION CLASS
// ======================================================

function getRecommendationClass(
    recommendation
) {

    const value =
        String(
            recommendation
        ).toLowerCase();


    if (
        value.includes("strong") ||
        value.includes("shortlist")
    ) {

        return "status-shortlist";

    }


    if (
        value.includes("review")
    ) {

        return "status-review";

    }


    return "status-rejected";

}


// ======================================================
// DATE FORMAT
// ======================================================

function formatDate(
    dateString
) {

    if (!dateString) {
        return "—";
    }


    const date =
        new Date(
            dateString
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(
            dateString
        );

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// ======================================================
// HTML SECURITY
// ======================================================

function escapeHtml(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(
            value ?? ""
        );


    return div.innerHTML;

}


// ======================================================
// INITIALIZE APPLICATION
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        // ------------------------------------------------
        // Sidebar
        // ------------------------------------------------

        setupNavigation();


        // ------------------------------------------------
        // Candidate search
        // ------------------------------------------------

        const search =
            document.getElementById(
                "candidateSearch"
            );


        if (search) {

            search.addEventListener(
                "input",
                applyCandidateFilters
            );

        }


        // ------------------------------------------------
        // Recommendation filter
        // ------------------------------------------------

        const filter =
            document.getElementById(
                "recommendationFilter"
            );


        if (filter) {

            filter.addEventListener(
                "change",
                applyCandidateFilters
            );

        }


        // ------------------------------------------------
        // Candidate sorting
        // ------------------------------------------------

        const sort =
            document.getElementById(
                "candidateSort"
            );


        if (sort) {

            sort.addEventListener(
                "change",
                applyCandidateFilters
            );

        }


        // ------------------------------------------------
        // Refresh candidates
        // ------------------------------------------------

        const refreshButton =
            document.getElementById(
                "refreshCandidatesButton"
            );


        if (refreshButton) {

            refreshButton.addEventListener(
                "click",
                async () => {

                    refreshButton.disabled =
                        true;


                    refreshButton.textContent =
                        "↻ Loading...";


                    try {

                        await loadCandidates();

                    } finally {

                        refreshButton.disabled =
                            false;


                        refreshButton.textContent =
                            "↻ Refresh";

                    }

                }
            );

        }


        // ------------------------------------------------
        // Load candidates on startup
        // ------------------------------------------------

        loadCandidates();

    }
);



const candidateModal = document.getElementById("candidateDetailModal");
const candidateDetailContent = document.getElementById("candidateDetailContent");
const candidateDetailTitle = document.getElementById("candidateDetailTitle");
const detailScreeningMeta = document.getElementById("detailScreeningMeta");

function escapeDetailHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function formatDetailDate(value) {
    if (!value) return "Not available";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short"
    });
}

function renderDetailSkills(skills, missing = false) {
    if (!Array.isArray(skills) || skills.length === 0) {
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
                const valid = Number.isFinite(value);
                const score = valid
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
    if (!candidateModal || !candidateDetailContent) return;

    candidateModal.classList.remove("hidden");
    candidateDetailTitle.textContent = "Candidate Details";
    detailScreeningMeta.textContent = `Screening record #${candidateId}`;
    candidateDetailContent.innerHTML =
        '<p class="detail-muted">Loading screening details...</p>';

    try {
        const response = await fetch(
            `${API_URL}/candidates/${encodeURIComponent(candidateId)}`
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.detail || "Could not load screening details.");
        }

        const name = data.name || "Unknown candidate";
        const recommendation = data.recommendation || "Not available";
        const score = Number(data.overall_score);
        const scoreText = Number.isFinite(score)
            ? `${score.toFixed(1)}%`
            : "Not available";

        candidateDetailTitle.textContent = name;
        detailScreeningMeta.textContent =
            `Screening #${data.id} · ${formatDetailDate(data.created_at)}`;

        candidateDetailContent.innerHTML = `
            <div class="detail-score-card">
                <div class="detail-score">${scoreText}</div>
                <div>Overall match score</div>
                <span class="detail-recommendation">
                    ${escapeDetailHtml(recommendation)}
                </span>
            </div>

            <div class="detail-grid">
                <div class="detail-field">
                    <span>Email</span>
                    <strong>${escapeDetailHtml(data.email || "Not available")}</strong>
                </div>
                <div class="detail-field">
                    <span>Phone</span>
                    <strong>${escapeDetailHtml(data.phone || "Not available")}</strong>
                </div>
                <div class="detail-field">
                    <span>Position</span>
                    <strong>${escapeDetailHtml(data.job_title || "Not specified")}</strong>
                </div>
                <div class="detail-field">
                    <span>Experience</span>
                    <strong>${data.years_of_experience == null
                        ? "Not available"
                        : `${escapeDetailHtml(data.years_of_experience)} years`}
                    </strong>
                </div>
                <div class="detail-field">
                    <span>Education</span>
                    <strong>${escapeDetailHtml(
                        Array.isArray(data.education)
                            ? data.education.join(", ") || "Not available"
                            : "Not available"
                    )}</strong>
                </div>
                <div class="detail-field">
                    <span>Previous roles</span>
                    <strong>${escapeDetailHtml(
                        Array.isArray(data.job_titles)
                            ? data.job_titles.join(", ") || "Not available"
                            : "Not available"
                    )}</strong>
                </div>
            </div>

            <section class="detail-section">
                <h3>Score breakdown</h3>
                ${renderScoreBreakdown(data.scores)}
            </section>

            <section class="detail-section">
                <h3>Matched skills (${Array.isArray(data.matched_skills)
                    ? data.matched_skills.length : 0})</h3>
                ${renderDetailSkills(data.matched_skills)}
            </section>

            <section class="detail-section">
                <h3>Missing skills (${Array.isArray(data.missing_skills)
                    ? data.missing_skills.length : 0})</h3>
                ${renderDetailSkills(data.missing_skills, true)}
            </section>

            <section class="detail-section">
                <h3>Skills extracted from resume</h3>
                ${renderDetailSkills(data.resume_skills)}
            </section>
        `;
    } catch (error) {
        candidateDetailContent.innerHTML = `
            <div class="detail-error">
                ${escapeDetailHtml(error.message || "Unable to load details.")}
            </div>
        `;
    }
}

function closeCandidateDetails() {
    candidateModal?.classList.add("hidden");
}

document.getElementById("closeCandidateModal")
    ?.addEventListener("click", closeCandidateDetails);

candidateModal?.querySelector("[data-close-modal]")
    ?.addEventListener("click", closeCandidateDetails);

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeCandidateDetails();
    }
});

// Event delegation lets dynamically rendered table rows open their record.
document.getElementById("candidatesTableBody")
    ?.addEventListener("click", event => {
        const row = event.target.closest("tr[data-screening-id]");
        if (row) {
            openCandidateDetails(row.dataset.screeningId);
        }
    });

document.getElementById("candidatesTableBody")
    ?.addEventListener("keydown", event => {
        const row = event.target.closest("tr[data-screening-id]");

        if (row && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            openCandidateDetails(row.dataset.screeningId);
        }
    });
