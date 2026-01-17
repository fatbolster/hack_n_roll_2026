import pymupdf
import os
from pathlib import Path

# Set your folder path here
pdf_folder = r"/Users/minren/hack_n_roll_2026/backend/data/math"  # Change this to your folder path
output_folder = "grounding"  # Where to save txt files

# Create output folder if it doesn't exist
os.makedirs(output_folder, exist_ok=True)

# Get all PDF files in the folder
pdf_files = [f for f in os.listdir(pdf_folder) if f.lower().endswith('.pdf')]

if not pdf_files:
    print(f"❌ No PDF files found in {pdf_folder}")
else:
    print(f"Found {len(pdf_files)} PDF files. Converting...\n")
    
    for pdf_file in pdf_files:
        pdf_path = os.path.join(pdf_folder, pdf_file)
        txt_filename = pdf_file.replace('.pdf', '.txt').replace('.PDF', '.txt')
        txt_path = os.path.join(output_folder, txt_filename)
        
        try:
            print(f"📄 Converting: {pdf_file}...", end=" ", flush=True)
            
            doc = pymupdf.open(pdf_path)
            
            with open(txt_path, "w", encoding="utf-8") as f:
                for page in doc:
                    text = page.get_text()
                    f.write(text)
            
            doc.close()
            print("✅")
            
        except Exception as e:
            print(f"❌ Error: {e}")

print(f"\n✅ Extraction complete! Files saved to '{output_folder}' folder")