from backend.app.services.job_description_parser import parse_job_description


FILE_PATH = "data/job_descriptions/legal_associate.txt"


with open(FILE_PATH, "r", encoding="utf-8") as file:
    job_description = file.read()


result = parse_job_description(job_description)


print("\n" + "=" * 60)
print("JOB DESCRIPTION ANALYSIS")
print("=" * 60)

print(f"\nJob Title:")
print(result["job_title"])

print("\nRequired Skills:")

for skill in result["required_skills"]:
    print(f"✓ {skill}")

print("\nEducation:")
print(result["education"])

print("\nMinimum Experience:")
print(result["minimum_experience"])

print("\n" + "=" * 60)