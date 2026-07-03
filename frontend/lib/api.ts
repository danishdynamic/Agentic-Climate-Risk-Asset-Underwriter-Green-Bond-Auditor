import { HealthStatus
         , AssetSearchQuery, UnderwriteInput, AgentQueryInput, AssetSummary } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";


// --- API Client Implementation ---
export const api = {
  
  // 1. System Health Check
  async getHealthStatus(): Promise<HealthStatus> {
        const res = await fetch(`${API_BASE_URL}/health`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch backend health status");
        return res.json();
      },


  // 2. Ingestion (Multipart/Form-Data)
  // Used for file uploads (PDF/TXT) and asset metadata
  
  async ingestAssetMultipart(formData: FormData) {
        const res = await fetch(`${API_BASE_URL}/api/v1/assets/ingest`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Upload failed");
      }
        return res.json();
      },

  // 3. Semantic Search (JSON)
 async searchAssets(query: AssetSearchQuery) {
        const res = await fetch(`${API_BASE_URL}/api/v1/assets/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(query),
        });

        if (!res.ok) throw new Error("Semantic search execution failed");

        const data = await res.json();
        
        // Return the array directly. 
        // If your backend returns { "results": [...] }, data.results is the array.
        return data.results || []; 
      },

  // 4. Underwriting Audit (JSON)
  // In your api.ts
  async executeUnderwriting(data: UnderwriteInput) {
        const res = await fetch(`${API_BASE_URL}/api/v1/audit/underwrite`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ detail: "Underwriting failed" }));
          throw new Error(errorData.detail);
        }
        
        return res.json();
      },

  // 5. Hedging Strategy (JSON)
  async calculateHedgingStrategy(data: { bond_id: number }) {
        if (!data.bond_id || typeof data.bond_id !== 'number') {
          throw new Error("Invalid input: bond_id must be a number");
        }
        
        const res = await fetch(`${API_BASE_URL}/api/v1/audit/calculate-hedging-strategy`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.detail || "Could not calculate hedging playbook");
        }
        return res.json();
      },

  // 6. Stateful Risk Agent (JSON)
  // non-streaming interactions
  async queryRiskAgent(data: AgentQueryInput) {
        const res = await fetch(`${API_BASE_URL}/api/v1/agent/query`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Agent execution failed");
        return res.json();
      },

  // 7. Inject Audit Results into Agent Memory
  async injectContext(data: { thread_id: string; context: any }) {
        const res = await fetch(`${API_BASE_URL}/api/v1/agent/inject-context`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: "Injection failed" }));
          throw new Error(errorData.message || "Failed to sync audit results");
        }
        
        return res.json();
      },

// 8. Bond Analysis Tool
async analyzeBond(bond_isin: string, credit_rating: string) {
      const res = await fetch(`${API_BASE_URL}/api/v1/agent/analyze-bond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bond_isin, credit_rating
        }),
      });

      if (!res.ok) {
        // Improved error handling to match your other methods
        const errorData = await res.json().catch(() => ({ detail: "Bond analysis failed" }));
        throw new Error(errorData.detail || "Failed to analyze bond");
      }

      return res.json();
    },

  // lib/api.ts
async getAssets(): Promise<AssetSummary[]>{
    const res = await fetch(`${API_BASE_URL}/api/v1/agent/assets`);
    if (!res.ok) throw new Error("Failed to fetch assets");
    const data = await res.json();
    return data.assets; // Expecting { assets: ["ISIN1", "ISIN2"] }
  },


  // Use this for the interactive chat interface
async queryRiskAgentStream(data: AgentQueryInput, onMessage: (msg: any) => void) {
    const res = await fetch(`${API_BASE_URL}/api/v1/agent/query-stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Streaming query failed" }));
        throw new Error(errorData.message || "Failed to stream agent response");
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(line => line.trim() !== "");
        // Parse the JSON chunk sent from the backend
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            onMessage(parsed);
          } catch (e) {
            console.error("Error parsing JSON chunk", e);
          }
        }
      }
    },
    };