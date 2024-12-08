# BorderConnect Integration Backend

This FastAPI application handles document parsing, LLM processing, and BorderConnect API integration for cross-border shipping manifests.

## Features

- Document parsing (PDF, DOCX, TXT)
- Integration with Groq LLM for intelligent document processing
- BorderConnect API integration for ACE/ACI manifests
- Supabase database integration for user and manifest management
- Authentication and authorization

## Prerequisites

- Python 3.8+
- PostgreSQL (via Supabase)
- Groq API access
- BorderConnect API access

## Installation

1. Clone the repository
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Configuration

1. Create a `.env` file with the following variables:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   BORDERCONNECT_API_KEY=your_borderconnect_api_key
   BORDERCONNECT_URL=https://borderconnect.com
   GROQ_API_KEY=your_groq_api_key
   ```

## Database Setup

The application uses Supabase for data storage. Create the following tables:

1. drivers
2. vehicles
3. insurance_policies
4. manifests

Refer to `models.py` for the schema definitions.

## Running the Application

Development:
```bash
uvicorn app.main:app --reload
```

Production:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## API Endpoints

- POST `/upload`: Upload and process shipping documents
  - Accepts PDF, DOCX, or TXT files
  - Returns processed manifest data

## Error Handling

The application includes comprehensive error handling for:
- Invalid file types
- PDF parsing errors
- API integration issues
- Database operations

## Security

- CORS middleware configured
- Authentication via Supabase
- API key validation for BorderConnect
- Rate limiting implemented

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

MIT License