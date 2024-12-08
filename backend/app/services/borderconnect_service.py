# app/services/borderconnect_service.py
import requests
from typing import Dict
from ..config import Settings

settings = Settings()

async def send_to_borderconnect(manifest_data: Dict) -> Dict:
    headers = {
        "Api-Key": settings.borderconnect_api_key,
        "Content-Type": "application/json"
    }
    
    response = requests.post(
        f"{settings.borderconnect_url}/api/send/jones",
        headers=headers,
        json=manifest_data
    )
    
    if response.status_code != 200:
        raise Exception(f"BorderConnect API error: {response.text}")
    
    return response.json()
