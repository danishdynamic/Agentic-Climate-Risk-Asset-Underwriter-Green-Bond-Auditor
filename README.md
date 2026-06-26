## 🌲 Project 1 (LangChain): The Climate Risk Asset Underwriter & Green Bond Auditor
Domain: Green Finance & Insurance Risk

Core Concept: An enterprise system that evaluates a corporate real estate or infrastructure portfolio to predict physical climate risk (floods, wildfires, sea-level rise) and transition risk (carbon taxes), generating an insurance risk premium index and auditing the asset's eligibility for Green Bond financing.

---

### 🧠 The LangChain Architecture

This project helps to master LCEL (LangChain Expression Language), custom tool tooling, and dynamic query filtering.

[User Portfolio Query] ──> Self-Query Retriever ──> Metadata Filter (Postgres)
                                 │
                                 ▼
                         Tool-Calling Agent ──> Custom Insurance Math Tool
                                 │
                                 ▼
                         LCEL Output Parser ──> Underwriting Report