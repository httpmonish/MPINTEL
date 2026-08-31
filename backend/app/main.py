import sys
import os

# Ensure app and backend directories are in PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from routers import projects, intelligence

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "Pratyaksh — AI-Powered MPLADS Monitoring & Verification Intelligence Layer. "
        "Operates on top of eSAKSHI to detect, verify, explain, prioritize, act, and learn. "
        "Maintains strict vocabulary boundaries (Risk Score != Verification Confidence; Anomaly != Fraud)."
    )
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(projects.router, prefix=settings.API_V1_STR)
app.include_router(intelligence.router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Health Check"])
def root_health_check():
    return {
        "status": "HEALTHY",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs",
        "pipeline": "DETECT -> VERIFY -> EXPLAIN -> PRIORITIZE -> ACT -> LEARN"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
