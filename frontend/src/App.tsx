import { useState } from 'react';
import './App.css';
import { PlanetaryGrid } from './components/PlanetaryGrid';
import { BackendHealthIndicator } from './components/BackendHealthIndicator';
import type { Position, RoverData } from './types/mission';

// Default initial state conforming to the simulation engine layout
const INITIAL_OBSTACLES: Position[] = [
  { x: 2, y: 2 },
  { x: 2, y: 3 },
  { x: 5, y: 5 },
  { x: 6, y: 5 },
  { x: 7, y: 1 },
  { x: 3, y: 7 },
  { x: 8, y: 8 },
];

const INITIAL_SCIENTIFIC_SITES: Position[] = [
  { x: 4, y: 2 },
  { x: 8, y: 4 },
  { x: 1, y: 8 },
];

const INITIAL_COMM_ZONES: Position[] = [
  { x: 0, y: 9 },
  { x: 9, y: 0 },
];

const INITIAL_ROVER: RoverData = {
  id: 'ASTRAL-1',
  x: 1,
  y: 1,
  heading: 'E',
  battery: 100,
  status: 'ONLINE / READY',
};

export function App() {
  const [obstacles, setObstacles] = useState<Position[]>(INITIAL_OBSTACLES);
  const [scientificSites, setScientificSites] = useState<Position[]>(INITIAL_SCIENTIFIC_SITES);
  const [commZones, setCommZones] = useState<Position[]>(INITIAL_COMM_ZONES);
  const [rover, setRover] = useState<RoverData>(INITIAL_ROVER);
  const [hoveredCell, setHoveredCell] = useState<Position | null>(null);

  const getCellDescription = (pos: Position | null): string => {
    if (!pos) return 'Hover cursor over any grid sector to inspect coordinates.';
    if (rover.x === pos.x && rover.y === pos.y) {
      return `Rover (${rover.id}) Active Unit [Heading: ${rover.heading}, Battery: ${rover.battery}%]`;
    }
    if (obstacles.some((o) => o.x === pos.x && o.y === pos.y)) {
      return 'Hazardous Obstacle (Unpassable terrain / Martian crater boulders)';
    }
    if (scientificSites.some((s) => s.x === pos.x && s.y === pos.y)) {
      return 'Scientific Data Site (High-value geological / bio-signature sample location)';
    }
    if (commZones.some((c) => c.x === pos.x && c.y === pos.y)) {
      return 'Communication Relay Zone (Optimal line-of-sight satellite transmitter)';
    }
    return 'Traversable Regolith Surface (Empty planetary sector)';
  };

  const handleSyncTelemetry = (data: unknown) => {
    try {
      const payload = data as {
        grid: {
          obstacles: Position[];
          scientific_sites: Position[];
          comm_zones: Position[];
        };
        rover: {
          rover_id: string;
          x: number;
          y: number;
          heading: 'N' | 'E' | 'S' | 'W';
          battery_percent: number;
          status: string;
        };
      };

      if (payload.grid && payload.rover) {
        setObstacles(payload.grid.obstacles);
        setScientificSites(payload.grid.scientific_sites);
        setCommZones(payload.grid.comm_zones);
        setRover({
          id: payload.rover.rover_id,
          x: payload.rover.x,
          y: payload.rover.y,
          heading: payload.rover.heading,
          battery: payload.rover.battery_percent,
          status: payload.rover.status,
        });
      }
    } catch (err) {
      console.error('Failed to parse telemetry sync data:', err);
    }
  };

  return (
    <div className="astral-app">
      {/* Header */}
      <header className="astral-header">
        <div className="header-brand">
          <span className="badge-mission">MISSION CONTROL</span>
          <h1 className="mission-title">ASTRAL — Lost in Space</h1>
          <span className="mission-subtitle">Planetary Grid Telemetry • Sector Sigma-9 (10×10)</span>
        </div>
        <div className="header-status-pills">
          <div className="pill">
            <span className="pill-dot emerald"></span>
            <span>SYSTEM: NOMINAL</span>
          </div>
          <div className="pill">
            <span className="pill-dot amber"></span>
            <span>SIM ENGINE: READY</span>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="astral-workspace">
        {/* Left Column: Planetary Grid Canvas */}
        <section className="grid-section">
          <div className="section-titlebar">
            <h2>Planetary Surface Grid</h2>
            <div className="grid-meta-tag">CANVAS 2D RENDERING • 10×10 SECTOR</div>
          </div>

          <div className="canvas-container">
            <PlanetaryGrid
              gridWidth={10}
              gridHeight={10}
              obstacles={obstacles}
              scientificSites={scientificSites}
              commZones={commZones}
              rover={rover}
              onHoverCell={setHoveredCell}
            />
          </div>

          {/* Cell Inspector HUD */}
          <div className="cell-inspector-panel">
            <div className="inspector-header">
              <span className="inspector-tag">SURFACE SCANNER</span>
              <span className="inspector-coords">
                {hoveredCell ? `X: ${hoveredCell.x} | Y: ${hoveredCell.y}` : 'X: -- | Y: --'}
              </span>
            </div>
            <div className="inspector-desc">{getCellDescription(hoveredCell)}</div>
          </div>
        </section>

        {/* Right Column: Mission Telemetry & Operations */}
        <aside className="telemetry-sidebar">
          {/* Rover Status */}
          <div className="telemetry-card">
            <div className="card-header">
              <span className="card-title">ROVER TELEMETRY</span>
              <span className="rover-badge">{rover.id}</span>
            </div>
            <div className="rover-stats-grid">
              <div className="stat-box">
                <span className="stat-label">COORDINATES</span>
                <span className="stat-value highlight">({rover.x}, {rover.y})</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">HEADING</span>
                <span className="stat-value">{rover.heading} (East)</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">BATTERY</span>
                <span className="stat-value text-emerald">{rover.battery}%</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">STATUS</span>
                <span className="stat-value text-amber">{rover.status}</span>
              </div>
            </div>
          </div>

          {/* Sector Legend */}
          <div className="telemetry-card">
            <div className="card-header">
              <span className="card-title">MAP SECTOR LEGEND</span>
            </div>
            <div className="legend-list">
              <div className="legend-item">
                <span className="legend-swatch rover-swatch">R</span>
                <div className="legend-info">
                  <strong>ASTRAL Rover</strong>
                  <span>Mobile autonomous scientific unit</span>
                </div>
              </div>
              <div className="legend-item">
                <span className="legend-swatch obstacle-swatch">✕</span>
                <div className="legend-info">
                  <strong>Obstacle ({obstacles.length} sites)</strong>
                  <span>Hazardous boulders / impassable craters</span>
                </div>
              </div>
              <div className="legend-item">
                <span className="legend-swatch science-swatch">◆</span>
                <div className="legend-info">
                  <strong>Scientific Data Site ({scientificSites.length} sites)</strong>
                  <span>Primary mission sample retrieval targets</span>
                </div>
              </div>
              <div className="legend-item">
                <span className="legend-swatch comm-swatch">📡</span>
                <div className="legend-info">
                  <strong>Communication Zone ({commZones.length} zones)</strong>
                  <span>High-bandwidth relay beacon uplink</span>
                </div>
              </div>
            </div>
          </div>

          {/* Backend Health Check Widget */}
          <BackendHealthIndicator onSyncTelemetry={handleSyncTelemetry} />

          {/* Team Quickstart */}
          <div className="telemetry-card quickstart-card">
            <div className="card-header">
              <span className="card-title">TEAM DEV GUIDE</span>
            </div>
            <p className="quickstart-text">
              <strong>Backend:</strong> <code>.\backend\venv\Scripts\python -m uvicorn api.main:app --reload</code>
              <br />
              <strong>Frontend:</strong> <code>cmd /c npm run dev</code>
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default App;
