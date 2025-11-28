export interface HandGestureData {
  x: number; // Normalized 0-1
  y: number; // Normalized 0-1
  vx: number; // Velocity X
  vy: number; // Velocity Y
  isOpen: boolean; // Controls scale target
  isPointing: boolean; // Controls rotation & scale lock
  detected: boolean;
}

export enum GameState {
  LOADING = 'LOADING',
  READY = 'READY',
  ERROR = 'ERROR'
}