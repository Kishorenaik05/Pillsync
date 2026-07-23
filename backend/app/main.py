from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, profiles, medicines, reminders

app = FastAPI(title="PillSync API", version="1.0.0")

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

@app.get("/")
def read_root():
    return {"message": "Welcome to the PillSync API"}
