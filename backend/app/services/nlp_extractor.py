import re
import spacy


nlp = spacy.load("en_core_web_sm")


def extract_entities(text: str) -> dict:
    """
    Extract basic entities from resume text using spaCy.
    """

    doc = nlp(text)

    people = []
    organizations = []
    locations = []
    dates = []

    for entity in doc.ents:

        if entity.label_ == "PERSON":
            people.append(entity.text)

        elif entity.label_ == "ORG":
            organizations.append(entity.text)

        elif entity.label_ in ["GPE", "LOC"]:
            locations.append(entity.text)

        elif entity.label_ == "DATE":
            dates.append(entity.text)

    return {
        "people": list(set(people)),
        "organizations": list(set(organizations)),
        "locations": list(set(locations)),
        "dates": list(set(dates)),
    }