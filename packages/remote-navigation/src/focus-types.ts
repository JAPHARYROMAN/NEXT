export type FocusDirection = 'up' | 'down' | 'left' | 'right';

export interface FocusNode {
  readonly id: string;
  readonly row: number;
  readonly col: number;
  readonly zone?: string;
}

export interface FocusRect {
  readonly id: string;
  readonly top: number;
  readonly left: number;
  readonly width: number;
  readonly height: number;
}
