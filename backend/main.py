from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import json
from pathlib import Path
import fitz  # PyMuPDF
from io import BytesIO

from config.openai_client import call_openai_json
from services.syllabusJsonCreator import generate_syllabus_json


async def extract_text_from_pdf(file: UploadFile) -> str:
    """
    Extract text content from a PDF file using PyMuPDF.
    
    Args:
        file: UploadFile object from FastAPI
        
    Returns:
        str: Extracted text from all pages of the PDF
    """
    try:
        # Read file content
        content = await file.read()
        
        # Open PDF from bytes
        pdf_document = fitz.open(stream=content, filetype="pdf")
        
        # Extract text from all pages
        text = ""
        for page_num in range(pdf_document.page_count):
            page = pdf_document[page_num]
            text += page.get_text()
        
        pdf_document.close()
        
        return text.strip()
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting PDF text: {str(e)}")

app = FastAPI(title="Syllabus Alignment API", version="1.0.0")

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure directories exist
UPLOAD_DIR = Path("uploads")
OUTPUT_DIR = Path("outputs")
UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "ok", "message": "Syllabus Alignment API is running"}


@app.post("/api/upload-syllabus")
async def upload_syllabus(file: UploadFile = File(...)):
    """
    Upload a single syllabus PDF.
    Simple confirmation - actual processing happens in diff-syllabus.
    """
    try:
        # Validate file type
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
        return JSONResponse(content={
            "success": True,
            "filename": file.filename,
            "message": "Syllabus uploaded successfully"
        })
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/diff-syllabus")
async def diff_syllabus(
    old_syllabus: UploadFile = File(...),
    new_syllabus: UploadFile = File(...)
):
    """
    Compare two syllabus PDFs (old vs new) using OpenAI.
    Uses generate_syllabus_json from syllabusJsonCreator.py
    Returns JSON with topic_name, status, description fields.
    """
    try:
        # Validate file types
        if not (old_syllabus.filename.endswith('.pdf') and new_syllabus.filename.endswith('.pdf')):
            raise HTTPException(status_code=400, detail="Both files must be PDFs")
        
        # Extract text from PDFs (doc_old and doc_new)
        doc_old = await extract_text_from_pdf(old_syllabus)
        doc_new = await extract_text_from_pdf(new_syllabus)
        
        # Use generate_syllabus_json function from services
        json_result = generate_syllabus_json(
            doc_old=doc_old,
            doc_new=doc_new,
            old_filename=old_syllabus.filename,
            new_filename=new_syllabus.filename
        )
        
        # Debug: Print what we got back
        print(f"🔍 DEBUG - OpenAI returned: {json_result[:500]}...")
        
        # Parse the JSON string result
        diff_report = json.loads(json_result)
        print(f"🔍 DEBUG - Parsed report keys: {diff_report.keys()}")
        print(f"🔍 DEBUG - syllabi_diff content: {diff_report.get('syllabi_diff', 'NOT FOUND')}")
        
        return JSONResponse(content={
            "success": True,
            "old_file": old_syllabus.filename,
            "new_file": new_syllabus.filename,
            "report": diff_report
        })
    
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"ERROR in diff_syllabus: {error_details}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/upload-paper")
async def upload_paper(file: UploadFile = File(...)):
    """
    Upload a practice paper PDF and save it to the uploads directory.
    Returns confirmation with file path for later retrieval.
    """
    try:
        # Validate file type
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
        # Save file to uploads directory
        file_path = UPLOAD_DIR / file.filename
        content = await file.read()
        
        with open(file_path, "wb") as f:
            f.write(content)
        
        return JSONResponse(content={
            "success": True,
            "filename": file.filename,
            "file_path": str(file_path),
            "message": "Paper uploaded and saved successfully."
        })
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/analyze-paper")
async def analyze_paper(
    paper: UploadFile = File(...),
    syllabus: UploadFile = File(...)
):
    """
    Analyze a practice paper against a syllabus using OpenAI.
    Returns JSON with question_topic_mapping format.
    """
    try:
        print(f"\n📄 ANALYZE PAPER REQUEST")
        print(f"Paper: {paper.filename}")
        print(f"Syllabus: {syllabus.filename}")
        
        # Validate file types
        if not (paper.filename.endswith('.pdf') and syllabus.filename.endswith('.pdf')):
            raise HTTPException(status_code=400, detail="Both files must be PDFs")
        
        # Save PDFs to uploads folder
        print("💾 Saving PDFs to uploads folder...")
        uploads_dir = Path("uploads")
        uploads_dir.mkdir(exist_ok=True)
        
        paper_path = uploads_dir / f"paper_{paper.filename}"
        syllabus_path = uploads_dir / f"syllabus_{syllabus.filename}"
        
        with open(paper_path, "wb") as f:
            f.write(await paper.read())
        
        with open(syllabus_path, "wb") as f:
            f.write(await syllabus.read())
        
        print(f"✅ PDFs saved: {paper_path}, {syllabus_path}")
        
        # Extract questions from paper PDF using textExtractorQuestion
        print("📤 Extracting questions from paper PDF...")
        questions_data = extract_questions_from_pdf(str(paper_path))
        print(f"✅ Extracted {len(questions_data['questions'])} questions")
        
        # Extract syllabus text
        print("📤 Extracting text from syllabus PDF...")
        syllabus_doc = fitz.open(str(syllabus_path))
        syllabus_text = ""
        for page in syllabus_doc:
            syllabus_text += page.get_text()
        syllabus_doc.close()
        
        print(f"✅ Syllabus extracted: {len(syllabus_text)} chars")
        
        # Save syllabus text
        syllabus_txt_path = uploads_dir / "syllabus_temp.txt"
        with open(syllabus_txt_path, "w", encoding="utf-8") as f:
            f.write(syllabus_text)
        
        # Save questions JSON
        questions_json_path = uploads_dir / "questions_temp.json"
        with open(questions_json_path, "w", encoding="utf-8") as f:
            json.dump(questions_data, f)
        
        # Call map_questions_to_syllabus directly
        print("🤖 Calling map_questions_to_syllabus...")
        result = map_questions_to_syllabus(
            syllabus_path=str(syllabus_txt_path),
            questions_path=str(questions_json_path),
            chunk_size=5
        )
        
        # Return raw format from map_questions_to_syllabus
        alignment_report = result
        
        print(f"✅ Analysis complete")
        print(f"📊 Response type: {type(alignment_report)}")
        print(f"📋 Full JSON response:\n{json.dumps(alignment_report, indent=2)}\n")
        
        if isinstance(alignment_report, dict):
            print(f"🔑 Response keys: {list(alignment_report.keys())}")
            if 'question_topic_mapping' in alignment_report:
                print(f"📝 Found {len(alignment_report['question_topic_mapping'])} questions")
        
        return JSONResponse(content={
            "success": True,
            "paper_file": paper.filename,
            "syllabus_file": syllabus.filename,
            "report": alignment_report
        })
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
