import React, { useEffect, useRef, useState } from 'react';
import type { Position, RoverData } from '../types/mission';

interface PlanetaryGridProps {
  gridWidth?: number;
  gridHeight?: number;
  obstacles: Position[];
  scientificSites: Position[];
  commZones: Position[];
  rover: RoverData;
  onHoverCell?: (pos: Position | null) => void;
}

export const PlanetaryGrid: React.FC<PlanetaryGridProps> = ({
  gridWidth = 10,
  gridHeight = 10,
  obstacles,
  scientificSites,
  commZones,
  rover,
  onHoverCell,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredCell, setHoveredCell] = useState<Position | null>(null);

  // Layout parameters
  const cellSize = 54;
  const paddingLeft = 32;
  const paddingTop = 32;
  const paddingRight = 16;
  const paddingBottom = 16;
  const totalWidth = paddingLeft + gridWidth * cellSize + paddingRight;
  const totalHeight = paddingTop + gridHeight * cellSize + paddingBottom;

  const isAt = (list: Position[], x: number, y: number) =>
    list.some((item) => item.x === x && item.y === y);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle High-DPI screens
    const dpr = window.devicePixelRatio || 1;
    canvas.width = totalWidth * dpr;
    canvas.height = totalHeight * dpr;
    ctx.resetTransform();
    ctx.scale(dpr, dpr);

    // 1. Clear & Background
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, totalWidth, totalHeight);

    // Grid surface background
    const gridPixelWidth = gridWidth * cellSize;
    const gridPixelHeight = gridHeight * cellSize;
    ctx.fillStyle = '#111726';
    ctx.fillRect(paddingLeft, paddingTop, gridPixelWidth, gridPixelHeight);

    // 2. Coordinate labels
    ctx.font = '600 12px "JetBrains Mono", "Fira Code", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#64748b';

    // X-axis column headers (0 .. 9)
    for (let x = 0; x < gridWidth; x++) {
      const cx = paddingLeft + x * cellSize + cellSize / 2;
      ctx.fillText(x.toString(), cx, paddingTop / 2);
    }

    // Y-axis row headers (0 .. 9)
    for (let y = 0; y < gridHeight; y++) {
      const cy = paddingTop + y * cellSize + cellSize / 2;
      ctx.fillText(y.toString(), paddingLeft / 2, cy);
    }

    // 3. Grid Cells and Features
    for (let x = 0; x < gridWidth; x++) {
      for (let y = 0; y < gridHeight; y++) {
        const px = paddingLeft + x * cellSize;
        const py = paddingTop + y * cellSize;

        // Subtle alternating grid texture
        if ((x + y) % 2 === 0) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
          ctx.fillRect(px, py, cellSize, cellSize);
        }

        // Draw Comm Zone
        if (isAt(commZones, x, y)) {
          // Soft cyan glow
          ctx.fillStyle = 'rgba(14, 165, 233, 0.18)';
          ctx.fillRect(px, py, cellSize, cellSize);

          // Concentric signal arcs
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(px + cellSize / 2, py + cellSize / 2, cellSize * 0.35, -0.8 * Math.PI, -0.2 * Math.PI);
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(px + cellSize / 2, py + cellSize / 2, cellSize * 0.22, -0.8 * Math.PI, -0.2 * Math.PI);
          ctx.stroke();

          // Satellite / transmitter center dot
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(px + cellSize / 2, py + cellSize / 2 + 4, 3, 0, 2 * Math.PI);
          ctx.fill();

          ctx.font = '700 9px monospace';
          ctx.fillStyle = '#7dd3fc';
          ctx.fillText('COMM', px + cellSize / 2, py + cellSize - 8);
        }

        // Draw Scientific Data Site
        if (isAt(scientificSites, x, y)) {
          // Emerald glow background
          ctx.fillStyle = 'rgba(16, 185, 129, 0.18)';
          ctx.fillRect(px, py, cellSize, cellSize);

          const cx = px + cellSize / 2;
          const cy = py + cellSize / 2 - 2;

          // Glowing diamond beacon
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 2;
          ctx.fillStyle = 'rgba(16, 185, 129, 0.3)';
          ctx.beginPath();
          ctx.moveTo(cx, cy - 12);
          ctx.lineTo(cx + 10, cy);
          ctx.lineTo(cx, cy + 12);
          ctx.lineTo(cx - 10, cy);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Core point
          ctx.fillStyle = '#6ee7b7';
          ctx.beginPath();
          ctx.arc(cx, cy, 3, 0, 2 * Math.PI);
          ctx.fill();

          ctx.font = '700 9px monospace';
          ctx.fillStyle = '#34d399';
          ctx.fillText('DATA', cx, py + cellSize - 8);
        }

        // Draw Obstacles (craggy boulder / hazardous sector)
        if (isAt(obstacles, x, y)) {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.12)';
          ctx.fillRect(px, py, cellSize, cellSize);

          const cx = px + cellSize / 2;
          const cy = py + cellSize / 2;

          // Rocky polygonal shape
          ctx.fillStyle = '#475569';
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1.5;

          ctx.beginPath();
          ctx.moveTo(cx - 14, cy + 8);
          ctx.lineTo(cx - 10, cy - 10);
          ctx.lineTo(cx + 4, cy - 14);
          ctx.lineTo(cx + 14, cy - 4);
          ctx.lineTo(cx + 12, cy + 10);
          ctx.lineTo(cx - 4, cy + 13);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Hazard symbol or warning cross
          ctx.strokeStyle = '#fca5a5';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(cx - 4, cy - 4);
          ctx.lineTo(cx + 4, cy + 4);
          ctx.moveTo(cx + 4, cy - 4);
          ctx.lineTo(cx - 4, cy + 4);
          ctx.stroke();

          ctx.font = '700 8px monospace';
          ctx.fillStyle = '#f87171';
          ctx.fillText('BLOCK', cx, py + cellSize - 6);
        }

        // Hover highlight overlay
        if (hoveredCell && hoveredCell.x === x && hoveredCell.y === y) {
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 2;
          ctx.strokeRect(px + 1, py + 1, cellSize - 2, cellSize - 2);
          ctx.fillStyle = 'rgba(250, 204, 21, 0.08)';
          ctx.fillRect(px + 1, py + 1, cellSize - 2, cellSize - 2);
        }

        // Subtle cell grid border
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        ctx.strokeRect(px, py, cellSize, cellSize);
      }
    }

    // 4. Draw Rover
    const roverPx = paddingLeft + rover.x * cellSize;
    const roverPy = paddingTop + rover.y * cellSize;
    const rcx = roverPx + cellSize / 2;
    const rcy = roverPy + cellSize / 2;

    // Glowing aura
    const gradient = ctx.createRadialGradient(rcx, rcy, 6, rcx, rcy, cellSize * 0.45);
    gradient.addColorStop(0, 'rgba(245, 158, 11, 0.35)');
    gradient.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(rcx, rcy, cellSize * 0.45, 0, 2 * Math.PI);
    ctx.fill();

    // Rover chassis body
    ctx.fillStyle = '#fbbf24';
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(rcx - 12, rcy - 12, 24, 24, 4);
    ctx.fill();
    ctx.stroke();

    // Wheel tracks on sides
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(rcx - 16, rcy - 10, 4, 20); // Left track
    ctx.fillRect(rcx + 12, rcy - 10, 4, 20); // Right track

    // Directional orientation arrow based on heading
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    if (rover.heading === 'N') {
      ctx.moveTo(rcx, rcy - 8);
      ctx.lineTo(rcx + 6, rcy + 4);
      ctx.lineTo(rcx - 6, rcy + 4);
    } else if (rover.heading === 'S') {
      ctx.moveTo(rcx, rcy + 8);
      ctx.lineTo(rcx + 6, rcy - 4);
      ctx.lineTo(rcx - 6, rcy - 4);
    } else if (rover.heading === 'E') {
      ctx.moveTo(rcx + 8, rcy);
      ctx.lineTo(rcx - 4, rcy - 6);
      ctx.lineTo(rcx - 4, rcy + 6);
    } else {
      // W
      ctx.moveTo(rcx - 8, rcy);
      ctx.lineTo(rcx + 4, rcy - 6);
      ctx.lineTo(rcx + 4, rcy + 6);
    }
    ctx.closePath();
    ctx.fill();

    // Rover label badge
    ctx.font = '700 9px monospace';
    ctx.fillStyle = '#fef08a';
    ctx.textAlign = 'center';
    ctx.fillText('ROVER', rcx, roverPy + cellSize - 5);

    // Outer grid boundary
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.strokeRect(paddingLeft, paddingTop, gridPixelWidth, gridPixelHeight);
  }, [
    gridWidth,
    gridHeight,
    obstacles,
    scientificSites,
    commZones,
    rover,
    hoveredCell,
    cellSize,
    paddingLeft,
    paddingTop,
    totalWidth,
    totalHeight,
  ]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const xPos = e.clientX - rect.left - paddingLeft;
    const yPos = e.clientY - rect.top - paddingTop;

    const cellX = Math.floor(xPos / cellSize);
    const cellY = Math.floor(yPos / cellSize);

    if (cellX >= 0 && cellX < gridWidth && cellY >= 0 && cellY < gridHeight) {
      const pos = { x: cellX, y: cellY };
      setHoveredCell(pos);
      onHoverCell?.(pos);
    } else {
      setHoveredCell(null);
      onHoverCell?.(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredCell(null);
    onHoverCell?.(null);
  };

  return (
    <div className="canvas-wrapper">
      <canvas
        ref={canvasRef}
        style={{
          width: `${totalWidth}px`,
          height: `${totalHeight}px`,
          display: 'block',
          cursor: 'crosshair',
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  );
};
