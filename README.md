# Delhi Societal Innovation & Collaboration Portal
### Government of National Capital Territory of Delhi (GNCTD) &bull; State Innovation Council

A unified, production-grade civic technology ecosystem bridging grassroots community problem statements across Delhi's 11 administrative districts with accredited state universities, multidisciplinary student engineering teams, government administrators, and corporate CSR/industry co-development partners.

---

## 1. System Architecture

```
                               ┌────────────────────────────────────────────────┐
                               │           React 18 + Vite Frontend             │
                               │  - Port 5173 (Georgia Serif Gov Light Theme)   │
                               │  - Recharts Analytics, Leaflet GIS Map         │
                               │  - Socket.IO Realtime Client                   │
                               └───────────────────────┬────────────────────────┘
                                                       │  REST API + JWT Bearer
                                                       │  WebSocket Handshake
                                                       ▼
                               ┌────────────────────────────────────────────────┐
                               │            Node.js + Express API               │
                               │  - Port 5000                                   │
                               │  - NoSQL Sanitizer & Role RBAC Middleware      │
                               │  - Centralized Error & IDOR Protection         │
                               │  - Multer 10MB Cloudinary Document Engine      │
                               └──────────────┬──────────────────┬──────────────┘
                                              │                  │
                         Async JSON Requests  │                  │  Mongoose ODM
                         for NLP/Embeddings   │                  │  Port 27017
                                              ▼                  ▼
┌────────────────────────────────────────────────┐    ┌─────────────────────────────────┐
│           FastAPI Python AI Service            │    │      MongoDB 8.0 Local Engine   │
│  - Port 8000                                   │    │  - Database: delhi_portal       │
│  - TF-IDF Cosine Similarity Category Matching  │    │  - Aggregation Pipelines        │
│  - Multi-factor Severity & Priority Model      │    │  - GeoJSON District Coordinates │
│  - University & Industry Recommender Engines   │    │  - Audit Logs & Timeline Events │
└────────────────────────────────────────────────┘    └─────────────────────────────────┘
```

---

## 2. 6 Core Stakeholder Roles & Pre-Seeded Credentials

All accounts come pre-configured with active status and password: **`Password123`**

| Role | Email | Name / Designation | Portal Route | Primary Capabilities |
|---|---|---|---|---|
| **`CLIENT`** | `citizen@delhi.gov.in` | Sunita Sharma (RWA President) | `/client` | Report civic challenges with geo-coordinates, upload photos/documents, monitor resolution progress, view public verified projects. |
| **`ADMIN`** | `admin@delhi.gov.in` | Dr. Vivek Saxena (IAS, Nodal Director) | `/admin` | Screen validation queue, approve/reject challenges, trigger AI matching, assign universities, monitor GIS district map, query live MongoDB analytics. |
| **`UNIVERSITY`** | `university@dtu.ac.in` | Delhi Technological University (DTU) | `/university` | Explore Challenge Marketplace, adopt validated problems, create innovation projects, manage multidisciplinary student cohorts, register verified societal impact. |
| **`FACULTY`** | `faculty@dtu.ac.in` | Prof. S. K. Singh (Environmental Eng.) | `/faculty` | Supervise assigned innovation teams, provide academic mentorship, review lab milestones, validate technical solution proposals. |
| **`STUDENT`** | `student@nsut.ac.in` | Rohan Verma (Lead Mechatronics Fellow) | `/student` | Build hardware/software prototypes, update milestone progress, submit field deliverables, collaborate in multidisciplinary teams. |
| **`INDUSTRY`** | `industry@tatapower.com` | Tata Power Delhi Innovation Hub | `/industry` | Discover university research opportunities, sponsor pilots, provide CSR funding & industrial field testing, co-develop civic hardware. |

---

## 3. End-to-End Civic Innovation Lifecycle

The portal strictly enforces an **11-stage state machine** governing project advancement:

```
[Citizen Submits Problem] 
          ↓
[FastAPI AI Categorization & Duplicate Detection]
          ↓
[Admin Review & Formal Validation]
          ↓
[AI University Matching (Domain/Facility Scoring)]
          ↓
1. CHALLENGE_ACCEPTED  → University adopts validated challenge
2. PROJECT_CREATED     → Research project initiated with preliminary milestones
3. PROPOSAL_SUBMITTED  → University submits formal engineering proposal
4. APPROVED            → Delhi State Innovation Council approves technical proposal
5. RESEARCH            → Baseline site reconnaissance, sensor surveys, literature analysis
6. PROTOTYPE           → Benchtop electronics assembly, firmware & algorithm builds
7. TESTING             → Laboratory stress-testing, calibration, bench validation
8. PILOT               → On-site field deployment at Delhi municipal site (MCD/DJB/PWD)
9. VALIDATION          → Ward performance certification & stakeholder verification
10. DEPLOYMENT         → Scaled civic deployment & municipal department handover
11. COMPLETED          → Verified societal impact metrics registered (Citizens benefited, cost, IP)
```

---

## 4. Key Platform Features

### A. Citizen Grievance & Challenge Submission
- Comprehensive form: Title, description, category, district, specific landmark, affected population, urgency, and attachments.
- Automatic GIS coordinate resolution across Delhi's 11 districts.
- 5-minute duplicate replay guard preventing accidental or automated flood submissions (`429 Too Many Requests`).

### B. AI Classification, Priority & Matching Microservice (`FastAPI`)
- **Category Classifier**: Analyzes grievance text via NLP TF-IDF Cosine Similarity against Delhi civic domains (*Water Management, Air Quality, Solid Waste, Renewable Energy, Traffic & Transit, Public Health*).
- **Priority Estimator**: Heuristic lexical risk model computing `critical`, `high`, `medium`, or `low` based on public safety keywords, population density, and infrastructure hazard indicators.
- **University Matcher**: Evaluates university laboratory facilities, faculty specializations, incubation centers, and past project areas to return ranked institutional candidates with human-readable rationale.
- **Industry Matcher**: Evaluates corporate partner technical capabilities, CSR budget commitments, prototype testing grounds, and mentorship readiness.

### C. Government GIS Map & MongoDB Analytics Dashboard
- **Interactive GIS Map** (`/admin/map`): Leaflet + OpenStreetMap displaying Delhi district boundaries, challenge clusters, active field projects, and priority telemetry.
- **Executive Analytics Console** (`/admin/analytics`): 10 Recharts data visualizations generated directly from live MongoDB aggregation pipelines (responsive to date, district, category, and stage filters).

### D. Real-Time Communication & Notifications
- Socket.IO bi-directional WebSocket engine notifying citizens, university leads, and administrators instantly upon stage changes, milestone updates, or partnership offers.
- Notification bell dropdown with unread badges, mark as read, and direct navigation links.

### E. Security, Authorization & Error Handling Matrix
- **NoSQL Injection Neutralization**: `sanitizeMiddleware.js` automatically strips `$` operator keys from all incoming request bodies and queries.
- **IDOR Protection**: Citizens are strictly blocked (`403 Forbidden`) from viewing or tampering with another citizen's grievance records.
- **PII Shielding**: Public endpoints redact citizen phone numbers and home addresses.
- **Object ID Validation**: Invalid 24-character hexadecimal IDs return clean `400 Bad Request`.
- **Multer Upload Limits**: Enforces 10MB maximum file size with MIME whitelist.
- **Frontend State Integrity**: Every API page provides `LoadingState`, `EmptyState`, and `ErrorState` with a **"Retry Connection"** action button.

---

## 5. Quick-Start Guide (Running the Entire Platform)

### Prerequisites
- Node.js 18+ (tested on Node v24.14.0)
- Python 3.10+
- MongoDB 6.0+ (running locally on port 27017)

### Step 1: Start MongoDB
```bash
mongod --dbpath "./backend/data/db" --bind_ip 127.0.0.1 --port 27017
```

### Step 2: Start Backend API (Port 5000)
```bash
cd backend
npm install
node src/server.js
```
- Health Check: `http://localhost:5000/api/health`

### Step 3: Start FastAPI AI Microservice (Port 8000)
```bash
cd ai-service
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```
- Health Check: `http://localhost:8000/health`
- Interactive API Docs: `http://localhost:8000/docs`

### Step 4: Start Frontend Application (Port 5173)
```bash
cd frontend
npm install
npm run dev -- --port 5173
```
- Portal URL: `http://localhost:5173`

---

## 6. Automated Verification Test Suite

A complete 18-stage end-to-end regression and security test suite is included in the backend:

```bash
cd backend
node verify_security_and_lifecycle.js
```

### Automated Test Coverage (18 / 18 Passed)
- `Stage 1`: API Health Probe (`200 OK`)
- `Stage 2A-2C`: Authentication, wrong password rejection (`401`), and unauthenticated route guard (`401`)
- `Stage 3`: NoSQL injection operator neutralization (`400 Bad Request`)
- `Stage 4`: Citizen challenge creation with AI categorization and priority estimation
- `Stage 5`: 5-minute duplicate challenge guard (`429 Too Many Requests`)
- `Stage 6`: Citizen PII protection (phone and address redacted from public views)
- `Stage 7`: Cross-citizen IDOR protection (`403 Forbidden`)
- `Stage 8`: Administrator challenge validation & audit logging
- `Stage 9`: AI-assisted university recommendation generation
- `Stage 10`: University challenge acceptance (`ASSIGNED`)
- `Stage 11`: University project creation linked to challenge ID
- `Stage 12`: Multidisciplinary student team creation & project linking
- `Stage 13A-13B`: AI industry partner matching & onboarding
- `Stage 14A-14B`: Milestone addition & dynamic overall progress recalculation
- `Stage 15A-15B`: State machine transition validation (`400` on skipped stages) and sequential 11-stage traversal through `COMPLETED`
- `Stage 16`: Verified societal impact registration (45,000 citizens benefited)
- `Stage 17`: Admin analytics MongoDB aggregations reflecting live metrics
- `Stage 18`: Malformed MongoDB ObjectId parameter validation (`400 Bad Request`)

### Production Frontend Build Verification
```bash
cd frontend
npm run build
```
- Result: **0 build errors**, compiled cleanly in **11-14s**.
