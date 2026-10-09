export interface Position {
  x: number;
  y: number;
}

export type Heading = 'N' | 'E' | 'S' | 'W';

export interface RoverData {
  id: string;
  x: number;
  y: number;
  heading: Heading;
  battery: number;
  status: string;
}

export interface MissionState {
  gridWidth: number;
  gridHeight: number;
  obstacles: Position[];
  scientificSites: Position[];
  commZones: Position[];
  rover: RoverData;
}

export interface BackendHealthResponse {
  status: string;
  service: string;
  version: string;
  timestamp: string;
}
