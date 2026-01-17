import os
import json
from dotenv import load_dotenv
from openai import OpenAI

# --- SETUP ---
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))    

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def chunk_list(data, chunk_size):
    for i in range(0, len(data), chunk_size):
        yield data[i:i + chunk_size]


def map_questions_to_syllabus(syllabus_path, questions_path, chunk_size=5):
    # --- READ FILES ---
    with open(syllabus_path, "r", encoding="utf-8") as f:
        syllabus_text = f.read()

    with open(questions_path, "r", encoding="utf-8") as f:
        questions_data = json.load(f)

    questions = questions_data["questions"]
    all_results = []

    # --- PROCESS QUESTIONS IN CHUNKS ---
    for idx, q_chunk in enumerate(chunk_list(questions, chunk_size), start=1):
        print(f"⏳ Processing chunk {idx} ({len(q_chunk)} questions)...")

        prompt = f"""
You are a Senior Mathematics Curriculum Specialist.

SYLLABUS (AUTHORITATIVE SCOPE):
{syllabus_text}

TASK:
For EACH question below:
1. Assign syllabus topics (use syllabus wording).
2. Decide if the question is IN-SCOPE or OUT-OF-SCOPE.
3. If out-of-scope, explain why.
4. If there are any questions that arent questions ignore them during output


OUTPUT FORMAT (STRICT JSON):
{{
  "question_topic_mapping": [
    {{
      "question_id": "Qn",
      "page": number,
      "topics": ["Topic 1", "Topic 2"],
      "in_syllabus": true | false,
      "confidence": 0,
      "out_of_scope_reason": "string or null"
    }}
  ]
}}

QUESTIONS:
{json.dumps(q_chunk, indent=2)}
"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You output ONLY valid JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )

        chunk_json = json.loads(response.choices[0].message.content)
        all_results.extend(chunk_json["question_topic_mapping"])

    return {
        "paper_id": questions_data.get("paper_id", "unknown"),
        "question_topic_mapping": all_results
    }


# ---- RUN ----
result = map_questions_to_syllabus(
    os.path.join(BASE_DIR, "extractedSyllabus.txt"),
    os.path.join(BASE_DIR, "questions.json"),
    chunk_size=5
)

output_path = os.path.join(BASE_DIR, "question_syllabus_mapping.json")
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(result, f, indent=2)

print(f"✅ Success! Saved to {output_path}")
