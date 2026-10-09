
from functools import lru_cache

from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity


MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"


@lru_cache(maxsize=1)
def load_embedding_model():
    """Load the model once and reuse it."""
    return SentenceTransformer(MODEL_NAME)


def calculate_text_similarity(
    resume_text: str,
    job_description: str,
) -> float:
    """
    Calculate semantic similarity between a resume
    and a job description.

    Returns a score between 0 and 100.
    """
    if not resume_text or not resume_text.strip():
        return 0.0

    if not job_description or not job_description.strip():
        return 0.0

    model = load_embedding_model()

    embeddings = model.encode(
        [resume_text, job_description],
        convert_to_numpy=True,
        normalize_embeddings=True,
    )

    similarity = cosine_similarity(
        embeddings[0].reshape(1, -1),
        embeddings[1].reshape(1, -1),
    )[0][0]

    # Cosine similarity can theoretically be negative.
    # Clamp to the display range used by this application.
    similarity = max(0.0, min(1.0, float(similarity)))

    return round(similarity * 100, 2)
