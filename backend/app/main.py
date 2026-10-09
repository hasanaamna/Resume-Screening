from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.routes.screen import router as screen_router
from backend.app.services.database import initialize_database
from backend.app.routes.candidates import router as candidates_router

initialize_database()

app = FastAPI(
    title="AI Resume Screening API",
    description=(
        "AI-powered resume screening system "
        "that evaluates candidates against job descriptions."
    ),
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(screen_router)

app.include_router(candidates_router)


@app.get("/")
def root():
    return {
        "message": "AI Resume Screening API is running",
        "version": "1.0.0"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }   