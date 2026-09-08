import { describe, expect, it } from "vitest";
import {
  remainingLives,
  chooseComputerSquare,
  uncoverTreasure,
  type TreasureProgress,
} from "../utils/treasureGame";

const empty = (): TreasureProgress => ({ moves: [], owners: {} });
describe("treasure ownership", () => {
  it("awards one point only to the explorer uncovering the final square", () => {
    let progress = uncoverTreasure(
      [
        [0, 1],
        [8, 9, 10],
      ],
      empty(),
      0,
      "team",
    );
    expect(progress.owners).toEqual({});
    progress = uncoverTreasure(
      [
        [0, 1],
        [8, 9, 10],
      ],
      progress,
      1,
      "computer",
    );
    expect(progress.owners).toEqual({ 0: "computer" });
    expect(
      uncoverTreasure(
        [
          [0, 1],
          [8, 9, 10],
        ],
        progress,
        1,
        "team",
      ),
    ).toBe(progress);
    progress = uncoverTreasure(
      [
        [0, 1],
        [8, 9, 10],
      ],
      progress,
      7,
      "team",
    );
    expect(progress.moves.at(-1)?.hit).toBe(false);
    expect(progress.owners).toEqual({ 0: "computer" });
  });
  it("finishes a complete match without repeated guesses or lost treasures", () => {
    const treasures = [
      [0, 1],
      [8, 9, 10],
    ];
    let progress = empty();
    for (let i = 0; i < 16 && Object.keys(progress.owners).length < 2; i++) {
      const cell = chooseComputerSquare(
        4,
        progress.moves,
        Object.keys(progress.owners).flatMap(
          (index) => treasures[Number(index)],
        ),
        () => 0,
      );
      expect(cell).not.toBeNull();
      progress = uncoverTreasure(
        treasures,
        progress,
        cell!,
        i % 2 ? "computer" : "team",
      );
    }
    expect(Object.keys(progress.owners)).toHaveLength(2);
    expect(new Set(progress.moves.map((move) => move.cell)).size).toBe(
      progress.moves.length,
    );
  });
});
describe("computer search", () => {
  it("follows revealed hits without wrapping at map edges", () => {
    for (const random of [0, 0.4, 0.99]) {
      expect([2, 7]).toContain(
        chooseComputerSquare(
          4,
          [{ cell: 3, hit: true, explorer: "team" }],
          [],
          () => random,
        ),
      );
    }
  });
  it("ignores collected treasures and never selects an explored square", () => {
    const moves = [
      { cell: 3, hit: true, explorer: "team" as const },
      { cell: 0, hit: false, explorer: "computer" as const },
    ];
    expect(chooseComputerSquare(4, moves, [3], () => 0)).toBe(1);
  });
  it("returns no move on a fully explored board", () => {
    expect(
      chooseComputerSquare(
        2,
        Array.from({ length: 4 }, (_, cell) => ({
          cell,
          hit: false,
          explorer: "team" as const,
        })),
        [],
      ),
    ).toBeNull();
  });
});

describe('lives', () => {
  it('charges only the side that missed, never hits; supports unlimited lives', () => {
    const moves = [ {cell: 0, hit: false, explorer: 'team' as const}, {cell: 1, hit: true, explorer: 'computer' as const} ];
    expect(remainingLives(moves, 'team', 1)).toBe(0);
    expect(remainingLives(moves, 'computer', 1)).toBe(1);
    expect(remainingLives(moves, 'team', 0)).toBe(Infinity);
    expect(remainingLives([...moves,...moves], 'team', 1)).toBe(0);
  });
});
