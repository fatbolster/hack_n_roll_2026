import fitz  # PyMuPDF
import json
import os
import re

SKIP_PAGE_KEYWORDS = [
    "Paper 2",
    "READ THESE INSTRUCTIONS FIRST",
    "Mathematical Formulae",
    "This document consists",
    "BLANK PAGE"
]


STOP_PAGE_KEYWORDS = [
    "Marking Scheme",
    "Qn Steps/Answer",
    "Steps/Answer",
    "Remarks",
    "Answer Scheme",
    "Suggested Answers",
]

break_all_parsing = False


BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def extract_questions_from_pdf(pdf_path: str) -> dict:
    """
    Extract questions from a PDF file with proper formatting and structure.
    
    Args:
        pdf_path: Path to the PDF file
        
    Returns:
        dict with paper_id and questions array
    """
    print(f"\n{'='*80}")
    print(f"🔍 EXTRACTING QUESTIONS FROM: {pdf_path}")
    print(f"{'='*80}")
    
    global break_all_parsing
    break_all_parsing = False
    
    expected_question_num = None  # Will be set to first question number found
    last_question_page = None
    
    doc = fitz.open(pdf_path)
    print(f"📄 PDF opened: {len(doc)} pages")
    
    questions = []
    current_q = None
    current_subpart = None   
    
    # Iterates through the pages, skipping through the first 2 pages and then identify the questions number 
    # which is a bolded integer. It also cuts off bottom portion of the page so that page number is ignored, filter out cover pages, filter
    # out keywords and also check if the q number is less than 50 and then subparts
    # are also extracted and formatted also there's a tracker to ensure page number at the top is not considered a questions
    
    for page_num, page in enumerate(doc, start=1):
        if break_all_parsing:
            break
    
        if page_num <= 2:
            print(f"⏭️  Skipping page {page_num} (cover pages)")
            continue
    
        print(f"\n📄 Processing page {page_num}...")
        blocks = page.get_text("dict")["blocks"]
        page_height = page.rect.height
        print(f"   Found {len(blocks)} blocks on page {page_num}")
    
        # This helps to extract stuff like font also
        for block in blocks:
            if break_all_parsing:
                break
             
            if block["type"] != 0:
                continue
    
            for line in block["lines"]:
                line_text = ""
                saw_question_number = False
                detected_q_num = None
    
    
                for span in line["spans"]:
                    text = span["text"].strip()
                    font = span["font"]
                    y0 = span["bbox"][1]
    
                    # Ignore header (top 12% - where page numbers appear)
                    if y0 < page_height * 0.12:
                        continue
                    
                    # Ignore footer
                    if y0 > page_height * 0.88:
                        continue
    
                    # Check if this is a number
                    if re.fullmatch(r"\d+", text):
                        num = int(text)
                        is_bold = "Bold" in font or "bold" in font.lower()
                        print(f"      Number found: {num}, font: {font}, is_bold: {is_bold}, range: 1-50: {1 <= num <= 50}, y_pos: {y0:.1f}/{page_height:.1f}")
                        
                        # Detect bold question number
                        if is_bold and 1 <= num <= 50:
                            print(f"   🔢 Found bold number: {num} (font: {font}, expected: {expected_question_num})")
        
                            # First question found - initialize expected_question_num
                            if expected_question_num is None:
                                detected_q_num = num
                                expected_question_num = num + 1
                                last_question_page = page_num
                                print(f"   ✅ First question number detected: {num}, next expected: {expected_question_num}")
                            # Normal progression
                            elif num == expected_question_num:
                                detected_q_num = num
                                expected_question_num += 1
                                last_question_page = page_num
                                print(f"   ✅ Sequential question: Q{num}, next expected: {expected_question_num}")
                            # Reset case: new paper starts at Q1
                            elif num == 1 and last_question_page is not None and page_num > last_question_page:
                                detected_q_num = 1
                                expected_question_num = 2
                                last_question_page = page_num
                                print(f"   🔄 Reset to Q1 detected")
                            else:
                                print(f"   ⚠️  Skipped non-sequential number: {num} (expected {expected_question_num})")
        
                            continue
    
                    line_text += text + " "
    
    
                if detected_q_num is not None:
                    saw_question_number = True
                    q_num = detected_q_num
                    print(f"      ✓ Line has question number Q{q_num}, line_text before strip: '{line_text}'")
    
                    
                
                line_text = line_text.strip()
                
                # Don't skip if we found a question number, even if line is empty
                # The question number might be on its own line
                if not line_text and not saw_question_number:
                    print(f"      ⚠️  Line text is empty and no question number, skipping")
                    continue
    
            
                if any(k.lower() in line_text.lower() for k in SKIP_PAGE_KEYWORDS):
                    continue
    
                if any(k.lower() in line_text.lower() for k in STOP_PAGE_KEYWORDS):
                    break_all_parsing = True
                    break
                    
    
    
                if saw_question_number:
                    if current_q:
                        questions.append(current_q)
                        print(f"   ✅ Saved Q{current_q['id']}")
    
                    current_q = {
                        "id": f"Q{q_num}",
                        "text": "",
                        "page": page_num,
                        "subparts": []
                    }
    
                    current_subpart = None  # reset subpart context
                    print(f"   📝 Created new question: Q{q_num}")
    
                    # Remove leading question number from text
                    line_text = re.sub(r"^\s*\d+\s*", "", line_text).strip()
                    if not line_text:
                        continue
    
                # Subpart detection removed (i) cause too confusing 
                line_text = re.sub(r"^\((i|ii|iii|iv|v)\)\s*", "", line_text)
                subpart_match = re.match(r"^\(([a-z])\)\s*(.*)", line_text)
                if subpart_match and current_q:
                    label = subpart_match.group(1)
                    sub_text = subpart_match.group(2).strip()
    
                    current_subpart = {
                        "id": f"{current_q['id']}{label}",
                        "label": label,
                        "text": sub_text
                    }
    
                    current_q["subparts"].append(current_subpart)
                    continue  # don't add subpart line to main text
    
                # Append continuation lines
                if current_subpart:
                    current_subpart["text"] += " " + line_text
                elif current_q:
                    current_q["text"] += line_text + " "
    
    
    # Save last question
    if current_q:
        questions.append(current_q)
        print(f"   ✅ Saved final question Q{current_q['id']}")
    
    print(f"\n{'='*80}")
    print(f"✅ EXTRACTION COMPLETE: {len(questions)} questions found")
    print(f"{'='*80}\n")
    
    paper_json = {
        "paper_id": os.path.basename(pdf_path),
        "questions": questions
    }
    
    return paper_json


# ---- RUN ----
if __name__ == "__main__":
    pdf_path = os.path.join(BASE_DIR, "samplePaper2.pdf")
    output_path = os.path.join(BASE_DIR, "questions.json")
    
    result = extract_questions_from_pdf(pdf_path)
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)
    
    print(f"Extracted {len(result['questions'])} question(s) ✅")
    print(f"Saved to {output_path}")
