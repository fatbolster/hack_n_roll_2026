import os
import json
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_syllabus_json(file1_path, file2_path):
    # --- STEP 1: READ THE ACTUAL TEXT ---
    try:
        with open(file1_path, 'r') as f:
            text_2026 = f.read()
        with open(file2_path, 'r') as f:
            text_2025 = f.read()
    except FileNotFoundError:
        return {"error": f"Could not find {file1_path} or {file2_path} in the folder."}

    # --- STEP 2: MATH-SPECIFIC PROMPT ---
    prompt = f"""
    Act as a Senior O level Curriculum Developer. Audit the following math syllabi.
    
    TASK:
    1. Identify the given subject of the syllabus given (Math, Chemistry etc)
    2. Identify unique mathematical or chemistry concepts (e.g., Trigonometry, Differential Equations).
    3. Compare the technical scope and "Cognitive Demand" (complexity).
    4. Status logic:
       - 'unchanged': Math concepts and operations remain the same, even if wording changed.
       - 'modified': The topic exists in both, but specific formulas, theorems, or sub-topics were added/removed.
       - 'added': Entirely new mathematical domain in 2026.
       - 'removed': Topic present in 2025 but not in 2026.

    SYLLABUS 2026:
    {text_2026}
    
    SYLLABUS 2025:
    {text_2025}

    OUTPUT:
    Return a JSON object with a key "syllabi_diff" containing an array of objects:
    {{
      "topic": "Math concept name",
      "math_scope": "Technical summary of formulas/operations (e.g., Solving 2nd order ODEs)",
      "status": "added | removed | modified | unchanged",
      "change_summary": "Concise technical explanation of the mathematical shift"
    }}
    """

    response = client.chat.completions.create(
        model="gpt-5-mini", 
        messages=[
            {"role": "system", "content": "You are a math curriculum expert that outputs strictly valid JSON."},
            {"role": "user", "content": prompt}
        ],
        response_format={ "type": "json_object" } 
    )
    
    return response.choices[0].message.content

# --- EXECUTION ---
# Pass the file paths here
json_result = generate_syllabus_json("extractedSyllabus1.txt", "extractedSyllabus2.txt")

# Save to file
with open("syllabus_comparison.json", "w") as f:
    f.write(json_result)

print("✅ Success! Check syllabus_comparison.json")