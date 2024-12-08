# app/services/groq_service.py
from groq import Groq
from typing import Dict
import dotenv
import os

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

dotenv.load_dotenv()

async def process_with_groq(content: str, manifest_type: str, crossing_time: str, border_crossing: str) -> Dict:
    client = Groq(api_key=GROQ_API_KEY)
    
    prompt = f"""
    Analyze the following shipping document and extract information for a {manifest_type} manifest.
    Border Crossing: {border_crossing}
    Crossing Time: {crossing_time}

    Document content:
    {content}

    Format the response as a JSON object with the following structure:
    {{
        "shipment": {{
            "shipment_control_number": "",
            "type": "",
            "province_of_loading": "",
            "shipper": {{
                "name": "",
                "address": "",
                "city": "",
                "state": "",
                "postal_code": ""
            }},
            "consignee": {{
                "name": "",
                "address": "",
                "city": "",
                "state": "",
                "postal_code": ""
            }}
        }},
        "commodities": [
            {{
                "description": "",
                "quantity": 0,
                "packaging_unit": "",
                "weight": 0,
                "weight_unit": ""
            }}
        ]
    }}

    Extract only factual information present in the document. Return the JSON response without additional text.
    """
    
    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
        max_tokens=3000,
        response_format={"type": "json_object"},
    )
    
    return completion.choices[0].message


# # app/services/groq_service.py
# from groq import Groq
# from typing import Dict

# async def process_with_groq(content: str, manifest_type: str) -> Dict:
#     client = Groq()
    
#     # Customize this prompt based on your needs
#     prompt = f"""
#     Analyze the following document content and extract relevant information for a {manifest_type} manifest.
#     Format the response as a JSON object matching the BorderConnect API requirements.
    
#     Document content:
#     {content}
    
#     Return only the JSON response without any additional text.
#     """
    
#     completion = client.chat.completions.create(
#         model="llama-3.3-70b-versatile",
#         messages=[{"role": "user", "content": prompt}],
#         temperature=0.3,
#         max_tokens=10280,
#         response_format={"type": "json_object"},
#     )
    
#     return completion.choices[0].message