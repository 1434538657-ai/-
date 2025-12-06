export interface ThemeConfig {
  primaryColor: string;
  accentColor: string;
  glassOpacity: number;
}

export interface CrystalProps {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  color: string;
}

export enum AnimationState {
  SCATTERED = 'SCATTERED',
  ASSEMBLED = 'ASSEMBLED'
}