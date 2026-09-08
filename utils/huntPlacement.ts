export type PlacementDirection = 'horizontal' | 'vertical' | 'diagonal-down' | 'diagonal-up';

/** A straight object must fit and stay one square away from all other objects. */
export function placementCells(size: number, length: number, start: number, direction: PlacementDirection | boolean, objects: number[][]): number[] | null {
  const row = Math.floor(start / size), col = start % size;
  const dr = direction === true || direction === 'vertical' || direction === 'diagonal-down' ? 1 : direction === 'diagonal-up' ? -1 : 0;
  const dc = direction === true || direction === 'vertical' ? 0 : 1;
  const endRow = row + dr * (length - 1), endCol = col + dc * (length - 1);
  if (start < 0 || start >= size * size || endRow < 0 || endRow >= size || endCol >= size) return null;
  const cells = Array.from({ length }, (_, i) => (row + dr * i) * size + col + dc * i);
  if (cells.some(cell => objects.flat().some(other => Math.abs(Math.floor(cell / size) - Math.floor(other / size)) <= 1 && Math.abs(cell % size - other % size) <= 1))) return null;
  return cells;
}
