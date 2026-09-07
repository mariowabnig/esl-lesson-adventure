import { describe, it, expect } from 'vitest';
import { isWordSolved } from '../utils/wordGuess';

describe('word guessing', () => {
  it('requires every distinct letter, including repeated letters', () => {
    expect(isWordSolved('ANT', ['A','N'])).toBe(false);
    expect(isWordSolved('TEDDY', ['T','E','D','Y'])).toBe(true);
  });
  it('allows multiword and punctuated vocabulary to be completed', () => {
    expect(isWordSolved('ICE-CREAM', ['I','C','E','R','A','M'])).toBe(true);
    expect(isWordSolved('SCHOOL BAG', ['S','C','H','O','L','B','A','G'])).toBe(true);
  });
  it('does not count empty or punctuation-only words as solved', () => {
    expect(isWordSolved('', [])).toBe(false);
    expect(isWordSolved(' - ', [])).toBe(false);
  });
});
