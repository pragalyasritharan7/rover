from engine.grid import PlanetaryGrid, CellType, Coordinate
from engine.rover import Rover


def test_planetary_grid_bounds_and_cells():
    grid = PlanetaryGrid(width=10, height=10)
    assert grid.is_in_bounds(0, 0)
    assert grid.is_in_bounds(9, 9)
    assert not grid.is_in_bounds(10, 0)
    assert not grid.is_in_bounds(0, -1)

    grid.add_obstacle(2, 3)
    grid.add_scientific_site(4, 5)
    grid.add_comm_zone(7, 8)

    assert grid.get_cell_type(2, 3) == CellType.OBSTACLE
    assert grid.get_cell_type(4, 5) == CellType.SCIENTIFIC_DATA
    assert grid.get_cell_type(7, 8) == CellType.COMM_ZONE
    assert grid.get_cell_type(0, 0) == CellType.EMPTY


def test_rover_initialization():
    rover = Rover("ASTRAL-1", start_x=1, start_y=2, heading="E")
    state_dict = rover.to_dict()
    assert state_dict["rover_id"] == "ASTRAL-1"
    assert state_dict["x"] == 1
    assert state_dict["y"] == 2
    assert state_dict["heading"] == "E"
    assert state_dict["battery_percent"] == 100.0
