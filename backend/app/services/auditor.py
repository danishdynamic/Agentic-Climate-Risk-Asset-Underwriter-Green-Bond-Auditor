import json
import logging
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from google import genai
from google.genai import types

from app.config import settings
from app.services.quota_manager import quota_manager
from app.services.retriever import retriever_service

logger = logging.getLogger("risk_backend.auditor")

class AuditorService:
    def __init__(self):
        self.ai_client = genai.Client(api_key=settings.GOOGLE_API_KEY.get_secret_value())
        self.generation_model = settings.GEMINI_MODEL_ID

    async def execute_underwriting_audit(
        self, db: AsyncSession, bond_isin: str, user_instruction: str
    ) -> Dict[str, Any]:
        """
        Coordinates context retrieval, runs the initial credit/climate audit compilation,
        and enforces a secondary anti-hallucination validation loop.
        """
        logger.info(f"Initiating comprehensive underwriting audit for ISIN: {bond_isin}")

        # 1. Retrieve High-Relevance Context Chunks from the HNSW Vector Index
        retrieved_records = await retriever_service.retrieve_relevant_chunks(
            db=db, user_query=f"ISIN {bond_isin} {user_instruction}", limit=4
        )
        
        # Consolidate retrieved knowledge fragments into a single text block
        context_corpus = "\n---\n".join([
            f"Source Document [{r['isin']} - {r['asset_name']}]: {r['chunk_content']}" 
            for r in retrieved_records
        ])

        # 2. Construct the Initial Drafting Prompt
        draft_prompt = f"""
        You are an expert institutional green bond compliance auditor. 
        Analyze the provided asset context data and compile a detailed climate risk audit evaluation.

        Retrieved Fact Context:
        {context_corpus}

        Underwriting Core Instruction:
        {user_instruction}

        Compile your findings into a rigorous review. Provide a valid JSON response containing exactly:
        {{
            "audit_justification": "Granular climate and financial compliance review text",
            "detected_vulnerabilities": ["List of explicitly documented risks found in source files"]
        }}
        """

        # Enforce rate-throttling allocation rules
        await quota_manager.acquire_quota(estimated_tokens=len(draft_prompt) // 4)
        
        # 3. Generate the Raw Audit Draft
        try:
            draft_response = self.ai_client.models.generate_content(
                model=self.generation_model,
                contents=draft_prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.2
                )
            )
            draft_payload = json.loads(draft_response.text or "{}")
            logger.info("Initial audit payload draft completed. Routing to verification loop.")
            
        except Exception as e:
            logger.error(f"Audit generation stage fatal exception: {str(e)}")
            raise e

        # ====================================================================
        # 4. ANTI-HALLUCINATION SELF-REFLECTION LOOP
        # ====================================================================
        verification_prompt = f"""
        You are an adversarial risk compliance validation gatekeeper. Your job is to verify 
        that an AI-generated audit statement is 100% truthful, accurate, and completely grounded 
        in the provided raw source text.

        Raw Ground-Truth Source Text:
        {context_corpus}

        Proposed AI Draft Underwriting Justification:
        {draft_payload.get('audit_justification')}

        CRITICAL ASSIGNMENT:
        Cross-check every metric, hazard score, and factual claim made in the Proposed Draft 
        against the Raw Ground-Truth Source Text.
        - If any claim, metric, or liability in the draft is NOT explicitly supported by the source text, PRUNE or REWRITE it.
        - Fix any ungrounded assumptions or calculations.
        - Do not introduce outside knowledge or unverified market figures.

        Output your verified, truth-checked findings matching this JSON structure exactly:
        {{
            "verified_audit_justification": "Cleaned, verified, fully-grounded justification text",
            "detected_vulnerabilities": {json.dumps(draft_payload.get('detected_vulnerabilities', []))},
            "contains_hallucinations_corrected": true/false
        }}
        """

        # Execute quota billing checks for verification pass
        await quota_manager.acquire_quota(estimated_tokens=len(verification_prompt) // 4)

        try:
            verified_response = self.ai_client.models.generate_content(
                model=self.generation_model,
                contents=verification_prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.0  # Force maximum deterministic alignment
                )
            )
            
            final_output = json.loads(verified_response.text or "{}")
            logger.info(f"Self-reflection pass complete. Hallucinations corrected: {final_output.get('contains_hallucinations_corrected')}")
            return final_output

        except Exception as e:
            logger.error(f"Anti-hallucination verification module failed: {str(e)}")
            # Fall back to the original draft only if verification network drops, but tag it as unverified
            draft_payload["contains_hallucinations_corrected"] = False
            draft_payload["verification_status"] = "BYPASSED_DUE_TO_ERROR"
            return draft_payload

auditor_service = AuditorService()