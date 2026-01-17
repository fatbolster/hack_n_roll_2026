import os
import json
from dotenv import load_dotenv
from openai import OpenAI
import re
import random
from pathlib import Path

# --- SETUP ---
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))    

# --- DYNAMIC PATH CONFIGURATION ---
DATA_ROOT = Path(__file__).resolve().parent.parent / "data"

def load_topics_from_txt(syllabus_path):
    if not os.path.exists(syllabus_path):
        raise FileNotFoundError(f"Missing syllabus file at: {syllabus_path}")
    
    with open(syllabus_path, "r") as f:
        lines = f.readlines()

    topics = []
    # Matches numbers like 1.1, 5.2, 10.1 and captures the title separately
    topic_pattern = re.compile(r'^(\d+\.\d+)\s+(.*)')

    for line in lines:
        match = topic_pattern.match(line.strip())
        if match:
            topics.append({
                "id": match.group(1),
                "title": match.group(2).strip(), # This is the "Name" (e.g., 'Acids')
                "full_text": line.strip()
            })
    
    if not topics:
        topics = [{"id": "General", "title": line.strip()[:50], "full_text": line.strip()} 
                  for line in lines if len(line.strip()) > 20]
    return topics

def get_grounding_for_topic(grounding_dir, topic_name):
    if not os.path.exists(grounding_dir):
        return "Standard O-Level phrasing."
    
    for filename in os.listdir(grounding_dir):
        category = filename.replace(".txt", "").lower()
        if category in topic_name.lower():
            with open(os.path.join(grounding_dir, filename), 'r') as f:
                return f.read()
    return "Standard O-Level phrasing."

def generate_question_set(subject_name, num_questions=3):
    subject_dir = os.path.join(DATA_ROOT, subject_name.lower())
    syllabus_path = os.path.join(subject_dir, "extractedSyllabus1.txt")
    grounding_dir = os.path.join(subject_dir, "grounding")
    output_path = os.path.join(subject_dir, "generated_questions.json")

    all_topics = load_topics_from_txt(syllabus_path)
    
    if not all_topics:
        print(f"No topics found for {subject_name}.")
        return []

    selected = random.sample(all_topics, min(num_questions, len(all_topics)))
    question_set = []

    for item in selected:
        grounding = get_grounding_for_topic(grounding_dir, item['title'])
        
        # PROMPT: Now uses title in the ID field for the JSON output
        prompt = f"""
        Act as a strict O-Level {subject_name.upper()} Examiner. Your task is to create ONE exam question.
        
        CORE SOURCE (SYLLABUS): {item['full_text']}
        STYLE REFERENCE (PAST PAPERS): {grounding}
        
        STRICT RULES:
        1. SYLLABUS ONLY: The question must be 100% derived from the CORE SOURCE provided above. Must be technical. 
        2. NO OUTSIDE KNOWLEDGE: Do not include concepts from the STYLE REFERENCE if not in the CORE SOURCE.
        3. STYLE ONLY: Use STYLE REFERENCE for phrasing/difficulty only.
        4. COMMAND WORDS: Use standard O-Level words ('Describe', 'Calculate', etc.).

        OUTPUT JSON:
        {{
          "topic_name": "{item['title']}",
          "question": "The question text.",
          "marks": 5,
          "answer_key": "The marking scheme."
        }}
        """

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": f"You are a specialized {subject_name} examiner."},
                {"role": "user", "content": prompt}
            ],
            response_format={ "type": "json_object" }
        )
        
        question_data = json.loads(response.choices[0].message.content)
        question_set.append(question_data)
        
        # PRINT THE NAME INSTEAD OF THE ID
        print(f"✅ Generated {subject_name} question for: {item['title']}")

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(question_set, f, indent=4)
    
    return output_path

if __name__ == "__main__":
    chosen_subject = input("Enter subject folder name: ").strip().lower()
    
    try:
        final_path = generate_question_set(chosen_subject, num_questions=3)
        print(f"\n🚀 Success! {chosen_subject.upper()} questions saved in: {final_path}")
    except Exception as e:
        print(f"❌ Error: {e}")