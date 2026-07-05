# 🤖 Agentic AI Risk Agent & Climate Underwriting Terminal

An enterprise-grade climate risk intelligence platform for bond underwriting, ESG analysis, portfolio hedging, and AI-assisted risk assessment.



## 🏗️ Features

* Dashboard with portfolio statistics
* Asset ingestion and document upload
* Semantic search over bond documents
* AI-powered underwriting workflow
* Climate risk analytics
* Portfolio hedging strategy generation
* AI Risk Agent (chat interface)
* System health monitoring
* Responsive enterprise UI

## 🚀 Tech Stack

### Key Architectural Fixes (MVP Stable)
* **Granular Selectors (Option A):** All custom hooks (`useAgent`, `useDashboard`, `useSearch`, etc.) and structural scaffolding layouts (`Topbar`, `Sidebar`) utilize isolated selector paths. This eliminates object-literal mutation cycles, ensuring a strict `===` primitive equality check that avoids infinite React rendering loops (`Maximum update depth exceeded`).
* **Shared Input Control Context:** Interrogator prompt badges map cleanly to the central Zustand store context slice (`agentInputValue`), allowing macro prompt injection templates to populate interface form parameters instantly across decoupled UI modules.


### Core Workspace Modules

### 1. AI Risk Agent (`/agent`)
An interactive terminal utilizing a dynamic split-pane grid layout (**70% Conversation Ledger / 30% Parameters panel**) featuring responsive layout math (`h-[calc(100vh-80px)]`) to ensure optimal viewing across various corporate displays. Includes pre-compiled prompt frameworks built directly into the UI state loop:
* **Climate VaR Exposure** & **Physical Asset Exposure** metrics.
* **Generate Hedge Strategy** & **Explain ESG Score** pipelines matching analytical python routes.

### 2. Analytical Custom Hooks
* `useAgent` — Coordinates message chronological array states and streams natural language queries.
* `useSearch` — Executes dense vector similarity queries against historical document chunks, normalizing weights automatically via distances metrics (`score: 1 - r.distance`).
* `useBondAnalysis` — Evaluates corporate security risk indicators against input parameter signatures (`isin`, `creditRating`).
* `useHedging` & `useUnderwriting` — Dispatches transactional parameter packets to target optimization engines and updates structural workflow statuses (`RUNNING`, `COMPLETED`, `FAILED`).

---

## 🛠️ Technology Stack

* **Framework:** Next.js (App Router, Client-Side Validation Modes)
* **State Management:** Zustand (Granular Sub-State Subscriptions)
* **Styling & Components:** Tailwind CSS, Radix UI Primitives, shadcn/ui
* **Design Pattern:** Modern Institutional dark/light transparency (`bg-background/40 backdrop-blur-sm border-border/40`)


### Frontend

* Next.js 15
* React 19
* TypeScript
* Tailwind CSS
* shadcn/ui
* Zustand
* Lucide Icons
* Sonner

### Backend

* FastAPI
* PostgreSQL
* Vector Database
* Google Gemini
* LangChain , Langraph

## Project Structure

```
root-workspace/
│
├── frontend/                          # Client-Side Next.js Application
│   ├── app/                           # Routing layer & workspace domain views (Dashboard, Agent)
│   ├── components/                    # Modular terminal interfaces & layout wrappers (Topbar, Sidebar)
│   ├── hooks/                         # Split-selector data orchestration layer (useAgent, useSearch)
│   ├── lib/                           # State store (Zustand), API client drivers, and strict types
│   └── package.json                   # Frontend npm dependency configuration
│
└── backend/                           # Server-Side FastAPI Microservices (Python)
    ├── app/                           # Core application backend package
    │   ├── api/                       # API Route controllers / endpoints (chat, hedge, audit)
    │   ├── core/                      # System configurations, security protocols, and dependencies
    │   ├── models/                    # Pydantic data schemas / validation contracts
    │   ├── services/                  # Business logic layer (Vector search engines, math optimizers)
    │   └── main.py                    # Server initialization & middleware orchestration entrypoint
    ├── requirements.txt               # Backend Python package dependency manifest
    └── .env                           # Server environment variable repository
```

### Structural Flow Across Directories


```
[ frontend/components/ ]  ──(User Actions)──>  [ frontend/hooks/ ]
                                                      │
                                           (Zustand State Read/Write)
                                                      ▼
[ backend/api/ ]          <──(Network HTTP)───  [ frontend/lib/store.ts ]
       │
(Pydantic Schema Validation)
       ▼
[ backend/services/ ]     ──(Runs Analytics)─>  [ Returns response payload ]

```

---


## Getting Started

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

The application will be available at:

```
http://localhost:3000
```

## Backend

The frontend expects the backend API to be running.

Example:

```
http://localhost:8000
```

Ensure the backend services and database are running before testing:

* API
* PostgreSQL
* Vector Store
* Gemini API

## Application Modules

* Dashboard
* Asset Management
* Semantic Search
* Underwriting
* Analytics
* Portfolio Hedging
* AI Risk Agent
* Settings

## Current Status

### Completed

* Responsive UI
* Component architecture
* Zustand state management
* Custom hooks
* Routing
* Layout system
* Loading and error states

### Next Steps

* Backend integration
* API testing
* Database validation
* End-to-end testing
* Production deployment

## License

For educational and demonstration purposes.
