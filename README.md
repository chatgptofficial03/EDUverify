# EduVerify — APAAR Student Data Management & Verification Platform
### Smart India Hackathon 2026 — Problem Statement SIH26263
> **"Trusted Academic Records. Verified at Scale."**

---

## 1. Executive Summary & Problem Statement Alignment
EduVerify is a centralized, role-governed student-data management and verification platform built specifically for AICTE-approved institutions and the central AICTE regulatory council.

### Problems Solved:
1. **Unstandardized Enrolment Reporting:** Standardizes student data collection linked to 12-digit APAAR identifiers.
2. **Cross-Institutional Duplicate Collision Detection:** Detects duplicate APAAR IDs and roll numbers intra-batch and across the national institutional database.
3. **Approved Intake Monitoring & Anomaly Guard:** Real-time formula-driven calculation of seat utilization with multi-tier alerts (`NORMAL <80%`, `APPROACHING 80-99.9%`, `AT_CAPACITY 100%`, `OVER_CAPACITY >100%`).
4. **Institutional Review & State-Machine Clearance:** Multi-step CSV ingestion pipeline with atomic commit and central review queue (`DRAFT` &rarr; `VALIDATING` &rarr; `VALIDATED` &rarr; `SUBMITTED` &rarr; `APPROVED` / `REJECTED`).
5. **Privacy-Preserving Verification Portal:** Minimizes data exposure for third-party verifiers with masked identifiers and generated demonstration verification receipts.
6. **Enterprise Audit Trail:** Cryptographically timestamped, tamper-evident audit logs of every mutation, login, batch approval, and student query.

---

## 2. Technology Stack
- **Frontend Framework:** Next.js 14 (App Router, Server Actions, Route Handlers)
- **Language:** TypeScript with strict type checking
- **Styling:** Vanilla Tailwind CSS with custom Government-Tech Palette (Deep Navy `#0f172a`, AICTE Blue `#1e40af`, Slate Neutral, Emerald/Amber/Rose status badges)
- **Database & ORM:** Prisma ORM with SQLite (zero-config local development, production-ready PostgreSQL migration path)
- **Session Management:** Secure HTTP-only cookies, HMAC-SHA256 signed session tokens, bcrypt password hashing, login throttling
- **Visual Analytics:** Recharts for intake seat utilization and discipline distribution
- **CSV Engine:** PapaParse with formula-injection mitigation (`=`, `+`, `-`, `@` sanitization)
- **Testing:** Vitest unit and integration test suite

---

## 3. Pre-Configured Demo Accounts (SIH 2026 Judging)
All demo accounts are pre-seeded and active. The shared password is: **`Demo@12345`**

| Role | Email | Password | Primary Scope & Access |
| :--- | :--- | :--- | :--- |
| **Institution Administrator** | `institution@demo.edu` | `Demo@12345` | Delhi Institute of Technology & Science (`AICTE-1-1001`). Upload CSVs, manage students, view intake, submit batches. |
| **AICTE Central Administrator** | `aicte@demo.edu` | `Demo@12345` | AICTE Central Regulatory Headquarters. System-wide dashboard, review queue, approve/reject batches, adjust intake. |
| **Authorized Verifier** | `verifier@demo.edu` | `Demo@12345` | Third-party background verifier. Privacy-minimized student search, generate official demo verification receipt. |
| **Read-Only Observer** | `observer@demo.edu` | `Demo@12345` | State Council Observer. Aggregate analytics, macro-intake trends, export authorized reports. |

*Quick-access buttons are available directly on the login screen for 1-click judging evaluation.*

---

## 4. Local Installation & Setup Instructions

### Prerequisites
- Node.js v18+ or v20 LTS
- npm v9+ or v10+

### Step-by-Step Commands
```bash
# 1. Navigate to the project directory
cd eduverify

# 2. Install dependencies
npm install

# 3. Synchronize database schema (SQLite)
npx prisma db push

# 4. Seed demonstration dataset (5 institutions, 4 users, 110+ students, sample batches)
npm run seed

# 5. Run the automated test suite (Unit & Integration tests)
npm test

# 6. Build production bundle (Validates TypeScript & Route optimization)
npm run build

# 7. Start the application
npm start
# Alternatively, start in development mode:
npm run dev
```

The application will be accessible at: **`http://localhost:3000`**

---

## 5. Five-Minute SIH Judging Demonstration Script

### Act 1 — Institutional Enrolment & Capacity Monitoring (2 mins)
1. Navigate to `http://localhost:3000/login` and click **"Institution"** quick-access button (`institution@demo.edu`).
2. Observe the **Institution Dashboard**:
   - Total Students: 75
   - Approved Intake: 200 seats
   - Intake Utilization: **37.5% (NORMAL)**
   - Discipline distribution bar chart and real-time audit entries.
3. Open **CSV Bulk Upload Wizard** (`/imports/new`):
   - Notice downloadable templates: empty template, clean sample, and error sample.
   - Upload `public/sample_students_with_errors.csv`.
   - In Step 2, review auto-mapped headers.
   - Click **"Run Validation Engine"**.
   - In Step 4, inspect the **Row Validation Inspector**:
     - Row #2 flagged for `INVALID_APAAR_FORMAT` (must be 12 digits).
     - Row #3 flagged for `MISSING_REQUIRED_FIELD` (missing student roll).
     - Row #4 flagged for `MISSING_REQUIRED_FIELD` (missing student name).
     - Row #5 flagged for `INVALID_DATE` (2025-14-99).
     - Row #6 flagged for `INVALID_ENUM` (invalid enrolment status).
     - Row #8 flagged for `DUPLICATE_APAAR_IN_BATCH` (intra-batch collision with Row #7).
     - Row #10 flagged for `DUPLICATE_APAAR_EXISTING` (collision with student in Delhi Institute).
4. Click **"Commit Valid Records to Database"**:
   - Only validated records are committed in a single atomic transaction.
   - Notice batch state changes to `VALIDATED`.
5. Click **"Submit Batch to AICTE for Central Clearance"**:
   - Batch transitions to `SUBMITTED`.
   - Security Notice: Institutions cannot self-approve submissions.

---

### Act 2 — AICTE Central Authority Review Queue (1.5 mins)
1. Logout and log in as **`aicte@demo.edu`** (Central Admin).
2. Observe the **Central Dashboard** (`/dashboard/central`):
   - 5 Affiliated institutions across Delhi, Maharashtra, Karnataka, Tamil Nadu, Telangana.
   - Over-enrolment warning indicators.
   - National seat matrix distribution.
3. Open **Review Queue** (`/submissions`):
   - Notice the pending batch submitted by the institution.
   - Inspect problematic rows and valid count.
   - Click **"Approve"** (or test **"Reject"** with mandatory justification requirement).
   - Approval updates database state to `APPROVED`, sends in-app notification to the institution, and logs an immutable audit event.
4. Open **Institution Management** (`/institutions`):
   - Click **"Adjust Intake"** for Delhi Institute.
   - Lower intake or raise intake; observe instant recalculation of capacity utilization and warning badges.

---

### Act 3 — Privacy-Preserving Verification Portal (1.5 mins)
1. Logout and log in as **`verifier@demo.edu`** (Authorized Verifier).
2. Open **Student Verification** (`/verification`):
   - Query APAAR ID: `900010000001` or Roll: `DIT-2025-CS-101`.
   - Purpose: "Employer Academic Clearance".
   - Click **"Verify Record"**.
3. Inspect the verified output:
   - Full Name: `Aarav Sharma`
   - Masked APAAR: `XXXXXXXX0001` (PII protected via data minimization).
   - Institution, Programme, Course, Enrolment Status: `ACTIVE`.
   - AICTE Batch Clearance: `APPROVED`.
   - Cryptographic demonstration verification reference: `VER-DEMO-2026-XXXX`.
4. Click **"Print Official Receipt"** to demonstrate formatted verification certificate printing.
5. Open **System Audit Logs** (`/audit`):
   - Verify that the verification query, login, and batch approval were permanently recorded with actor email, role, and sanitized metadata.

---

## 6. External Government Integration Boundary & Production Migration
EduVerify is architected to decouple the presentation and orchestration layer from identity providers:

### Production Transition Checklist:
1. **Official APAAR API Integration:**
   - In `src/lib/validation.ts`, replace `isValidApaarFormat` with an authenticated REST/OAuth2 adapter invoking the Ministry of Education / UIDAI APAAR gateway.
2. **Database Migration to PostgreSQL:**
   - Update `prisma/schema.prisma` datasource from `sqlite` to `postgresql`.
   - Run `npx prisma migrate dev --name init`.
3. **Enterprise Single Sign-On (SSO):**
   - Hook into Parichay / MeriPehchan OpenID Connect (OIDC) government gateway in `src/lib/auth.ts`.

---

## 7. Automated Test Suite Results
Run tests anytime via:
```bash
npm test
```

### Test Coverage Highlights:
- **Unit Tests (`tests/unit/validation.test.ts`):**
  - `isValidApaarFormat`: 12-digit checks, boundary conditions, invalid characters.
  - `isValidDate`: ISO YYYY-MM-DD validation, realistic year bounds.
  - `validateStudentRow`: Missing required fields, enum enforcement.
  - `detectBatchDuplicates`: Intra-batch duplicate APAAR & roll collision detection.
  - `calculateIntakeUtilization`: Precise formula, 0 intake safety, threshold tiers (`NORMAL`, `APPROACHING`, `AT_CAPACITY`, `OVER_CAPACITY`).
- **Integration Tests (`tests/integration/api.test.ts`):**
  - Argon2/bcrypt password hashing and HMAC-SHA256 session token verification.
  - CSV Formula Injection protection (`=`, `+`, `-`, `@`).
  - Batch ingestion and anomaly detection pipeline.
  - Intake headroom and excess calculation.

---

## 8. SIH 2026 Project Organization
```
eduverify/
├── prisma/
│   └── schema.prisma            # Normalized database schema & constraints
├── public/
│   ├── student_upload_template.csv     # Empty CSV template
│   ├── sample_students_valid.csv       # 10 clean valid sample records
│   └── sample_students_with_errors.csv # Intentional errors & collisions
├── scripts/
│   └── seed.mjs                 # Deterministic database seeder
├── src/
│   ├── app/
│   │   ├── api/                 # 19 REST route handlers (Auth, Students, Imports, Review, Verifications, Analytics, Audit)
│   │   ├── dashboard/           # Institution & Central AICTE dashboards
│   │   ├── students/            # Student Directory with CRUD & filters
│   │   ├── imports/             # 6-step CSV Bulk Upload Wizard & History
│   │   ├── institutions/        # Institution Intake Management
│   │   ├── submissions/         # AICTE Central Review Queue
│   │   ├── verification/        # Verification Portal & Printable Receipt
│   │   ├── analytics/           # Analytics & Reports with Recharts
│   │   ├── audit/               # System-wide Audit Log
│   │   ├── notifications/       # DB-backed in-app notifications
│   │   ├── settings/            # Settings & Tunable Demo Parameters
│   │   ├── login/               # Role-based login with quick judge buttons
│   │   └── layout.tsx           # Persistent Gov-Tech AppShell
│   ├── components/
│   │   ├── layout/AppShell.tsx  # Responsive navigation shell & role guards
│   │   └── ui/                  # Badge, Card, MetricCard, Modal
│   └── lib/
│       ├── auth.ts              # RBAC guards & session management
│       ├── db.ts                # Prisma client singleton
│       ├── export.ts            # CSV formula-injection mitigation
│       ├── types.ts             # Domain & validation interfaces
│       └── validation.ts        # Core validation engine
└── tests/
    ├── unit/validation.test.ts  # Validation engine unit tests
    └── integration/api.test.ts  # Auth, CSV, & intake integration tests
```

---
*Developed for Smart India Hackathon 2026 — AICTE Problem Statement SIH26263.*
