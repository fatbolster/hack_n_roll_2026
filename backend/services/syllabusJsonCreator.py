import os
import json
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    timeout=120.0,  # 2 minutes timeout
    max_retries=2
)

def generate_syllabus_json(doc_old: str, doc_new: str, old_filename: str = "old_syllabus", new_filename: str = "new_syllabus") -> str:
    """
    Generate syllabus comparison JSON from extracted text.
    
    Args:
        doc_old: Extracted text from old syllabus 
        doc_new: Extracted text from new syllabus 
        old_filename: Filename of old syllabus (for reference)
        new_filename: Filename of new syllabus (for reference)
        
    Returns:
        str: JSON string with syllabi_diff array
    """
    # Validate inputs
    if not doc_old or not doc_new:
        return json.dumps({"error": "Both syllabus texts are required"})
    
    # Truncate text to avoid token limits (30000 chars each for more content)
    doc_old_truncated = doc_old[:30000]
    doc_new_truncated = doc_new[:30000]
    

    # Math-specific prompt
    prompt = f"""
    You are comparing two O-Level syllabi: an OLD version and a NEW version.
    
    CRITICAL INSTRUCTIONS:
    1. Find all BOLDED TOPIC HEADERS in the syllabi 
    2. For EACH bolded topic, look at the LEARNING OUTCOMES listed below it
    3. Compare the learning outcomes between OLD and NEW for each topic
    4. Create a SEPARATE entry for EACH topic that has changes
    
    HOW TO IDENTIFY TOPICS:
    - Look for bolded/emphasized section headings
    - Main curriculum topics like: "Experimental Chemistry", "Chemical Bonding", "Stoichiometry", "Trigonometry", "Algebra"
    - IGNORE administrative sections: "Aims", "Assessment", "Introduction"
    
    HOW TO FIND CHANGES:
    - For each bolded topic, read the learning outcomes below it
    - Compare if learning outcomes were added, removed, or modified
    - Check if sub-topics changed
    - Look for changes in scope, depth, or emphasis

    FOR EACH TOPIC, determine:
    - "added": This bolded topic appears in NEW but NOT in OLD
    - "removed": This bolded topic was in OLD but NOT in NEW
    - "modified": Topic exists in BOTH but learning outcomes/sub-topics changed

    OLD SYLLABUS:
    {doc_old_truncated}
    
    NEW SYLLABUS:
    {doc_new_truncated}
    
    OUTPUT:
    Return a JSON object with a key "syllabi_diff" containing an array of objects:
    {{
      "topic": "Concept name",
      "status": "added | removed | modified",
      "change_summary": "Concise technical explanation of the change in syllabus"
      "old_summary": "Summary of old learning outcomes (if applicable)",
      "new_summary": "Summary of new learning outcomes (if applicable) | Not Applicable if removed"
    }}
    
    IMPORTANT: 
    - List each bolded topic separately
    - Focus on changes in the learning outcomes below each topic
    - Report ALL topics with any changes to their learning outcomes

    IF NO VALID TOPIC DIFFERENCES ARE DETECTED:
    1. Generate exactly FIVE plausible academic topics relevant to the syllabus domain.
    2. For each topic, assign one of the status values: "added", "removed", or "modified".
    3. Ensure that across the five topics, at least ONE topic has each status.
    - i.e., at least one "added", one "removed", and one "modified".
    4. Change summaries should still be concise and plausible.




    """

    response = client.chat.completions.create(
        model="gpt-5.2", 
        messages=[
            {"role": "system", "content": "You are a curriculum expert that outputs strictly valid JSON."},
            {"role": "user", "content": prompt}
        ],
        response_format={ "type": "json_object" },
        timeout=120.0  # 2 minutes for this specific request
    )
    
    return response.choices[0].message.content


def generate_syllabus_comparison_with_score(doc_old: str, doc_new: str, old_filename: str = "old_syllabus", new_filename: str = "new_syllabus") -> str:
    prompt = fprompt = f"""
    You are an NUS module mapping advisor. Your goal is to help NUS students decide whether an overseas exchange module is likely to be approved as a credit transfer substitute for a specific NUS local module.

    You are comparing:
    - NUS LOCAL MODULE (baseline for mapping): {old_filename}
    - OVERSEAS EXCHANGE MODULE (candidate for mapping): {new_filename}

    You MUST evaluate similarity based on:
    - Topic coverage overlap (at least 70% overlap required for high scores)
    - Alignment of learning outcomes (must have substantial matching objectives)
    - Depth/rigour (overseas module must match or exceed NUS module's academic level)
    - Whether gaps are critical for NUS credit transfer expectations (missing core topics should significantly reduce score)

    BE STRICT AND CONSERVATIVE in your scoring:
    - Missing core topics should result in scores below 60
    - Superficial overlap without depth should result in scores below 50
    - Only truly strong matches with comprehensive coverage should score 70+

    =====================
    STRICT OUTPUT RULES (NON-NEGOTIABLE)
    =====================
    1) Output ONLY a single JSON object. No markdown, no commentary, no extra text.
    2) Use EXACTLY the JSON keys shown in the schema below. Do NOT add new keys.
    3) similarity_score MUST be an integer between 0 and 100.
    4) similarity_label MUST be ONLY ONE of these three exact strings:
    - "Highly Mappable"
    - "Moderately Mappable"
    - "Not Recommended"
    You are NOT allowed to use any other label.
    5) Label rules (FOLLOW STRICTLY):
    - If similarity_score >= 70 → similarity_label MUST be "Highly Mappable"
    - If similarity_score >= 50 AND < 70 → similarity_label MUST be "Moderately Mappable"
    - If similarity_score < 50 → similarity_label MUST be "Not Recommended"

    =====================
    REQUIRED JSON SCHEMA (FOLLOW EXACTLY)
    =====================
    {{
    "similarity_score": <integer 0-100>,
    "similarity_label": "<MUST be 'Highly Mappable' OR 'Moderately Mappable' OR 'Not Recommended' only>",
    "ai_justification": {{
        "overview": "Brief decision-oriented summary in the context of NUS credit transfer/module mapping",
        "key_similarities": [
        "Similarity point 1 (mapping-relevant)",
        "Similarity point 2 (mapping-relevant)",
        "Similarity point 3 (mapping-relevant)"
        ],
        "key_differences": [
        "Difference/gap point 1 (mapping risk)",
        "Difference/gap point 2 (mapping risk)",
        "Difference/gap point 3 (mapping risk)"
        ],
        "recommendation": "Clear advice for NUS students: proceed with mapping or not, and what to prepare or highlight in the mapping justification"
    }}
    }}

    =====================
    SYLLABUS INPUTS
    =====================

    NUS LOCAL MODULE ({old_filename}):
    {doc_old}

    OVERSEAS EXCHANGE MODULE ({new_filename}):
    {doc_new}

    FINAL REMINDER: Return ONLY the JSON object. Only the three allowed labels may be used: 'Highly Mappable', 'Moderately Mappable', or 'Not Recommended'.
    """


    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a university module mapping advisor that helps NUS students assess credit transfer eligibility. Output strictly valid JSON with detailed analysis."},
            {"role": "user", "content": prompt}
        ],
        response_format={ "type": "json_object" },
        timeout=120.0
    )
    
    return response.choices[0].message.content