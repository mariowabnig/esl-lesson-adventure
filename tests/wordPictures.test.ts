import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import ImageRenderer from '../components/ImageRenderer';
import { PICTURE_WORDS, getWordPicture, resolveWordImage } from '../utils/wordPictures';
import { bingoImageHtml } from '../utils/bingoExport';
import { DEFAULT_ALPHABET_WORDS } from '../constants';

describe('prepared classroom pictures', () => {
  it('ships every image and offers every word under its initial', () => {
    for (const word of PICTURE_WORDS) {
      expect(existsSync(`public${getWordPicture(word)}`), word).toBe(true);
      expect(DEFAULT_ALPHABET_WORDS[word[0].toUpperCase()].some(w => w.word === word), word).toBe(true);
    }
  });
  it('matches typed variants without fuzzy matches to unrelated words', () => {
    expect(getWordPicture('  SCHOOLBAG ')).toBe('/word-pictures/school-bag.jpg');
    expect(getWordPicture('Ice-Cream')).toBe('/word-pictures/ice-cream.jpg');
    expect(getWordPicture('bike')).toBe('/word-pictures/bicycle.jpg');
    expect(getWordPicture('caterpillar')).toBeUndefined();
    expect(getWordPicture('constructor')).toBeUndefined();
  });
  it('upgrades saved emojis, preserves supplied images and keeps unknown words usable', () => {
    expect(resolveWordImage('cat', '🐈')).toBe('/word-pictures/cat.jpg');
    expect(resolveWordImage('hamster', '📝')).toBe('/word-pictures/hamster.jpg');
    expect(resolveWordImage('cat', 'data:image/png;base64,abc')).toBe('data:image/png;base64,abc');
    expect(resolveWordImage('unlisted word', '📝')).toBe('📝');
  });
  it('renders actual pictures in app cards and printable bingo', () => {
    const word = { word: 'hamster', image: '📝', letter: 'H', category: 'animals' as const };
    expect(renderToStaticMarkup(createElement(ImageRenderer, { image: word.image, alt: word.word }))).toContain('src="/word-pictures/hamster.jpg"');
    expect(bingoImageHtml(word)).toContain('src="/word-pictures/hamster.jpg"');
  });
});
