# Delhi Societal Innovation & Collaboration Portal
## System Architecture & Technical Design

### 1. Executive Overview
The **Delhi Societal Innovation & Collaboration Portal** is a public-sector digital platform designed to bridge the gap between grassroots civic challenges across the National Capital Territory (NCT) of Delhi and academic, student, and industrial innovators. It coordinates 5 core stakeholders: Citizens, Government Administrators, Universities, Students, and Industry Partners.

### 2. High-Level Subsystems

```
+-------------------------------------------------------------------------+
|                              FRONTEND LAYER                             |
|          React 18 + Vite + Tailwind CSS + React Router + Leaflet        |
|  (Serif: Georgia/Times New Roman | Light Delhi Public-Sector Aesthetic) |
+-------------------------------------------------------------------------+
                                    |
                                    | REST API & WebSockets (Socket.IO)
                                    v
+-------------------------------------------------------------------------+
|                              BACKEND LAYER                              |
|                    Node.js + Express.js + Mongoose                      |
|   controllers/ | models/ | routes/ | middleware/ | services/ | utils/   |
+-------------------------------------------------------------------------+
          |                         |                         |
          | Mongoose ODM            | HTTP REST Client        | SDK Stream
          v                         v                         v
+------------------+      +--------------------+     +-------------------+
|  DATABASE LAYER  |      |     AI SERVICE     |     |   FILE STORAGE    |
|     MongoDB      |      |   FastAPI Python   |     |    Cloudinary     |
| (Collections:    |      | (Sentence-         |     | (Civic evidence,  |
|  Users,          |      |  Transformers,     |     |  project reports, |
|  Challenges,     |      |  scikit-learn,     |     |  student docs)    |
|  Solutions)      |      |  Pandas, NumPy)    |     |                   |
+------------------+      +--------------------+     +-------------------+
```

### 3. Role Stakeholder Matrix

| Role | Route | Primary Objective | Key Capabilities |
|------|-------|-------------------|------------------|
| **Citizen / Client** | `/client` | Problem Identification | Report civic issues, attach geotagged evidence, track verification & resolution status |
| **Admin / Government** | `/admin` | Governance & Verification | Review and validate incoming reports, allocate to academic institutions, monitor KPIs |
| **University** | `/university` | Academic Research & Supervision | Explore vetted problems, assign student cohorts, assign faculty mentors |
| **Student** | `/student` | Solution Development | Form multidisciplinary teams, build prototypes, submit solutions, earn credits & awards |
| **Industry / Startup** | `/industry` | Mentorship & Commercialization | Sponsor projects, offer mentorship & technology resources, facilitate real-world pilots |

### 4. Security & Compliance
- **Authentication**: Stateless JSON Web Tokens (JWT) signed using HMAC SHA-256 with role-based access control (RBAC).
- **Password Security**: Passwords salted and hashed with `bcryptjs` (work factor 10).
- **Auditability**: Mongoose timestamps on all submissions, edits, and administrative approvals.
