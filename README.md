# 🤖 ClimateRiskIQ: Full Stack Agentic AI Risk & Climate Underwriting Platform
An enterprise-grade climate risk intelligence platform for bond underwriting, ESG analysis, portfolio hedging, and AI assisted risk assessment. It leverages advanced multi agent systems, semantic search over complex financial/regulatory structures, and high-performance climate math telemetry.

## 🏗️ Core Workspace Modules

- 📊 Executive Dashboard: Dynamic portfolio health statistics, macro climate risk exposure charts, and real time operational status updates.

- 📂 Document Lifecycle & Ingestion: Streamlined asset ingestion engine supporting dense financial paperwork parsing and automated background metadata tracking.

- 🧠 AI Risk Agent (/agent): Split-pane terminal (70% Conversation Ledger / 30% Parameters panel) utilizing layout math (h-[calc(100vh-80px)]) to prevent display scaling overflow. Supports macro context prompt injection badge actions seamlessly.

- 🔍 Semantic Engine: High density vector similarity querying over financial prospectus chunks, automatically normalizing distances via mathematical inversions (score: 1 - r.distance).

- 📉 Financial Hedging & Underwriting: Reactive state pipelines supporting multi variant risk evaluations mapped dynamically across asynchronous processing cycles (RUNNING, COMPLETED, FAILED).

## 🚀 Tech Stack

### Frontend Architecture

- Framework: Next.js 15 (App Router, Strict Client-Side Validation Modes) + React 19 + TypeScript

- State Management: Zustand (Granular isolated sub-state selectors preventing infinite rendering loop cycles)

- Design Language: Modern institutional dark/light translucent design (bg-background/40 backdrop-blur-sm border-border/40) built with Tailwind CSS & shadcn/ui

### Backend & AI Systems

- API Engine: FastAPI (Python 3.11+) + SQLAlchemy + Pydantic v2

- Orchestration: LangGraph & LangChain (Multi Agent state trees and workflow topologies)

- LLM Engine: Google Gemini Pro Models via native semantic interfaces

## Database & Knowledge Store: PostgreSQL supplemented with the pgvector extension

- 📁 Repository Structure
  
```Bash
root-workspace/
├── frontend/                          # Client-Side Next.js Application
│   ├── app/                           # App Router paths & view definitions (dashboard, agent, etc.)
│   ├── components/                    # Modular UI atoms, layouts (Topbar, Sidebar), and chat windows
│   ├── hooks/                         # Split-selector state subscription layer (useAgent, useSearch)
│   ├── lib/                           # Central Zustand store slices, API drivers, and TypeScript types
│   └── package.json                   # Frontend metadata & node packages
│
├── backend/                           # Server-Side FastAPI Microservices
│   ├── app/                           # Core workspace module packages
│   │   ├── api/                       # API Route endpoints & routers (chat, hedge, audit)
│   │   ├── core/                      # System configuration, security middleware, and dependencies
│   │   ├── models/                    # Pydantic validation contracts & database schemas
│   │   └── services/                  # Vector engines, LangGraph state charts, & math optimizers
│   ├── main.py                        # Server lifecycle initialization & middleware entrypoint
│   └── requirements.txt               # Backend Python dependencies
│
└── docker/                            # Database Infrastructure Context
    └── init.sql                       # DDL/DML script executing schemas & vector indices
```

### Data Orchestration Topology

```
[ frontend/components/ ]  ──(User Actions)──>  [ frontend/hooks/ ]
                                                      │
                                           (Zustand State Read/Write)
                                                      ▼
[ backend/api/ ]    <──(Network HTTP)───  [ frontend/lib/store.ts ]
       │
(Pydantic Schema Validation)
       ▼
[ backend/services/ ] ──(Runs Analytics) ─> [ Returns response payload ]

```

## 🛠️ Getting Started

Follow these steps in exact sequential order to launch the end to end institutional platform locally.

### 📋 Prerequisites

Ensure the following packages are globally available on your terminal:

- Docker & Docker Compose

- Node.js (v18.0 or newer)

- Python (v3.11 or newer)

### 🏛️ Step 1: Initialize Database & Vector Layer via Docker

The application uses PostgreSQL with the pgvector extension. The database schema and initial data are automatically injected using an init.sql script upon initialization.

1. Ensure your init.sql file is properly mounted inside your database container profile setup.

2. Fire up the backend storage layer container detached:

``` Bash
docker compose up -d
```

3. Check execution logs to verify that init.sql correctly provisioned the table structures and embedded vector configurations:

``` Bash
docker compose logs -f db
```

### 🐍 Step 2: Establish Backend Services (FastAPI)

1. Drop directly into the server directory:

``` Bash
cd backend
```

2. Spawn a cleanly isolated python virtual environment:

```Bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

```

3. Upgrade packages and install requirements:

```Bash
pip install --upgrade pip
pip install -r requirements.txt
```

4. Create a .env parameters file inside the backend/ path mapping database credentials and your Gemini API Key:

```Bash
Code snippet
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/climate_risk
GEMINI_API_KEY=your_gemini_api_key_here
```
1. Spin up the localized runtime process i.e backend FastAPI server:

```Bash
cd ../backend
uvicorn main:app --reload 
```
- Live API Server will listen on: http://localhost:8000

- Swagger Documentation is dynamically generated at: http://localhost:8000/docs

### ⚛️ Step 3: Run Client Application (Next.js)

1. Pivot smoothly over into the UI node repository directory:

```Bash
cd ../frontend
```
2. Pull down dependencies cleanly:

```Bash
npm install
```

3. Start up the server listening on local client proxies:

```Bash
npm run dev
```
- The platform dashboard can be instantly mounted over at: http://localhost:3000

## 🔍 Pre-Flight Infrastructure Checklist
Before running operations, double check that your platform parameters are aligned:

- [ ] Docker Service Container: Active, isolating postgres holding valid vector indices.

- [ ] Schema State Verification: init.sql ran successfully with zero compilation crashes.

- [ ] FastAPI Core Engine: Listening actively at port 8000.

- [ ] LLM Secret Binding: Verified and validated GEMINI_API_KEY mapping inside local environmental variables.

- [ ] Next.js Engine: Compiling layout hooks flawlessly on port 3000.

## 📄 License

This repository is maintained for corporate proof-of-concept, educational validation, and demonstration purposes. All rights reserved.