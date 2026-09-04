# Delhi Societal Innovation & Collaboration Portal
## REST API Specification

### Base URL
`http://localhost:5000/api`

---

### 1. Health Endpoints

#### GET `/api/health`
Checks backend operational status and connectivity.

- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Server is running"
}
```

---

### 2. Authentication Endpoints

#### POST `/api/auth/register`
Register a new user in the platform.

- **Request Body**:
```json
{
  "name": "Arun Sharma",
  "email": "arun@example.com",
  "password": "SecurePassword123!",
  "role": "client", // client | admin | university | student | industry
  "organization": "South Delhi Resident Welfare Association",
  "phoneNumber": "+91 98765 43210",
  "address": {
    "locality": "Hauz Khas",
    "district": "South Delhi",
    "pincode": "110016"
  }
}
```

- **Response `201 Created`**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "672...",
      "name": "Arun Sharma",
      "email": "arun@example.com",
      "role": "client",
      "organization": "South Delhi Resident Welfare Association"
    },
    "token": "eyJhbGciOi..."
  }
}
```

#### POST `/api/auth/login`
Authenticate existing user and retrieve session token.

- **Request Body**:
```json
{
  "email": "arun@example.com",
  "password": "SecurePassword123!",
  "role": "client" // optional role verification
}
```

- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "672...",
      "name": "Arun Sharma",
      "email": "arun@example.com",
      "role": "client",
      "organization": "South Delhi Resident Welfare Association"
    },
    "token": "eyJhbGciOi..."
  }
}
```

#### GET `/api/auth/me`
Retrieve currently authenticated user profile. Requires `Authorization: Bearer <token>` header.

- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "user": {
      "_id": "672...",
      "name": "Arun Sharma",
      "email": "arun@example.com",
      "role": "client"
    }
  }
}
```
