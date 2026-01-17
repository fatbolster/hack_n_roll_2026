import pymupdf
import os 


doc = pymupdf.open(r"syllabus.pdf") # new syllabus

with open("extractedSyllabus.txt", "w", encoding="utf-8") as f:
    for page in doc:
        text = page.get_text()
        f.write(text)

print("Extraction complete!")