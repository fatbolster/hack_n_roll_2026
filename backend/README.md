# Syllabus Alignment Backend

FastAPI backend for syllabus comparison and practice paper alignment checking.

**Your role (Member 3 - Backend Infrastructure):** You are the plumber. You connect the pipes. You do NOT implement AI logic or file handling utilities.

## Project Structure

```
backend/
├── main.py                 # FastAPI app with endpoints (YOUR JOB)
├── requirements.txt        # Python dependencies
├── .env.example           # Environment variables template
├── models/                # Pydantic schemas (YOUR JOB)
│   └── schemas.py
├── services/              # Business logic (NOT YOUR JOB)
│   ├── syllabus_diff.py   # Member 1 implements this
│   └── paper_analysis.py  # Member 2 implements this
├── uploads/               # Uploaded PDFs (Members 1 & 2 handle)
└── outputs/               # Generated reports (Members 1 & 2 handle)
```

## What You Do (Member 3)

✅ Set up FastAPI app with 4 endpoints
✅ Accept file uploads
✅ Call Member 1 & 2's functions
✅ Return JSON responses
✅ Handle errors

## What You Do NOT Do

❌ PDF extraction (Member 1 & 2's job)
❌ File saving utilities (Member 1 & 2's job)
❌ OpenAI calls (Member 1 & 2's job)
❌ Business logic (Member 1 & 2's job)

## Setup

### 1. Install Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
# Member 1 & 2 will add their OpenAI keys
```

### 3. Run the Server

```bash
python main.py
# Or use uvicorn directly:
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Server will start at: http://localhost:8000

API docs available at: http://localhost:8000/docs

## API Endpoints

### 1. Upload Syllabus

**POST** `/api/upload-syllabus`

- Accepts: PDF file
- Calls: Member 1's `extract_syllabus()`
- Returns: Structured syllabus JSON

### 2. Compare Syllabi

**POST** `/api/diff-syllabus`

- Accepts: 2 PDF files (old, new)
- Calls: Member 1's `compare_syllabi()`
- Returns: Change report JSON

### 3. Upload Paper

**POST** `/api/upload-paper`

- Accepts: PDF file
- Returns: Upload confirmation

### 4. Analyze Paper

**POST** `/api/analyze-paper`

- Accepts: 2 PDF files (paper, syllabus)
- Calls: Member 2's `analyze_paper_alignment()`
- Returns: Alignment report JSON

## For Team Members

### Member 1 (Syllabus Diff AI Logic)

You implement in: `services/syllabus_diff.py`

**Your responsibilities:**

- Save uploaded files to `uploads/`
- Extract PDF text using PyMuPDF
- Structure syllabus into JSON with OpenAI
- Compare old vs new syllabi
- Generate change reports with explanations
- Save reports to `outputs/`

**Functions to implement:**

- `extract_syllabus(file: UploadFile) -> Dict`
- `compare_syllabi(old_file: UploadFile, new_file: UploadFile) -> Dict`

### Member 2 (Paper Analysis AI Logic)

You implement in: `services/paper_analysis.py`

**Your responsibilities:**

- Save uploaded files to `uploads/`
- Extract PDF text using PyMuPDF
- Split paper into individual questions
- Map each question to syllabus topics with OpenAI
- Calculate topic coverage statistics
- Flag out-of-syllabus questions
- Save reports to `outputs/`

**Functions to implement:**

- `analyze_paper_alignment(paper: UploadFile, syllabus: UploadFile) -> Dict`

### Member 3 (You - Backend Infrastructure)

You implemented in: `main.py`

**Your responsibilities:**
✅ FastAPI setup - DONE
✅ Endpoint routing - DONE
✅ File upload handling - DONE
✅ CORS for frontend - DONE
✅ Error handling - DONE

**You are done! Just connect the pipes.**

## Testing

```bash
# Test health check
curl http://localhost:8000/

# Test file upload (once Member 1 implements)
curl -X POST http://localhost:8000/api/upload-syllabus \
  -F "file=@path/to/syllabus.pdf"
```

## Dependencies

- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `python-multipart` - File upload support
- `PyMuPDF` - PDF text extraction (for Member 1 & 2)
- `openai` - AI logic (for Member 1 & 2)
- `aiofiles` - Async file operations (for Member 1 & 2)
- `pydantic` - Data validation

## Next Steps

1. **Member 1**: Implement syllabus logic in `services/syllabus_diff.py`
2. **Member 2**: Implement paper analysis in `services/paper_analysis.py`
3. **Frontend**: Connect to these 4 endpoints
4. **All**: Test end-to-end with real PDFs
