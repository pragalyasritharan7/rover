"""Rover module for the ASTRAL simulation engine.

Defines the physical rover state and operations independent of FastAPI.
"""

from dataclasses import dataclass
from typing import Dict, Any
from .grid import Coordinate


@dataclass
class RoverState:
    coordinate: Coordinate
    heading: str = "N"  # N, E, S, W
    battery_percent: float = 100.0
    status: str = "IDLE"  # IDLE, MOVING, SAMPLING, TRANSMITTING


class Rover:
    """Independent rover representation."""

    def __init__(
        self,
        rover_id: str = "ASTRAL-1",
        start_x: int = 0,
        start_y: int = 0,
        heading: str = "N",
    ) -> None:
        self.rover_id = rover_id
        self.state = RoverState(
            coordinate=Coordinate(start_x, start_y),
            heading=heading,
            battery_percent=100.0,
            status="IDLE",
        )

    @property
    def position(self) -> Coordinate:
        return self.state.coordinate

    def to_dict(self) -> Dict[str, Any]:
        return {
            "rover_id": self.rover_id,
            "x": self.state.coordinate.x,
            "y": self.state.coordinate.y,
            "heading": self.state.heading,
            "battery_percent": self.state.battery_percent,
            "status": self.state.status,
        }
