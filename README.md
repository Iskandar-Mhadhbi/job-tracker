# Job Tracker

![CI/CD](https://github.com/Iskandar-Mhadhbi/job-tracker/actions/workflows/ci.yml/badge.svg?branch=develop)
![Node](https://img.shields.io/badge/Node-20-green?logo=node.js)
![NestJS](https://img.shields.io/badge/NestJS-11-red?logo=nestjs)
![Angular](https://img.shields.io/badge/Angular-22-red?logo=angular)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-ready-blue?logo=docker)
![License](https://img.shields.io/badge/license-MIT-green)
![AWS](https://img.shields.io/badge/AWS-LocalStack-orange?logo=amazon-aws)

A full-stack job application tracker to manage your job search from application to offer. Built with a production-grade stack including CI/CD, containerization, real-time monitoring, AI-powered analysis, and an event-driven AWS architecture.

---
## Table of Contents

- [Features](#features)
- [Screenshots](#screenshots)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring](#monitoring)
- [Project Structure](#project-structure)
- [Future Improvements](#future-improvements)

---

## Features

- **Application Management** — Create, edit, delete job applications with full details
- **Status Pipeline** — Track progress: Applied → Interview → Offer / Rejected / Withdrawn
- **Dashboard** — Visual overview of your application pipeline with live stats
- **Filter by Status** — Quickly find applications by stage
- **Follow-up Dates** — Never miss a follow-up
- **JWT Authentication** — Secure per-user data with token-based auth
- **REST API** — Clean, documented endpoints with validation
- **AI Job Match Analyzer** — Upload your CV and a job description to get an AI-powered match score, cover letter, missing skills analysis, and interview tips powered by Google Gemini
- **Event-Driven Architecture** — Application status changes trigger AWS EventBridge events, invoking a Lambda function that logs notifications to S3
- **S3 Document Storage** — CV files uploaded during AI analysis are stored in AWS S3
- **IAM Security** — Lambda execution role with least-privilege S3 access policy
- **Monitoring** — Prometheus metrics + Grafana dashboards
- **Load Testing** — k6 smoke and stress tests integrated into CI/CD pipeline

---

## Screenshots

### Login
![Login](screenshots/login.png)

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Applications
![Applications](screenshots/applications.png)

### Add Application
![Add Application](screenshots/add-application.png)

### Prometheus Monitoring
![Prometheus](screenshots/prometheus.png)

### AI Job Match Analyzer
![AI Analyzer](screenshots/ai-analyser_1.png)
![AI Analyzer](screenshots/ai-analyser_2.png)
---

## Architecture

```
┌─────────────┐     HTTP      ┌─────────────────┐     TypeORM    ┌──────────────┐
│   Angular   │ ────────────► │    NestJS API    │ ─────────────► │  PostgreSQL  │
│  Frontend   │               │   (Port 3000)    │                │  (Port 5432) │
└─────────────┘               └─────────────────┘                └──────────────┘
                                       │
                          ┌────────────┴────────────┐
                          │ /metrics                 │ Status Change
                          ▼                          ▼
                  ┌──────────────┐         ┌─────────────────┐
                  │  Prometheus  │         │   EventBridge   │
                  │  (Port 9090) │         │   (LocalStack)  │
                  └──────┬───────┘         └────────┬────────┘
                         │                          │
                         ▼                          ▼
                  ┌─────────────┐         ┌─────────────────┐
                  │   Grafana   │         │     Lambda      │
                  │ (Port 3001) │         │ status-handler  │
                  └─────────────┘         └────────┬────────┘
                                                   │
                                                   ▼
                                          ┌─────────────────┐
                                          │    S3 Bucket    │
                                          │ job-tracker-cvs │
                                          └─────────────────┘
```
## AWS Architecture (via LocalStack)

The app implements an event-driven architecture using AWS services, emulated locally via LocalStack:

```
Status Change → EventBridge → Lambda → S3 Notification
CV Upload     → S3 Storage
```
| Resource | Type | Purpose |
|----------|------|---------|
| `job-tracker-cvs` | S3 Bucket | Stores uploaded CVs and Lambda notifications |
| `application-status-changed-rule` | EventBridge Rule | Routes status change events to Lambda |
| `status-change-handler` | Lambda Function | Processes events, writes notifications to S3 |
| `lambda-exec-role` | IAM Role | Least-privilege execution role for Lambda |

Infrastructure is provisioned automatically via `infrastructure/localstack/init/01-setup.sh` on LocalStack startup.
---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Angular 22, RxJS, SCSS |
| Backend | NestJS 11, TypeORM, Passport JWT |
| Database | PostgreSQL 15 |
| AI | Google Gemini API |
| AWS (LocalStack) | S3, EventBridge, Lambda, IAM |
| Monitoring | Prometheus, Grafana |
| Infrastructure | Docker, Docker Compose |
| CI/CD | GitHub Actions, GitHub Container Registry |
| Testing | Jest (unit tests, 23 passing), k6 (smoke & stress tests) |

---

## Getting Started

### Prerequisites

- Node.js 20+
- Docker Desktop
- LocalStack Auth Token (free at [localstack.cloud](https://localstack.cloud))

### Option A — Full Docker Setup (recommended)

```bash
git clone https://github.com/Iskandar-Mhadhbi/job-tracker.git
cd job-tracker

# Copy and configure environment files
cp backend/.env.example backend/.env
cp .env.example .env

# Add your secrets to backend/.env:
# - JWT_SECRET
# - GEMINI_API_KEY

# Add your LocalStack token to .env:
# - LOCALSTACK_AUTH_TOKEN

# Start everything
docker-compose up -d
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:4200 |
| Backend API | http://localhost:3000/api |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3001 |
| LocalStack | http://localhost:4566 |
| LocalStack Dashboard | https://app.localstack.cloud |

Grafana default credentials: `admin` / `admin`

### Option B — Local Development

**Start infrastructure only:**
```bash
docker-compose up postgres localstack -d
```

**Backend:**
```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```

**Frontend:**
```bash
cd frontend
npm install
ng serve
```
## API Endpoints

### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login | ❌ |
| GET | `/api/auth/profile` | Get current user | ✅ |

### Applications
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/applications` | List all applications | ✅ |
| GET | `/api/applications?status=interview` | Filter by status | ✅ |
| GET | `/api/applications/stats` | Get pipeline stats | ✅ |
| POST | `/api/applications` | Create application | ✅ |
| PATCH | `/api/applications/:id` | Update application | ✅ |
| DELETE | `/api/applications/:id` | Delete application | ✅ |

### AI
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/ai/analyze` | Analyze CV against job description | ✅ |

### AWS
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/aws/notifications` | List Lambda-processed notifications from S3 | ✅ |

### Monitoring
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/metrics` | Prometheus metrics |

---

## Testing

```bash
cd backend

# Run unit tests
npm test

# Run with coverage report
npm run test:cov
```

Coverage report generated at `backend/coverage/lcov-report/index.html`

**Test suites:** 4 | **Tests:** 23 passing | **Coverage:** Services 96-100% 

### Load Testing with k6

```bash
# Smoke test (light load — 5 VUs, 30s)
k6 run k6/smoke-test.js

# Stress test (heavy load — ramp to 50 VUs over 2.5 minutes)
k6 run k6/stress-test.js
```

---

## CI/CD Pipeline

Every push to `develop` or `main` triggers a 5-stage pipeline:

```
Tests & Coverage
      │
      ├── Build Backend Image ──┐
      │                        ├── Smoke Test ── Stress Test (main only)
      └── Build Frontend Image ─┘
```

| Job | Trigger | Description |
|-----|---------|-------------|
| Tests & Coverage | Every push | Jest unit tests + HTML coverage report artifact |
| Build Backend | After tests pass | Docker image built, pushed to GHCR on `main` |
| Build Frontend | After tests pass | Docker image built, pushed to GHCR on `main` |
| Smoke Test | After builds | k6 smoke test — 5 VUs, 30s, p95 < 500ms |
| Stress Test | `main` only | k6 stress test — ramp to 50 VUs, p95 < 1000ms |

Docker images published to GitHub Container Registry:
- `ghcr.io/iskandar-mhadhbi/job-tracker/backend:latest`
- `ghcr.io/iskandar-mhadhbi/job-tracker/frontend:latest` 
---

## Monitoring

Prometheus scrapes metrics from the backend every 15 seconds. Access Grafana at `http://localhost:3001` to visualize:

- HTTP request rates
- Node.js heap memory usage
- CPU usage
- Active connections

To add a dashboard in Grafana:
1. Login at `http://localhost:3001` with `admin/admin`
2. Add data source → Prometheus → `http://prometheus:9090`
3. Import dashboard ID `11159` (Node.js Application Dashboard)

---

## Project Structure

```
job-tracker/
├── backend/                    # NestJS API
│   └── src/
│       ├── applications/       # Applications CRUD module
│       ├── auth/               # JWT authentication module
│       ├── aws/                # S3 and EventBridge services
│       ├── ai/                 # Gemini AI analysis module
│       ├── config/             # Environment configuration
│       ├── metrics/            # Prometheus metrics module
│       └── main.ts
├── frontend/                   # Angular SPA
│   └── src/app/
│       ├── pages/              # Dashboard, Applications, Login, AI Analyzer
│       ├── services/           # HTTP services
│       ├── guards/             # Auth guard
│       └── models/             # TypeScript interfaces
├── infrastructure/
│   ├── localstack/init/        # AWS resource provisioning scripts
│   └── lambdas/                # Lambda function code
├── k6/                         # Load test scripts
│   ├── smoke-test.js           # Light load test (CI on every push)
│   └── stress-test.js          # Heavy load test (CI on main only)
├── monitoring/
│   └── prometheus.yml          # Prometheus scrape config
├── .github/workflows/          # CI/CD pipeline
└── docker-compose.yml          # Full stack orchestration
```

---

## Future Improvements

- [ ] Deploy to Railway/Render with full CD pipeline
- [ ] Deploy to real AWS (S3, EventBridge, Lambda, RDS Aurora)
- [ ] API versioning (`/api/v1/`)
- [ ] Semantic versioning with conventional commits
- [ ] E2E tests with Playwright
- [ ] CloudWatch logging and alerting
- [ ] WebSocket notifications when Lambda processes status changes
- [ ] Email notifications for follow-up dates
- [ ] Export applications to CSV
- [ ] Save AI analysis results directly as a new application
- [ ] Support multiple CV formats (DOCX, TXT)

---

## License

MIT © [Iskandar Mhadhbi](https://github.com/Iskandar-Mhadhbi/job-tracker)