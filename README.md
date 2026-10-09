# ASTRAL — Lost in Space: Rover Mission Control

A 24-hour hackathon mission control center for autonomous planetary surface rover operations.

---

## 🛰️ Architecture & Tech Stack

The system is organized into modular layers with clean separation of concerns:

- **Simulation Engine (`backend/engine/`)**: Pure Python standard library package modeling the 10×10 planetary surface grid, coordinate bounds, cell types, and rover states. Completely decoupled from FastAPI and web frameworks.
- **Backend API (`backend/api/`)**: FastAPI service with CORS middleware, health telemetry endpoint (`/health`), and simulation state bridge (`/api/mission/initial-state`).
- **Mission Control Frontend (`frontend/`)**: React 19 + TypeScript + Vite dashboard featuring an HTML5 Canvas rendering engine for the 10×10 planetary surface grid, interactive sector scanner, rover telemetry HUD, and live FastAPI health indicator.

---

## 🗂️ Project Structure

```text
astral-rover/
├── backend/
│   ├── engine/                     # Independent Simulation Engine
│   │   ├── __init__.py
│   │   ├── grid.py                 # PlanetaryGrid, CellType, Coordinate
│   │   └── rover.py                # Rover, RoverState
│   ├── api/                        # FastAPI Web Layer
│   │   ├── __init__.py
│   │   └── main.py                 # FastAPI app, /health, /api/mission/initial-state
│   ├── tests/                      # Automated Test Suite
│   │   ├── __init__.py
│   │   ├── test_engine.py          # Unit tests for simulation engine
│   │   └── test_health.py          # Integration tests for FastAPI endpoints
│   ├── requirements.txt            # Python dependencies
│   └── venv/                       # Backend Virtual Environment
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── PlanetaryGrid.tsx   # HTML Canvas 10×10 surface grid renderer
│   │   │   └── BackendHealthIndicator.tsx # FastAPI health & sync card
│   │   ├── types/
│   │   │   └── mission.ts          # Shared TypeScript domain interfaces
│   │   ├── App.tsx                 # Mission Control HUD & dashboard layout
│   │   ├── App.css                 # Dark space mission styling
│   │   ├── index.css               # Base CSS reset & variables
│   │   └── main.tsx                # React application entry point
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
└── README.md                       # Team guide & instructions
```

---

## ⚙️ Environment Prerequisites & Dependencies

During initial environment inspection, the following tools were detected:
- **Python**: `3.14.7` (Compatible with Python 3.10+)
- **Node.js**: `v24.19.0`
- **npm**: `11.17.0`

> **Note for Windows PowerShell Users**: If running `npm` produces an execution policy script error (`PSSecurityException`), run `cmd /c npm <command>` or `npm.cmd <command>`.

---

## 🚀 Running the Applications

### 1. Python Backend & Engine

Open a terminal in the project directory:

```powershell
# Navigate to the backend directory
cd backend

# Create virtual environment (if not already created)
python -m venv venv

# Activate virtual environment (Windows PowerShell)
.\venv\Scripts\Activate.ps1
# (Or in Command Prompt: .\venv\Scripts\activate.bat)

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server with auto-reload
uvicorn api.main:app --host 127.0.0.1 --port 8000 --reload
```

- **Health check URL**: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)
- **Interactive Swagger Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Run automated test suite**:
  ```powershell
  pytest tests
  ```

---

### 2. React + Vite Frontend

Open a second terminal in the project directory:

```powershell
# Navigate to the frontend directory
cd frontend

# Install npm packages
cmd /c npm install

# Start Vite development server
cmd /c npm run dev
```

- **Frontend URL**: [http://127.0.0.1:5173/](http://127.0.0.1:5173/)
- **Production Build Check**:
  ```powershell
  cmd /c npm run build
  ```

---

## 🧪 Verification & Acceptance Checklist

1. **FastAPI Health Endpoint**:
   - Access `http://127.0.0.1:8000/health` in your browser or with curl:
     ```json
     {
       "status": "ok",
       "service": "ASTRAL Rover Mission Control",
       "version": "0.1.0",
       "timestamp": "..."
     }
     ```
2. **10×10 Planetary Grid (HTML Canvas)**:
   - Visible on `http://127.0.0.1:5173/`.
   - Rover `ASTRAL-1` is rendered with yellow chassis and heading orientation at `(1, 1)`.
   - Hazardous obstacles are rendered as red/slate boulders at `(2, 2)`, `(2, 3)`, `(5, 5)`, `(6, 5)`, `(7, 1)`, `(3, 7)`, `(8, 8)`.
   - Scientific Data Sites are rendered as glowing emerald crystals at `(4, 2)`, `(8, 4)`, `(1, 8)`.
   - Communication Relay Zones are rendered as cyan signal dishes at `(0, 9)` and `(9, 0)`.
3. **Interactive HUD & Sector Scanner**:
   - Hovering over any cell reveals live coordinates `(X, Y)` and geological scan details.
4. **Backend Telemetry Link**:
   - The HUD sidebar displays **FASTAPI ONLINE** in green when the backend is running.
   - Clicking **PING HEALTH** queries the backend and updates the live timestamp.
   - Clicking **Sync Mission State from Backend** populates the grid directly from the simulation engine.
