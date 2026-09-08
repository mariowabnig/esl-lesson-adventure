import { placementCells, type PlacementDirection } from './huntPlacement';

/** Accept classroom notation such as B3, b 3 and B-3; reject partial numbers. */
export function parseGridCoordinate(
  value: string,
  size: number,
): { row: number; col: number } | null {
  const match = /^([a-z])\s*-?\s*(\d+)$/i.exec(value.trim());
  if (!match) return null;
  const row = match[1].toUpperCase().charCodeAt(0) - 65;
  const col = Number(match[2]) - 1;
  return row >= 0 && row < size && col >= 0 && col < size ? { row, col } : null;
}

/** Treasures of different sizes, each spanning a straight line with a clear square around it. */
export function createSizedTreasures(
  size: number,
  lengths: number[],
  random = Math.random,
  allowDiagonal = false,
): number[][] {
  if (
    !Number.isInteger(size) ||
    size < 2 ||
    !lengths.length ||
    lengths.some((n) => !Number.isInteger(n) || n < 2 || n > size)
  )
    throw new RangeError(
      "Choose at least one treasure with a size that fits the map.",
    );
  if (lengths.reduce((sum, length) => sum + length, 0) > size * size)
    throw new RangeError(
      "Too many treasures. Choose fewer treasures or a larger map.",
    );
  const ordered = [...lengths].sort((a, b) => b - a);
  // Cache geometry once instead of rebuilding every candidate at each search node.
  const candidatesByLength = new Map<number, number[][]>();
  for (const length of new Set(ordered)) {
    const candidates: number[][] = [];
    for (let row = 0; row < size; row++)
      for (let col = 0; col < size; col++)
        for (const direction of (allowDiagonal
          ? ['horizontal', 'vertical', 'diagonal-down', 'diagonal-up']
          : ['horizontal', 'vertical']) as PlacementDirection[]) {
          const cells = placementCells(size, length, row * size + col, direction, []);
          if (cells) candidates.push(cells);
        }
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }
    candidatesByLength.set(length, candidates);
  }
  let attempts = 0;
  const maxAttempts = 2500;
  function place(
    index: number,
    treasures: number[][],
    blocked: Set<number>,
  ): number[][] | null {
    if (index === ordered.length) return treasures;
    if (++attempts > maxAttempts) return null;
    const candidates = candidatesByLength.get(ordered[index])!;
    for (const cells of candidates) {
      if (attempts >= maxAttempts) return null;
      if (cells.some((cell) => blocked.has(cell))) continue;
      const next = new Set(blocked);
      for (const cell of cells)
        for (let dr = -1; dr <= 1; dr++)
          for (let dc = -1; dc <= 1; dc++) {
            const r = Math.floor(cell / size) + dr,
              c = (cell % size) + dc;
            if (r >= 0 && r < size && c >= 0 && c < size)
              next.add(r * size + c);
          }
      const result = place(index + 1, [...treasures, cells], next);
      if (result) return result;
    }
    return null;
  }
  const result = place(0, [], new Set());
  if (result) return result;

  // A bounded random search may miss a valid dense layout. Pack separated rows
  // as a cheap fallback before asking the teacher to reduce the treasure count.
  const rows: number[][] = [];
  for (const length of ordered) {
    let row = rows.find(
      (row) => row.reduce((sum, n) => sum + n + 1, 0) + length <= size,
    );
    if (!row) {
      row = [];
      rows.push(row);
    }
    row.push(length);
  }
  if (rows.length * 2 - 1 <= size) {
    const vertical = random() < 0.5;
    return rows.flatMap((lengths, row) => {
      let col = 0;
      return lengths.map((length) => {
        const cells = Array.from({ length }, (_, i) =>
          vertical ? (col + i) * size + row * 2 : row * 2 * size + col + i,
        );
        col += length + 1;
        return cells;
      });
    });
  }
  throw new RangeError(
    "Could not fit these treasures with space between them. Choose fewer treasures or a larger map.",
  );
}
