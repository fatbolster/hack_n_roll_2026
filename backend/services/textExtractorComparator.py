import pymupdf
import os 


doc_new = pymupdf.open(r"/Users/minren/Downloads/2026 Math.pdf") # new syllabus
doc_old = pymupdf.open(r"/Users/minren/Downloads/2025 Math.pdf") # old syllabus

with open("extractedSyllabus1.txt", "w", encoding="utf-8") as f:
    for page in doc_new:
        text = page.get_text()
        f.write(text)

with open("extractedSyllabus2.txt", "w", encoding="utf-8") as f:
    for page in doc_old:
        text = page.get_text()
        f.write(text)

print("Extraction complete!")
    