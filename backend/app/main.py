# app/main.py
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, Dict
from .services.pdf_parser import parse_document
from .services.groq_service import process_with_groq
from .services.borderconnect_service import send_to_borderconnect
from .schemas import ManifestData, BorderConnectResponse

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    manifest_type: str = Form(...),
    border_crossing: str = Form(...),
    crossing_time: str = Form(...),
    user_id: Optional[str] = Form(None)
) -> Dict:
    try:
        # Parse the uploaded document
        content = await parse_document(file)
        
        # Process with Groq LLM
        llm_response = await process_with_groq(
            content=content,
            manifest_type=manifest_type,
            crossing_time=crossing_time,
            border_crossing=border_crossing
        )
        
        # Get user data if authenticated
        user_data = {}
        if user_id:
            user_data = await get_user_data(user_id)
        
        return {
            "parsed_data": llm_response,
            "user_data": user_data,
            "manifest_type": manifest_type,
            "border_crossing": border_crossing,
            "crossing_time": crossing_time
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/manifest")
async def submit_manifest(manifest_data: ManifestData) -> Dict:
    try:
        # Store manifest in database
        stored_manifest = await store_manifest(manifest_data)
        
        return {
            "status": "success",
            "manifest_id": stored_manifest.id,
            "data": stored_manifest.dict()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/borderconnect")
async def submit_to_borderconnect(manifest_id: str) -> BorderConnectResponse:
    try:
        # Get manifest from database
        manifest = await get_manifest(manifest_id)
        
        # Format for BorderConnect
        borderconnect_data = format_for_borderconnect(manifest)
        
        # Send to BorderConnect
        response = await send_to_borderconnect(borderconnect_data)
        
        # Update manifest status in database
        await update_manifest_status(manifest_id, response)
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
