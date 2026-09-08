export type Explorer = "team" | "computer";
export type TreasureMove = { cell: number; hit: boolean; explorer: Explorer };
export type TreasureProgress = {
  moves: TreasureMove[];
  owners: Record<number, Explorer>;
};

/** Choose using public discoveries only; hidden treasure positions are never supplied. */
export function chooseComputerSquare(
  size: number,
  moves: TreasureMove[],
  collectedCells: number[],
  random = Math.random,
): number | null {
  const seen = new Set(moves.map((move) => move.cell));
  const collected = new Set(collectedCells);
  const available = Array.from(
    { length: size * size },
    (_, cell) => cell,
  ).filter((cell) => !seen.has(cell));
  const neighbours = new Set<number>();
  for (const move of moves) {
    if (!move.hit || collected.has(move.cell)) continue;
    const row = Math.floor(move.cell / size),
      col = move.cell % size;
    for (const [dr, dc] of [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ]) {
      const r = row + dr,
        c = col + dc;
      if (r >= 0 && r < size && c >= 0 && c < size && !seen.has(r * size + c))
        neighbours.add(r * size + c);
    }
  }
  const choices = neighbours.size ? [...neighbours] : available;
  return choices.length ? choices[Math.floor(random() * choices.length)] : null;
}

/** A treasure belongs to the explorer who uncovers its final square. */
export function uncoverTreasure(
  treasures: number[][],
  progress: TreasureProgress,
  cell: number,
  explorer: Explorer,
): TreasureProgress {
  if (progress.moves.some((move) => move.cell === cell)) return progress;
  const treasureIndex = treasures.findIndex((treasure) =>
    treasure.includes(cell),
  );
  const moves = [
    ...progress.moves,
    { cell, hit: treasureIndex >= 0, explorer },
  ];
  const seen = new Set(moves.map((move) => move.cell));
  const owners = { ...progress.owners };
  if (
    treasureIndex >= 0 &&
    owners[treasureIndex] === undefined &&
    treasures[treasureIndex].every((square) => seen.has(square))
  ) {
    owners[treasureIndex] = explorer;
  }
  return { moves, owners };
}

/** Only misses cost lives. Zero means unlimited. */
export function remainingLives(moves: TreasureMove[], explorer: Explorer, limit: number): number {
  return limit === 0 ? Infinity : Math.max(0, limit - moves.filter(move => move.explorer === explorer && !move.hit).length);
}
