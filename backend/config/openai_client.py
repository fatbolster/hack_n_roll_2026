"""
OpenAI Client Configuration

Shared OpenAI client setup for the entire backend.
Member 1 & 2 can import this client to make API calls.

Usage:
    from config.openai_client import client, call_openai
    
    # Use the client directly
    response = await client.chat.completions.create(...)
    
    # Or use the helper function
    result = await call_openai("Your prompt here")
"""

from openai import AsyncOpenAI
import os
from dotenv import load_dotenv
from typing import Dict, Any, Optional
import json

# Load environment variables
load_dotenv()

# Initialize OpenAI client
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Default settings - Using gpt-4o (best model)
DEFAULT_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o")
DEFAULT_TEMPERATURE = float(os.getenv("OPENAI_TEMPERATURE", "0.3"))
DEFAULT_MAX_TOKENS = int(os.getenv("OPENAI_MAX_TOKENS", "2000"))


async def call_openai(
    prompt: str,
    system_message: str = "You are a helpful assistant.",
    model: str = DEFAULT_MODEL,
    temperature: float = DEFAULT_TEMPERATURE,
    max_tokens: int = DEFAULT_MAX_TOKENS,
    response_format: Optional[Dict[str, str]] = None
) -> str:
    """
    Helper function to call OpenAI API with sensible defaults.
    
    Args:
        prompt: The user prompt/question
        system_message: System instruction for the AI
        model: OpenAI model to use (default: gpt-4o-mini)
        temperature: Randomness (0=focused, 1=creative)
        max_tokens: Maximum response length
        response_format: Optional {"type": "json_object"} to force JSON
        
    Returns:
        Response text from OpenAI
        
    Example:
        result = await call_openai(
            "Extract topics from this syllabus...",
            system_message="You are a syllabus analysis expert.",
            response_format={"type": "json_object"}
        )
    """
    try:
        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt}
        ]
        
        kwargs = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        if response_format:
            kwargs["response_format"] = response_format
        
        response = await client.chat.completions.create(**kwargs)
        return response.choices[0].message.content
    
    except Exception as e:
        raise Exception(f"OpenAI API call failed: {str(e)}")


async def call_openai_json(
    prompt: str,
    system_message: str = "You are a helpful assistant that returns JSON.",
    model: str = DEFAULT_MODEL
) -> Dict[str, Any]:
    """
    Call OpenAI and automatically parse JSON response.
    
    Args:
        prompt: The user prompt (should ask for JSON format)
        system_message: System instruction
        model: OpenAI model to use
        
    Returns:
        Parsed JSON dictionary
        
    Example:
        data = await call_openai_json(
            "Extract topics from this syllabus and return as JSON..."
        )
    """
    response = await call_openai(
        prompt=prompt,
        system_message=system_message,
        model=model,
        response_format={"type": "json_object"}
    )
    
    try:
        return json.loads(response)
    except json.JSONDecodeError as e:
        raise Exception(f"Failed to parse OpenAI response as JSON: {str(e)}")


# Example usage for Member 1 & 2:
"""
# In services/syllabus_diff.py or services/paper_analysis.py

from config.openai_client import call_openai, call_openai_json

async def extract_syllabus(file: UploadFile):
    # Extract PDF text first (using PyMuPDF)
    pdf_text = extract_pdf_text(file)
    
    # Call OpenAI to structure the content
    prompt = f'''
    Extract topics and learning outcomes from this syllabus:
    
    {pdf_text}
    
    Return JSON with this structure:
    {{
        "topics": [
            {{"topic_name": "...", "learning_outcomes": ["...", "..."]}}
        ]
    }}
    '''
    
    result = await call_openai_json(
        prompt=prompt,
        system_message="You are a syllabus analysis expert."
    )
    
    return result
"""
