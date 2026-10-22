export interface FreehandPoint {
  x: number;
  y: number;
  pressure: number;
}

export interface FreehandStroke {
  size: number;
  color: string;
  dynamic: boolean;
  points: FreehandPoint[];
}

export interface UseFreehandCanvasOptions {
  brushSize?: number;
  color?: string;
  pressureEnabled?: boolean;
  keyboard?: boolean;
  keyboardStep?: number;
  onStrokeEnd?: (stroke: FreehandStroke) => void;
}
