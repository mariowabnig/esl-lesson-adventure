import { describe, expect, it } from 'vitest';
import { getDefaultEmoji, getEmojiSuggestionsByLetter, searchEmojis } from '../emojiDatabase';

describe('emoji lookup', () => {
  it('returns direct matches without duplicates', () => {
    const results = searchEmojis('cat');
    expect(results.length).toBeGreaterThan(0);
    expect(new Set(results.map((result) => result.emoji)).size).toBe(results.length);
  });

  it('does not treat an empty query as a match for every entry', () => {
    expect(searchEmojis('   ')).toEqual([]);
    expect(getDefaultEmoji('')).toBe('❓');
  });

  it('limits letter suggestions to a classroom-friendly set', () => {
    const results = getEmojiSuggestionsByLetter('a');
    expect(results.length).toBeLessThanOrEqual(12);
    expect(results.every((result) => Boolean(result.emoji))).toBe(true);
  });
});
