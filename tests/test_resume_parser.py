from backend.app.services.resume_parser import extract_resume_text


file_path = "data/resumes/Adv Sana Resume U.pdf"

text = extract_resume_text(file_path)

print("\n" + "=" * 60)
print("EXTRACTED RESUME TEXT")
print("=" * 60)

print(text)

print("\n" + "=" * 60)
print(f"Characters extracted: {len(text)}")
print("=" * 60)