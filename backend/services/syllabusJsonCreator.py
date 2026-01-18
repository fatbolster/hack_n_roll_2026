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
    prompt = f"""
    You are an NUS module mapping advisor evaluating whether an overseas exchange module can substitute for a local NUS module.

    COMPARING:
    - NUS LOCAL MODULE: {old_filename}
    - OVERSEAS EXCHANGE MODULE: {new_filename}

    =====================
    IMPORTANT GUIDELINES
    =====================
    - Base your evaluation primarily on the information in the provided PDFs
    - Look at module titles, descriptions, learning outcomes, and topics covered
    - Be fair but thorough in your assessment
    - If modules are from very different disciplines, score accordingly lower

    =====================
    EVALUATION CRITERIA
    =====================
    
    Consider these factors:
    
    1. DISCIPLINE & SUBJECT AREA (Weight: High)
       - Look at the module title and description to identify the field
       - Same specific area (e.g., both Operating Systems): Strong match
       - Same broad discipline (e.g., both CS but different areas): Good match
       - Related disciplines (e.g., CS and Software Engineering): Moderate match
       - Different disciplines (e.g., CS vs Sociology): Poor match (typically 20-40 range)
    
    2. LEARNING OUTCOMES ALIGNMENT (Weight: High)
       - Compare the learning outcomes/objectives from both PDFs
       - Do they enable students to achieve similar competencies?
       - Check the level of mastery (understand/apply/analyze/design)
       - Significant misalignment should reduce score, but some variation is acceptable
    
    3. TOPIC COVERAGE (Weight: High)
       - What proportion of key NUS module topics appear in the overseas module?
       - Core concepts should be present, but perfect overlap isn't required
       - 70%+ coverage is strong, 50-70% is moderate, below 50% is weak
    
    4. DEPTH & ACADEMIC RIGOR (Weight: Medium)
       - Does the overseas module treat topics with similar depth?
       - Minor differences in approach are acceptable

    SCORING GUIDELINES:
    - 70-100: Strong match, highly recommended
    - 60-69: Good match with some gaps, likely approvable
    - 50-59: Moderate match, may require additional justification
    - 35-49: Significant gaps, unlikely to be approved
    - 20-34: Very different, cross-discipline or major misalignment
    - Below 20: Completely unrelated
    
    LABEL ASSIGNMENT (FOLLOW EXACTLY):
    - If score >= 61 → use "Highly Mappable"
    - If score >= 45 AND score <= 60 → use "Partially Mappable"
    - If score < 45 → use "Not Recommended"

    =====================
    REQUIRED JSON OUTPUT
    =====================
    {{
    "similarity_score": <integer 0-100>,
    "similarity_label": "<EXACTLY: 'Highly Mappable' OR 'Partially Mappable' OR 'Not Recommended'>",
    "ai_justification": {{
        "overview": "Brief summary of the mapping assessment",
        "key_similarities": [
        "Specific similarity observed in the PDFs",
        "Another alignment point",
        "Third similarity"
        ],
        "key_differences": [
        "Important difference or gap",
        "Another significant difference",
        "Third notable gap"
        ],
        "recommendation": "Clear advice on mapping feasibility"
    }}
    }}

    =====================
    MODULES TO COMPARE
    =====================

    NUS LOCAL MODULE ({old_filename}):
    {doc_old}

    OVERSEAS EXCHANGE MODULE ({new_filename}):
    {doc_new}

    Evaluate based on the content provided. Be fair and balanced in your assessment.
    """

    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        temperature=0.3,
        messages=[
            {"role": "system", "content": "You are a fair and balanced university module mapping advisor. Apply label rules: 61+ = 'Highly Mappable', 45-60 = 'Partially Mappable', <45 = 'Not Recommended'. Output only valid JSON."},
            {"role": "user", "content": prompt}
        ],
        response_format={ "type": "json_object" },
        timeout=120.0
    )
    
    return response.choices[0].message.content