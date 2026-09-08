import { describe, expect, it } from 'vitest';
import { placementCells } from '../utils/huntPlacement';
import { uncoverTreasure, remainingLives, type TreasureProgress } from '../utils/treasureGame';

describe('manual placement', () => {
  it('supports both orientations and rejects wrapping and bottom overflow', () => {
    expect(placementCells(6, 3, 0, false, [])).toEqual([0, 1, 2]);
    expect(placementCells(6, 3, 0, true, [])).toEqual([0, 6, 12]);
    expect(placementCells(6, 3, 4, false, [])).toBeNull();
    expect(placementCells(6, 3, 24, true, [])).toBeNull();
  });
  it('rejects overlap, touching edges and diagonals but permits a gap', () => {
    for (const cell of [0, 2, 6, 8]) expect(placementCells(6, 2, cell, false, [[0, 1]])).toBeNull();
    expect(placementCells(6, 2, 12, false, [[0, 1]])).toEqual([12, 13]);
  });
});
describe('independent duel boards', () => {
  it('allows the same coordinate on both boards without sharing hits or lives', () => {
    const empty = (): TreasureProgress => ({ moves: [], owners: {} });
    const attack = uncoverTreasure([[0, 1]], empty(), 0, 'team');
    const defence = uncoverTreasure([[6, 7]], empty(), 0, 'computer');
    expect(attack.moves[0].hit).toBe(true);
    expect(defence.moves[0].hit).toBe(false);
    expect(remainingLives(attack.moves, 'team', 7)).toBe(7);
    expect(remainingLives(defence.moves, 'computer', 7)).toBe(6);
    expect(uncoverTreasure([[0, 1]], attack, 1, 'team').owners).toEqual({ 0: 'team' });
    expect(defence.owners).toEqual({});
  });
});

describe('diagonal placement', () => {
  it('supports both slopes and rejects every relevant board edge', () => {
    expect(placementCells(6, 3, 0, 'diagonal-down', [])).toEqual([0, 7, 14]);
    expect(placementCells(6, 3, 12, 'diagonal-up', [])).toEqual([12, 7, 2]);
    for (const [cell, direction] of [[4, 'diagonal-down'], [30, 'diagonal-down'], [6, 'diagonal-up'], [17, 'diagonal-up']] as const)
      expect(placementCells(6, 3, cell, direction, [])).toBeNull();
  });
  it('prevents diagonal objects touching or crossing existing objects', () => {
    expect(placementCells(6, 3, 0, 'diagonal-down', [[6, 7]])).toBeNull();
    expect(placementCells(6, 3, 12, 'diagonal-up', [[0, 7, 14]])).toBeNull();
    expect(placementCells(6, 2, 4, 'diagonal-down', [[0, 7, 14]])).toEqual([4, 11]);
  });
});
