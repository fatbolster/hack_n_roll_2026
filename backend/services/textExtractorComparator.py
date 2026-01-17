import pymupdf
import os 


doc_new = pymupdf.open(r"/Users/minren/Downloads/2026 Chemistry.pdf") # new syllabus
<<<<<<< HEAD
doc_old = pymupdf.open(r"/Users/minren/Downloads/2025 Chemistry.pdf") # old syllabus
=======
doc_old = pymupdf.open(r"/Users/minren/Downloads/2025 Math.pdf") # old syllabus
>>>>>>> 7f8550abe7418b32f77e00c0866523e641d130a0

with open("extractedSyllabus1.txt", "w", encoding="utf-8") as f:
    for page in doc_new:
        text = page.get_text()
        f.write(text)

with open("extractedSyllabus2.txt", "w", encoding="utf-8") as f:
    for page in doc_old:
        text = page.get_text()
        f.write(text)

print("Extraction complete!")
    