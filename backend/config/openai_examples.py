"""
Example: How to Use OpenAI Client

This file shows Member 1 & 2 how to use the shared OpenAI setup.
"""

from config.openai_client import call_openai, call_openai_json, client


# Example 1: Simple text response
async def example_basic():
    response = await call_openai(
        prompt="What is 2+2?",
        system_message="You are a math tutor."
    )
    print(response)


# Example 2: Get JSON response
async def example_json():
    result = await call_openai_json(
        prompt="""
        Analyze this text and return JSON:
        "The cat sat on the mat."
        
        Format: {"subject": "...", "action": "...", "location": "..."}
        """
    )
    print(result)  # Dict: {"subject": "cat", "action": "sat", ...}


# Example 3: Using the raw client directly
async def example_advanced():
    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are helpful."},
            {"role": "user", "content": "Hello!"}
        ],
        temperature=0.7,
        max_tokens=100
    )
    print(response.choices[0].message.content)


# Example 4: For syllabus extraction (Member 1)
async def example_syllabus_extraction(pdf_text: str):
    prompt = f"""
    Extract all topics and learning outcomes from this syllabus:
    
    {pdf_text}
    
    Return JSON format:
    {{
        "topics": [
            {{
                "topic_name": "Algebra",
                "learning_outcomes": [
                    "Solve linear equations",
                    "Graph quadratic functions"
                ]
            }}
        ],
        "metadata": {{
            "subject": "Mathematics",
            "level": "O-Level"
        }}
    }}
    """
    
    result = await call_openai_json(
        prompt=prompt,
        system_message="You are an expert at analyzing educational syllabi."
    )
    return result


# Example 5: For comparing syllabi (Member 1)
async def example_compare_syllabi(old_text: str, new_text: str):
    prompt = f"""
    Compare these two syllabi and identify changes:
    
    OLD SYLLABUS:
    {old_text}
    
    NEW SYLLABUS:
    {new_text}
    
    Return JSON format:
    {{
        "added_topics": ["Topic A", "Topic B"],
        "removed_topics": ["Topic C"],
        "modified_outcomes": [
            {{
                "topic": "Algebra",
                "change_type": "modified",
                "old_text": "...",
                "new_text": "...",
                "explanation": "Added simultaneous equations"
            }}
        ],
        "summary": "3 changes detected",
        "total_changes": 3
    }}
    """
    
    result = await call_openai_json(
        prompt=prompt,
        system_message="You are an expert at comparing educational content."
    )
    return result


# Example 6: For mapping questions to topics (Member 2)
async def example_map_question_to_topic(question: str, syllabus_topics: list):
    topics_text = "\n".join([f"- {topic}" for topic in syllabus_topics])
    
    prompt = f"""
    Map this exam question to a syllabus topic:
    
    QUESTION: {question}
    
    AVAILABLE TOPICS:
    {topics_text}
    
    Return JSON:
    {{
        "mapped_topic": "Linear Equations",
        "confidence": 0.95,
        "is_aligned": true,
        "is_flagged": false,
        "evidence": "Question asks to solve for x, which matches 'Solve linear equations' outcome"
    }}
    """
    
    result = await call_openai_json(
        prompt=prompt,
        system_message="You are an expert at analyzing exam questions."
    )
    return result
