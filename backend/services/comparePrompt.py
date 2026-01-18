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

    questions = questions_data["questions"][:40]  # Limit to first 40 questions
    all_results = []

    # --- PROCESS QUESTIONS IN CHUNKS ---
    for idx, q_chunk in enumerate(chunk_list(questions, chunk_size), start=1):
        print(f"⏳ Processing chunk {idx} ({len(q_chunk)} questions)...")

        prompt = f"""
You are a Senior Mathematics Curriculum Specialist.

You are given:
• An OFFICIAL mathematics syllabus in text format(authoritative).
• A list of extracted exam questions in json

Your job is to analyse ONLY genuine mathematics questions.


TASK:
For EACH valid mathematics question below:

1. Assign one or more syllabus topics using the EXACT wording from the syllabus where possible.
2. Decide whether the question is IN-SCOPE or OUT-OF-SCOPE.
3. If you are unsure which exact topic applies, choose the CLOSEST reasonable syllabus topic instead of leaving it empty.
4. Be conservative when marking OUT-OF-SCOPE. Only mark OUT-OF-SCOPE if the content is clearly not covered by the syllabus.

IMPORTANT RULES:
• Do NOT invent new topics.
• Do NOT output empty topic lists for IN-SCOPE questions.
• Do NOT merge multiple questions into one.
• Treat subparts (e.g. a, b, c) as separate questions IF they test different skills.
• Preserve the original question_id exactly as given.
• Do NOT renumber questions.
• Output STRICTLY valid JSON only.
• Do NOT include explanations outside the JSON.

You are NOT allowed to mark a question as OUT-OF-SCOPE
unless you can explicitly name the mathematical topic
and state that it is absent from the syllabus.


CONFIDENCE SCORE:
Assign a confidence score between 0 and 1:
• 1.0 → topic match is very clear
• 0.7–0.9 → reasonable match with minor ambiguity
• 0.4–0.6 → weak or approximate match
• 0.0 → OUT-OF-SCOPE


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

SYLLABUS:
{syllabus_text}

QUESTIONS:
{json.dumps(q_chunk, indent=2)}
"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            temperature=0,
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
if __name__ == "__main__":
    result = map_questions_to_syllabus(
        os.path.join(BASE_DIR, "extractedSyllabus.txt"),
        os.path.join(BASE_DIR, "questions3.json"),
        chunk_size=5
    )

    output_path = os.path.join(BASE_DIR, "question_syllabus_mapping.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)

    print(f"✅ Success! Saved to {output_path}")