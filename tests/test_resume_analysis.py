from backend.app.services.resume_parser import extract_resume_text
from backend.app.services.text_preprocessor import clean_text
from backend.app.services.nlp_extractor import extract_entities
from backend.app.services.skill_extractor import extract_skills


FILE_PATH = "data/resumes/Adv Sana Resume U.pdf"


# 1. Extract
raw_text = extract_resume_text(FILE_PATH)

# 2. Clean
cleaned_text = clean_text(raw_text)

# 3. NLP entities
entities = extract_entities(cleaned_text)

# 4. Skills
skills = extract_skills(cleaned_text)


print("\n" + "=" * 60)
print("RESUME ANALYSIS")
print("=" * 60)

print("\n--- ENTITIES ---")

for key, value in entities.items():
    print(f"{key}: {value}")


print("\n--- SKILLS ---")

for skill in skills:
    print(f"✓ {skill}")


print("\n--- SUMMARY ---")
print(f"Characters: {len(cleaned_text)}")
print(f"Skills found: {len(skills)}")

print("=" * 60)