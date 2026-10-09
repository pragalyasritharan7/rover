"""Planetary Grid module for the ASTRAL simulation engine.

Defines grid dimensions, cell classification, and coordinate geometry.
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Dict, List, Set, Tuple


class CellType(str, Enum):
    EMPTY = "empty"
    OBSTACLE = "obstacle"
    SCIENTIFIC_DATA = "scientific_data"
    COMM_ZONE = "comm_zone"


@dataclass(frozen=True)
class Coordinate:
    x: int
    y: int

    def as_tuple(self) -> Tuple[int, int]:
        return (self.x, self.y)

    def to_dict(self) -> Dict[str, int]:
        return {"x": self.x, "y": self.y}


@dataclass
class PlanetaryGrid:
    """Represents the planetary surface as a 2D discrete grid."""

    width: int = 10
    height: int = 10
    obstacles: Set[Coordinate] = field(default_factory=set)
    scientific_sites: Set[Coordinate] = field(default_factory=set)
    comm_zones: Set[Coordinate] = field(default_factory=set)

    def is_in_bounds(self, x: int, y: int) -> bool:
        """Check if coordinates lie strictly within the grid boundaries."""
        return 0 <= x < self.width and 0 <= y < self.height

    def get_cell_type(self, x: int, y: int) -> CellType:
        """Return the semantic type of a cell at (x, y)."""
        if not self.is_in_bounds(x, y):
            raise IndexError(f"Coordinate ({x}, {y}) out of grid bounds ({self.width}x{self.height})")

        coord = Coordinate(x, y)
        if coord in self.obstacles:
            return CellType.OBSTACLE
        if coord in self.scientific_sites:
            return CellType.SCIENTIFIC_DATA
        if coord in self.comm_zones:
            return CellType.COMM_ZONE
        return CellType.EMPTY

    def add_obstacle(self, x: int, y: int) -> None:
        if not self.is_in_bounds(x, y):
            raise IndexError(f"Obstacle coordinate ({x}, {y}) out of bounds")
        self.obstacles.add(Coordinate(x, y))

    def add_scientific_site(self, x: int, y: int) -> None:
        if not self.is_in_bounds(x, y):
            raise IndexError(f"Scientific site coordinate ({x}, {y}) out of bounds")
        self.scientific_sites.add(Coordinate(x, y))

    def add_comm_zone(self, x: int, y: int) -> None:
        if not self.is_in_bounds(x, y):
            raise IndexError(f"Comm zone coordinate ({x}, {y}) out of bounds")
        self.comm_zones.add(Coordinate(x, y))

    def to_dict(self) -> dict:
        """Serialize grid structure for telemetry or state snapshots."""
        return {
            "width": self.width,
            "height": self.height,
            "obstacles": [c.to_dict() for c in sorted(self.obstacles, key=lambda c: (c.y, c.x))],
            "scientific_sites": [c.to_dict() for c in sorted(self.scientific_sites, key=lambda c: (c.y, c.x))],
            "comm_zones": [c.to_dict() for c in sorted(self.comm_zones, key=lambda c: (c.y, c.x))],
        }
