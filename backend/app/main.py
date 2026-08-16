from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os
from app.api import auth, profiles, medicines, reminders, analytics, refills, profile, notifications
from app.core.email_scheduler import start_email_scheduler

_scheduler = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global _scheduler
    _scheduler = start_email_scheduler()
    yield
    if _scheduler:
        _scheduler.shutdown(wait=False)

app = FastAPI(title="PillSync API", version="1.0.0", lifespan=lifespan)

# Serve uploaded avatar images
os.makedirs("uploads/avatars", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(profiles.router, prefix="/profiles", tags=["profiles"])
app.include_router(medicines.router, prefix="/medicines", tags=["medicines"])
app.include_router(reminders.router, prefix="/reminders", tags=["reminders"])
app.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
app.include_router(refills.router, prefix="/refills", tags=["refills"])
app.include_router(profile.router, prefix="/profile", tags=["profile"])
app.include_router(notifications.router, prefix="/notifications", tags=["notifications"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the PillSync API"}
