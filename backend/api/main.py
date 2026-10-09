"""FastAPI Application for ASTRAL Rover Mission Control.

Exposes REST endpoints including health check and grid telemetry.
"""

from datetime import datetime, timezone
import sys
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure backend root is on Python sys.path so 'engine' can be imported cleanly
BACKEND_ROOT = Path(__file__).resolve().parent.parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from engine.grid import PlanetaryGrid
from engine.rover import Rover

app = FastAPI(
    title="ASTRAL Mission Control API",
    description="Backend service for ASTRAL — Lost in Space: Rover Mission Control",
    version="0.1.0",
)

# Configure CORS for local development with Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    """Root landing endpoint with service metadata."""
    return {
        "service": "ASTRAL Mission Control Backend",
        "status": "operational",
        "docs_url": "/docs",
        "health_check": "/health",
    }


@app.get("/health")
def health_check():
    """Minimal health endpoint required for system telemetry."""
    return {
        "status": "ok",
        "service": "ASTRAL Rover Mission Control",
        "version": "0.1.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/api/mission/initial-state")
def get_initial_mission_state():
    """Provides a sample initial planetary grid and rover setup from the simulation engine."""
    grid = PlanetaryGrid(width=10, height=10)

    # Place representative obstacles (craters / rock formations)
    obstacles = [(2, 2), (2, 3), (5, 5), (6, 5), (7, 1), (3, 7), (8, 8)]
    for x, y in obstacles:
        grid.add_obstacle(x, y)

    # Place scientific data collection sites
    sci_sites = [(4, 2), (8, 4), (1, 8)]
    for x, y in sci_sites:
        grid.add_scientific_site(x, y)

    # Place long-range communication relay zones
    comm_zones = [(0, 9), (9, 0)]
    for x, y in comm_zones:
        grid.add_comm_zone(x, y)

    # Initialize rover at starting position
    rover = Rover(rover_id="ASTRAL-1", start_x=1, start_y=1, heading="E")

    return {
        "grid": grid.to_dict(),
        "rover": rover.to_dict(),
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("api.main:app", host="127.0.0.1", port=8000, reload=True)
