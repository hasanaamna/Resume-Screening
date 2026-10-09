import re


def clean_text(text: str) -> str:
    """
    Clean and normalize extracted resume text.
    """

    # Normalize line breaks
    text = text.replace("\r", "\n")

    # Remove excessive spaces
    text = re.sub(r"[ \t]+", " ", text)

    # Remove excessive blank lines
    text = re.sub(r"\n+", "\n", text)

    # Remove unwanted characters while preserving useful symbols
    text = re.sub(r"[^\w\s@.+#/&()\-]", " ", text)

    # Normalize spaces again
    text = re.sub(r"[ \t]+", " ", text)

    return text.strip()