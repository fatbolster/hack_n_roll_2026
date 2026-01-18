import pymupdf
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

def extract_questions_from_pdf(pdf_path: str, output_path: str) -> None:
    break_all_parsing = False



    #Ensure question number is accurate 
    expected_question_num = 1
    last_question_page = None


    doc = pymupdf.open(pdf_path)

    questions = []
    current_q = None
    current_subpart = None   


    # Iterates though the pages, skipping through the first 2 pages and then identify the questions number 
    # which is a bolded integer. It also cuts off bottom portion of the page so that page number is ignored, filter out cover pages, filter
    # out keywords and also check if the q number is less than 50 and then subparts
    # are also extracted and formatted also theres a tracker to ensure page number at the top is not considered a questions

    for page_num, page in enumerate(doc, start=1):
        if break_all_parsing:
            break

        if page_num <= 2:
            continue

        blocks = page.get_text("dict")["blocks"]
        page_height = page.rect.height

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
                    text    = span["text"].strip()
                    font = span["font"]
                    y0 = span["bbox"][1]

                    # Ignore footer
                    if y0 > page_height * 0.88:
                        continue



                

                    # Detect bold question number
                    if (re.fullmatch(r"\d+", text) and "Bold" in font and 1 <= int(text) <= 50):
                        num = int(text)

                        # Normal progression
                        if num == expected_question_num:
                            detected_q_num = num
                            expected_question_num += 1
                            last_question_page = page_num

                        # Reset case: new paper starts at Q1
                        elif num == 1 and last_question_page is not None and page_num > last_question_page:
                            detected_q_num = 1
                            expected_question_num = 2
                            last_question_page = page_num

                        continue

                line_text += text + " "


                if detected_q_num is not None:
                    saw_question_number = True
                    q_num = detected_q_num

                    
                
                line_text = line_text.strip()
                if not line_text:
                    continue

            
                if any(k.lower() in line_text.lower() for k in SKIP_PAGE_KEYWORDS):
                    continue

                if any(k.lower() in line_text.lower() for k in STOP_PAGE_KEYWORDS):
                    break_all_parsing = True
                    break
                    


                if saw_question_number:
                    if current_q:
                        questions.append(current_q)

                    # q_num = re.search(r"\b\d+\b", line_text).group()
                    current_q = {
                        "id": f"Q{q_num}",
                        "text": "",
                        "page": page_num,
                        "subparts": []
                    }

                    current_subpart = None  # reset subpart context

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

    paper_json = {
        "paper_id": "samplePaper.pdf",
        "questions": questions
    }

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(paper_json, f, indent=2)

    print(f"Extracted {len(questions)} question(s) ✅")
    print(f"Saved to {output_path}")


def main():
    """Main function for script execution."""
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    pdf_path = os.path.join(BASE_DIR, "samplePaper2.pdf")
    output_path = os.path.join(BASE_DIR, "questions3.json")
    
    extract_questions_from_pdf(pdf_path, output_path)


if __name__ == "__main__":
    main()
