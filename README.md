# Employee Tracking System (EMS)

A full-stack HR management system built with **FastAPI** (backend) and **React + TypeScript** (frontend).

---

## Features

- Employee login with JWT authentication
- Daily attendance — check-in and check-out
- Late mark detection and overtime calculation
- Leave management — apply, approve, reject
- Payroll calculation with salary slips
- Department reports and monthly attendance summaries
- CSV export for reports
- Role-based access — Employee, Manager, HR, Admin

---

## Prerequisites

Make sure the following are installed before you start:

| Tool | Version |
|---|---|
| Python | 3.12+ |
| MySQL | 8.0+ |
| Node.js | 18+ |

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repo-url>
cd Employee_Tracking
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your MySQL credentials:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=hrms
SECRET_KEY=any_long_random_string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

> **Tables are created automatically** when the backend starts for the first time — you do not need to write any SQL manually.

### 3. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 4. Start the backend

Make sure MySQL is running, then:

```bash
cd Backend
uvicorn main:app --reload
```

Backend runs at: `http://localhost:8000`
Swagger API docs: `http://localhost:8000/docs`

### 5. Install and start the frontend

Open a **new terminal**:

```bash
cd Frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Project Structure

```
Employee_Tracking/
├── Backend/
│   ├── main.py            # FastAPI entry point
│   ├── db.py              # DB connection + auto table/view setup
│   ├── auth/              # Login, signup, JWT
│   ├── attendance/        # Check-in, checkout, late marks, overtime
│   ├── leave/             # Apply, approve, reject leaves
│   ├── payroll/           # Salary calculation
│   └── reports/           # Department reports, CSV export
│
├── Frontend/
│   └── src/
│       ├── api/           # Axios API calls
│       ├── pages/         # All pages
│       ├── components/    # Navbar, Sidebar, Layout
│       ├── store/         # Auth state (Zustand)
│       ├── types/         # TypeScript types
│       └── utils/         # Shared helpers
│
├── Dockerfile             # Single Dockerfile — builds and runs everything
├── .env.example           # Template for environment variables
└── requirements.txt       # Python dependencies
```

---

## Roles & Access

| Role | Access |
|---|---|
| **Employee** | Mark attendance, apply leave, view own payroll & salary slip |
| **Manager** | Everything above + approve/reject leave requests |
| **HR** | Everything above + payroll manager, overtime report, department reports, CSV export |
| **Admin** | Full access to everything |

---

## Docker Deployment

Build and run the entire app (frontend + backend) in a single container:

```bash
# Build
docker build -t employee-tracking .

# Run — pass your DB credentials as environment variables
docker run -p 80:80 \
  -e DB_HOST=your-db-host \
  -e DB_USER=root \
  -e DB_PASSWORD=your-password \
  -e DB_NAME=hrms \
  -e SECRET_KEY=your-secret \
  -e ALGORITHM=HS256 \
  -e ACCESS_TOKEN_EXPIRE_MINUTES=60 \
  employee-tracking
```

App runs at: `http://localhost`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI, Python 3.12 |
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS |
| Database | MySQL 8 |
| Auth | JWT (PyJWT + bcrypt) |
| State | Zustand |
| Charts | Recharts |
| Container | Docker + nginx + supervisord |
