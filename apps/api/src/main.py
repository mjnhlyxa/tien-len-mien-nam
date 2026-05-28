from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.routers import rooms, games

app = FastAPI(title="Tiến Lên Miền Nam API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(rooms.router, prefix="/api/rooms", tags=["rooms"])
app.include_router(games.router, prefix="/api/games", tags=["games"])

@app.get("/")
async def root():
    return {"status": "ok", "message": "Tiến Lên Miền Nam API"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
