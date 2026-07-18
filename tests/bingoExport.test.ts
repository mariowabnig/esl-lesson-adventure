import { describe, expect, it } from 'vitest';
import type { SessionWord } from '../types';
import { generateBingoCards } from '../utils/bingoExport';

const words: SessionWord[] = [
  { letter: 'A', word: 'apple', image: '🍎', category: 'food' },
  { letter: 'B', word: 'bear', image: '🐻', category: 'animals' },
  { letter: 'C', word: 'cat', image: '🐈', category: 'animals' },
];

describe('generateBingoCards', () => {
  it('creates rectangular cards and pads missing cells', () => {
    const [card] = generateBingoCards(words, 2, 1, () => 0.5);

    expect(card.id).toBe(1);
    expect(card.words).toHaveLength(2);
    expect(card.words.every((row) => row.length === 2)).toBe(true);
    expect(card.words.flat().filter(Boolean)).toHaveLength(3);
    expect(card.words.flat()).toContain(null);
  });

  it('does not mutate the source vocabulary', () => {
    const snapshot = structuredClone(words);
    generateBingoCards(words, 2, 2, () => 0);
    expect(words).toEqual(snapshot);
  });

  it('rejects invalid card dimensions', () => {
    expect(() => generateBingoCards(words, 0, 1)).toThrow(RangeError);
    expect(() => generateBingoCards(words, 2, 0)).toThrow(RangeError);
  });
});
