Project Improvement & Documentation Roadmap

This document outlines the architectural specifications, testing requirements, database relationships, and documentation standards for the Green Bond Climate Risk Analysis and Hedging platform. It serves as both a reference for the existing system design and a checklist for outstanding engineering improvements.

1. Target Folder Structure
   
To clean up the workspace and separate concerns effectively, the codebase should be reorganized into the following standardized layout:

```Bash
├── frontend/
│   ├── components/
│   │   └── dashboard/
│   ├── services/
│   └── store/
│
├── backend/
│   ├── routers/
│   ├── services/
│   └── tools/
│
└── docs/
    ├── architecture/
    │   ├── architecture_diagram.drawio
    │   └── architecture.png
    ├── database/
    │   ├── er_diagram.drawio
    │   └── er_diagram.png
    ├── api/
    │   ├── openapi.yaml
    │   └── endpoints.md
    ├── sequence/
    │   ├── ingestion_sequence.drawio
    │   ├── risk_analysis_sequence.drawio
    │   └── hedging_sequence.drawio
    ├── deployment/
    │   ├── docker.md
    │   └── postgres.md
    ├── screenshots/
    └── README.md
```

2. Testing Framework Strategy
   
To ensure system stability, mathematical accuracy in risk evaluation, and resilient data processing pipelines, the following suite of tests must be fully implemented.

⬜ Unit Tests

Focus on deterministic functions, edge cases, and compliance logic within individual modules.tools/risk.py: Validate hazard calculation logic, carbon tax exposure formulas, and geographical climate vulnerability scores.tools/actuarial.py: Verify cash flow discounting, expected loss calculations, and probability-of-default modeling under stress scenarios.tools/compliance.py: Test green bond framework alignment checks (e.g., EU Taxonomy, ICMA Green Bond Principles).

⬜ Service Tests
Focus on business logic layer isolation using mocked database and LLM dependencies.services/risk_engine.py: Mock data retrievers to test how the engine aggregates climate, market, and transition risks into a unified portfolio risk profile.

⬜ Integration TestsFocus on end-to-end reliability across multiple components and boundaries.Ingestion Pipeline: Test the complete flow from uploading a raw green bond PDF/document, chunking, generating vector embeddings via Gemini, storing vectors in pgvector, and confirming data persistence.3. System Architecture & Component FlowThe platform utilizes an agentic RAG workflow to parse bond data, assess multi-layered risk profiles, and suggest automated hedging strategies.Plaintext

```Bash
┌────────────────┐
│    Frontend    │
└───────┬────────┘
        │ HTTP / WebSockets
        ▼
┌────────────────┐
│    FastAPI     │
└───────┬────────┘
        │ Orchestrates business logic
        ▼
┌────────────────────────────────────────────────────────┐
│                        Services                        │
│ ┌──────────────┐ ┌──────────────┐ ┌─────────┐ ┌────────┐ │
│ │ Risk Engine  │ │Hedging Engine│ │Retriever│ │Ingestion││
│ └──────────────┘ └──────────────┘ └─────────┘ └────────┘ │
└───────┬────────────────────────────────────────────────┘
        │ Reads / Writes Persistent Data
        ▼
┌────────────────┐
│   PostgreSQL   │
└───────┬────────┘
        │ Native vector extensions
        ▼
┌────────────────┐
│   pgvector     │
└───────┬────────┘
        │ Context injection & Embeddings
        ▼
┌────────────────┐
│     Gemini     │
└───────┬────────┘
        │ LLM Intelligence Layer
        ▼
┌───────────────────────┐
│  LangGraph Agent      │
│  (Decision Execution) │
└───────────────────────┘
```

1. Database Schema & Entities (ERD Roadmap)The core domain model revolves around the Bond entity. For an optimal improvement phase, the relational schema must enforce strict data isolation between different risk categories.Schema Relationships: Each individual Bond acts as the root object, linking one-to-one or one-to-many with granular operational metrics.Plaintext
   
```Bash
                 ┌───────────────────────┐
                 │  ClimateRiskProfile   │
                 └──────────┬────────────┘
                            │ 1:1
                 ┌──────────┴────────────┐
                 │   MarketRiskProfile   │
                 └──────────┬────────────┘
                            │ 1:1
                 ┌──────────┴────────────┐
                 │ TransitionRiskProfile │
                 └──────────┬────────────┘
                            │ 1:1
┌──────────┐     ┌──────────┴────────────┐
│   Bond   ├────►│      RiskProfile      │
└────┬─────┘     └───────────────────────┘
     │
     ├──────────►┌───────────────────────┐
     │ 1:N       │      HedgeOption      │
     │           └───────────────────────┘
     ├──────────►┌───────────────────────┐
     │ 1:N       │    AssetValuation     │
     │           └───────────────────────┘
     └──────────►┌───────────────────────┐
       1:N       │      AssetChunk       │
                 └───────────────────────┘

```

1. System Sequence Diagrams
   Pipeline A: Asset Ingestion Flow
   Triggers when a new green bond document is uploaded to the system.

```Bash
User     Frontend      Router     IngestionService    Embedding      Postgres
 │          │            │               │                │             │
 ├─Upload──►│            │               │                │             │
 │          ├─POST──────►│               │                │             │
 │          │ /ingest    ├─Process──────►│                │             │
 │          │            │  Document     ├─Vectorize─────►│             │
 │          │            │               │  Text Chunks   ├─Save Vects─►│
 │          │            │               │◄─Confirm───────┤             │
 │          │◄─200 OK────┼◄─JSON Res─────┤                              │
 │◄─Success─┤            │               │                              │

```

Pipeline B: Interactive Agent Analysis & Hedging Flow

Triggers when a user interacts with the system's conversational analysis interface.
```Bash
User      Chat UI    LangGraphAgent     Tools      BondAnalysis    Risk/Hedge    Database
 │           │             │              │             │          Engines          │
 ├─Query────►│             │              │             │             │             │
 │           ├─Invoke─────►│              │             │             │             │
 │           │             ├─Call────────►│             │             │             │
 │           │             │ Tool         ├─Execute────►│             │             │
 │           │             │              │             ├─Compute────►│             │
 │           │             │              │             │  Metrics    ├─Query──────►│
 │           │             │              │             │             ◄─Data────────┤
 │           │             │              │             ◄─Return Risk─┤             │
 │           │             │◄─Return Data─┼◄────────────┤                           │
 │           │◄─Gen Text───┤              │                                         │
 │◄─Display──┤             │              │                                         │
```
1. API Documentation Blueprint
   
   To complete the docs/api/ target deliverables, detailed OpenApi specs or markdown mappings must be written for all routes using the format below.
   
   POST /assets/ingest
   
   Purpose: Asynchronously uploads, chunks, generates vector embeddings for, and indexes a green bond prospectus.
   Content-Type: multipart/form-data
   Request Payload
   
   Field         Type    Required    Description
   file          Binary    Yes       The PDF or text document of the green bond prospectus.
   portfolio_id  String    No        Target portfolio UUID to associate with this bond asset.
   
   
   Expected Response (202 Accepted / 200 OK)

   ```Bash
   JSON{
  "status": "success",
  "bond_id": "b3f892a4-110d-4e2b-ba23-93ad21e87f19",
  "chunks_processed": 142,
  "timestamp": "2026-07-12T01:00:00"}
  ```

Remaining API Implementation Checklist
The following endpoints must be documented in docs/api/endpoints.md explicitly mapping out their request payloads, error types (400, 422, 500), and semantic responses:
GET /assets/{bond_id} — Retrieve structural details and chunk metadata for an ingested asset.
GET /risk/report/{bond_id} — Fetch compiled calculations from the risk engine.
POST /hedging/simulate — Evaluate portfolio performance against theoretical hedge scenarios.
POST /agent/chat — Open stateful processing loop with the LangGraph orchestrator.
