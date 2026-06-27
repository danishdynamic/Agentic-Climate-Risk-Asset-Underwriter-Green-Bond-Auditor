import time
import asyncio
from fastapi import HTTPException, status
import logging

from app.config import settings

logger = logging.getLogger("risk_backend.quota")

class QuotaManager:
    def __init__(self):
        # Tracking states for the active 60-second sliding windows
        self.request_timestamps: list[float] = []
        self.token_log: list[tuple[float, int]] = []  # Stores (timestamp, token_count)
        
        # Async lock ensures concurrent requests evaluate the windows sequentially
        self.lock = asyncio.Lock()

    async def acquire_quota(self, estimated_tokens: int) -> None:
        """
        Evaluates current sliding-window load against Gemini limits.
        Raises an HTTP 429 if processing the request would breach constraints.
        """
        async with self.lock:
            now = time.time()
            window_boundary = now - 60.0

            # 1. Prune outdated tracking telemetry outside the 60s window
            self.request_timestamps = [t for t in self.request_timestamps if t > window_boundary]
            self.token_log = [entry for entry in self.token_log if entry[0] > window_boundary]

            # 2. Evaluate Request Per Minute (RPM) limits
            current_rpm = len(self.request_timestamps)
            if current_rpm >= settings.GEMINI_MAX_RPM:
                logger.warning(f"RPM limit triggered. Current: {current_rpm}/{settings.GEMINI_MAX_RPM}")
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Gemini API rate ceiling reached ({settings.GEMINI_MAX_RPM} RPM). Please retry in a few seconds."
                )

            # 3. Evaluate Token Per Minute (TPM) limits
            current_tpm_allocated = sum(entry[1] for entry in self.token_log)
            if current_tpm_allocated + estimated_tokens > settings.GEMINI_PEAK_TPM_INPUT:
                logger.warning(
                    f"TPM boundary surge blocked. Present: {current_tpm_allocated}, Requested: {estimated_tokens}, "
                    f"Ceiling: {settings.GEMINI_PEAK_TPM_INPUT}"
                )
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=(
                        f"Token bandwidth capacity exceeded. Current window consumption is at {current_tpm_allocated} tokens. "
                        f"Adding {estimated_tokens} tokens drops outside the safe model target of {settings.GEMINI_PEAK_TPM_INPUT} TPM."
                    )
                )

            # 4. Commit verified allocation into tracking state
            self.request_timestamps.append(now)
            self.token_log.append((now, estimated_tokens))
            
            logger.info(
                f"Quota cleared. Window metrics -> RPM: {len(self.request_timestamps)}/{settings.GEMINI_MAX_RPM} | "
                f"TPM: {current_tpm_allocated + estimated_tokens}/{settings.GEMINI_PEAK_TPM_INPUT}"
            )

# Instantiate a single application-wide tracker
quota_manager = QuotaManager()