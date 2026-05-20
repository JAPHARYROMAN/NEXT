import type { FocusDirection, FocusNode } from './focus-types';

/** Pick nearest spatial neighbor by row/col grid — simple LRUD for TV shelves. */
export function pickNeighbor(
  current: FocusNode,
  nodes: readonly FocusNode[],
  direction: FocusDirection,
): string | null {
  const others = nodes.filter((n) => n.id !== current.id);
  if (others.length === 0) return null;

  const scored = others
    .map((n) => {
      const dRow = n.row - current.row;
      const dCol = n.col - current.col;
      let eligible = false;
      let primary = Infinity;
      let secondary = Math.abs(dCol) + Math.abs(dRow);

      switch (direction) {
        case 'up':
          eligible = dRow < 0;
          primary = -dRow;
          secondary = Math.abs(dCol);
          break;
        case 'down':
          eligible = dRow > 0;
          primary = dRow;
          secondary = Math.abs(dCol);
          break;
        case 'left':
          eligible = dCol < 0;
          primary = -dCol;
          secondary = Math.abs(dRow);
          break;
        case 'right':
          eligible = dCol > 0;
          primary = dCol;
          secondary = Math.abs(dRow);
          break;
      }

      return { id: n.id, eligible, primary, secondary };
    })
    .filter((s) => s.eligible)
    .sort((a, b) => a.primary - b.primary || a.secondary - b.secondary);

  return scored[0]?.id ?? null;
}
