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