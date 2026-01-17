import fitz  # PyMuPDF
import os
from syllabusJsonCreator import generate_syllabus_json


def extract_text_from_pdf_file(file_path: str) -> str:
    """Extract text from a PDF file path."""
    try:
        doc = fitz.open(file_path)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        return text.strip()
    except Exception as e:
        print(f"❌ Error extracting PDF: {e}")
        return ""


# Update these paths for your local testing
new_syllabus_path = r"/Users/minren/Downloads/2026 Chemistry.pdf"  # new syllabus
old_syllabus_path = r"/Users/minren/Downloads/2025 Chemistry.pdf"  # old syllabus

# Extract text from both PDFs into doc_new and doc_old
doc_new = extract_text_from_pdf_file(new_syllabus_path)
doc_old = extract_text_from_pdf_file(old_syllabus_path)

print(f"📄 doc_new length: {len(doc_new)} characters")
print(f"📄 doc_old length: {len(doc_old)} characters")

# Generate comparison JSON
json_result = generate_syllabus_json(
    doc_old=doc_old,
    doc_new=doc_new,
    old_filename="2025 Chemistry.pdf",
    new_filename="2026 Chemistry.pdf"
)

# Save to file
with open("syllabus_comparison.json", "w", encoding="utf-8") as f:
    f.write(json_result)

print("✅ Extraction and comparison complete!")
print("📊 Check syllabus_comparison.json for results")