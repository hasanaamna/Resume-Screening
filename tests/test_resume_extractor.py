from backend.app.services.resume_parser import extract_resume_text
from backend.app.services.text_preprocessor import clean_text
from backend.app.services.resume_extractor import extract_resume_information


FILE_PATH = "data/resumes/Adv Sana Resume U.pdf"


# Extract resume
raw_text = extract_resume_text(FILE_PATH)

# Clean resume
cleaned_text = clean_text(raw_text)

# Extract information
information = extract_resume_information(cleaned_text)


print("\n" + "=" * 60)
print("STRUCTURED RESUME INFORMATION")
print("=" * 60)

for key, value in information.items():

    print(f"\n{key}: {value}")

print("\n" + "=" * 60)