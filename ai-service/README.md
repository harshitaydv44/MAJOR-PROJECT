# Delhi Societal Innovation Portal - AI Service

FastAPI-powered machine learning microservice for semantic challenge clustering, automatic civic duplicate detection, and solution matchmaking using scikit-learn and Sentence Transformers.

## Features
- **Semantic Duplicate Detection**: Identifies similar civic challenges posted across Delhi districts.
- **Priority & Categorization**: Evaluates severity and urgency based on citizen reports.
- **Matchmaking Engine**: Matches submitted problems with relevant university departments and industry mentors.

## Setup & Running

1. Create a virtual environment:
   ```bash
   cd ai-service
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Linux/macOS:
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

4. Interactive Swagger documentation will be accessible at:
   `http://localhost:8000/docs`
