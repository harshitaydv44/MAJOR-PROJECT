# Delhi Societal Innovation & Collaboration Portal
## Getting Started & Local Setup Guide

This guide details how to launch all components of the system.

### Prerequisites
- **Node.js**: v18 or higher (v24 tested)
- **npm**: v9 or higher
- **MongoDB**: v6 or higher installed locally or MongoDB Atlas connection string
- **Python**: v3.10+ (for AI service)

---

### 1. Database (MongoDB)
Start local MongoDB:
```bash
mongod --dbpath "e:/Projects/MAJOR PROJECT/backend/data/db" --bind_ip 127.0.0.1 --port 27017
```
Or set `MONGO_URI` in `backend/.env` to your MongoDB Atlas connection string.

---

### 2. Backend (Node.js & Express)
1. Navigate to `backend`:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure `.env` (a template is prefilled in `.env.example`).
4. Start the server:
   ```bash
   npm start
   ```
   Server will run on `http://localhost:5000`. Health endpoint: `http://localhost:5000/api/health`.

---

### 3. Frontend (React + Vite)
1. Navigate to `frontend`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   Application will be accessible at `http://localhost:5173`.

---

### 4. AI Service (FastAPI)
1. Navigate to `ai-service`:
   ```bash
   cd ai-service
   ```
2. Create and activate virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # Linux/macOS:
   source venv/bin/activate
   ```
3. Install requirements:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the FastAPI microservice:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   Access Swagger API docs at `http://localhost:8000/docs`.
