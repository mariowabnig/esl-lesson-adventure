import { describe, expect, it } from "vitest";
import {
  createSizedTreasures,
  parseGridCoordinate,
} from "../utils/coordinates";
describe("coordinate input", () => {
  it("accepts classroom spacing and case", () => {
    for (const value of ["B3", " b 3 ", "B-3"])
      expect(parseGridCoordinate(value, 6)).toEqual({ row: 1, col: 2 });
  });
  it("rejects malformed and out of range coordinates without crashing", () => {
    for (const value of [
      "AA",
      "A",
      "Afoo",
      "A3oops",
      "A1.5",
      "A0",
      "G1",
      "A7",
      "1A",
      "",
    ])
      expect(parseGridCoordinate(value, 6)).toBeNull();
  });
});
describe("treasures of different sizes", () => {
  it("places complete straight, separated treasures for every classroom option", () => {
    for (const size of [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16])
      for (const lengths of [
        [2, 3],
        [2, 3, 4],
        [2, 2, 3, 3, 4],
      ]) {
        if (
          (size === 4 && lengths.length > 2) ||
          (size === 5 && lengths.length > 3)
        )
          continue;
        const treasures = createSizedTreasures(size, lengths, () => 0.37);
        expect(treasures.map((t) => t.length).sort()).toEqual(
          [...lengths].sort(),
        );
        for (const [index, treasure] of treasures.entries()) {
          expect(treasure.every((c) => c >= 0 && c < size * size)).toBe(true);
          const step = treasure[1] - treasure[0];
          expect([1, size]).toContain(step);
          expect(
            treasure.every(
              (cell, i) => i === 0 || cell - treasure[i - 1] === step,
            ),
          ).toBe(true);
          if (step === 1)
            expect(
              new Set(treasure.map((c) => Math.floor(c / size))).size,
            ).toBe(1);
          for (const other of treasures.slice(index + 1))
            for (const a of treasure)
              for (const b of other) {
                expect(
                  Math.abs(Math.floor(a / size) - Math.floor(b / size)) > 1 ||
                    Math.abs((a % size) - (b % size)) > 1,
                ).toBe(true);
              }
        }
      }
  });
  it("supports custom treasure counts and rejects empty or overcrowded maps", () => {
    expect(
      createSizedTreasures(
        16,
        [...Array(6).fill(2), ...Array(6).fill(3), ...Array(6).fill(4)],
        () => 0.37,
      ),
    ).toHaveLength(18);
    expect(createSizedTreasures(4, [4], () => 0.37)[0]).toHaveLength(4);
    expect(() => createSizedTreasures(4, [])).toThrow(RangeError);
    expect(() => createSizedTreasures(4, Array(6).fill(4))).toThrow(RangeError);
  });
  it("places a known feasible dense layout without dropping treasures", () => {
    const lengths = [
      ...Array(6).fill(2),
      ...Array(6).fill(3),
      ...Array(6).fill(4),
    ];
    const treasures = createSizedTreasures(12, lengths, () => 0.37);
    expect(treasures.map((t) => t.length).sort()).toEqual(lengths.sort());
    expect(new Set(treasures.flat()).size).toBe(54);
    for (const [index, treasure] of treasures.entries()) {
      expect(treasure.every((cell) => cell >= 0 && cell < 144)).toBe(true);
      for (const other of treasures.slice(index + 1))
        for (const a of treasure)
          for (const b of other) {
            expect(
              Math.abs(Math.floor(a / 12) - Math.floor(b / 12)) > 1 ||
                Math.abs((a % 12) - (b % 12)) > 1,
            ).toBe(true);
          }
    }
  });
  it("rejects impossible layouts rather than silently dropping a treasure", () => {
    expect(() => createSizedTreasures(2, [2, 2])).toThrow(RangeError);
  });
});

describe('optional diagonal generation', () => {
  it('generates both slopes while preserving lengths, bounds and separation', () => {
    const slopes = new Set<number>();
    for (let seed = 1; seed <= 20; seed++) {
      let state = seed;
      const random = () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
      const objects = createSizedTreasures(8, [4, 3, 2], random, true);
      expect(objects.map(object => object.length)).toEqual([4, 3, 2]);
      for (const [index, object] of objects.entries()) {
        const dr = Math.floor(object[1] / 8) - Math.floor(object[0] / 8), dc = object[1] % 8 - object[0] % 8;
        slopes.add(object[1] - object[0]);
        object.forEach((cell, i) => {
          expect(cell).toBeGreaterThanOrEqual(0); expect(cell).toBeLessThan(64);
          expect(Math.floor(cell / 8)).toBe(Math.floor(object[0] / 8) + i * dr);
          expect(cell % 8).toBe(object[0] % 8 + i * dc);
          for (const other of objects.slice(index + 1).flat())
            expect(Math.abs(Math.floor(cell / 8) - Math.floor(other / 8)) > 1 || Math.abs(cell % 8 - other % 8) > 1).toBe(true);
        });
      }
    }
    expect(slopes.has(9)).toBe(true); expect(slopes.has(-7)).toBe(true);
  });
});
