import type { AlphabetData, WordCategory } from './types';

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
export const MIN_WORDS_FOR_GAMES = 15;

export const WORD_CATEGORIES: WordCategory[] = ['animals', 'colors', 'food', 'other'];

export const CATEGORY_COLORS = {
  animals: 'bg-green-100 text-green-800',
  colors: 'bg-blue-100 text-blue-800',
  food: 'bg-orange-100 text-orange-800',
  other: 'bg-gray-100 text-gray-800'
};

export const GERMAN_PRONUNCIATIONS: Record<string, string> = {
  A: '', B: '', C: '', D: '', E: '', F: '', G: '', H: '',
  I: '', J: '', K: '', L: '', M: '', N: '', O: '', P: '',
  Q: '', R: '', S: '', T: '', U: '', V: '', W: '', X: '',
  Y: '', Z: ''
};

// The default word list now uses emojis for a cleaner, more consistent, and child-friendly look.
// Words are now lowercase except for proper nouns like 'Earth'.
export const DEFAULT_ALPHABET_WORDS: AlphabetData = {
  A: [
    { word: 'apple', image: '🍎', category: 'food' },
    { word: 'ant', image: '🐜', category: 'animals' },
    { word: 'alligator', image: '🐊', category: 'animals' },
  ],
  B: [
    { word: 'ball', image: '⚽', category: 'other' },
    { word: 'banana', image: '🍌', category: 'food' },
    { word: 'bear', image: '🐻', category: 'animals' },
    { word: 'blue', image: '🔵', category: 'colors' },
  ],
  C: [
    { word: 'cat', image: '🐈', category: 'animals' },
    { word: 'car', image: '🚗', category: 'other' },
    { word: 'cake', image: '🎂', category: 'other' },
  ],
  D: [
    { word: 'dog', image: '🐕', category: 'animals' },
    { word: 'duck', image: '🦆', category: 'animals' },
    { word: 'donut', image: '🍩', category: 'other' },
  ],
  E: [
    { word: 'elephant', image: '🐘', category: 'animals' },
    { word: 'egg', image: '🥚', category: 'other' },
    { word: 'Earth', image: '🌍', category: 'other' },
  ],
  F: [
    { word: 'fish', image: '🐟', category: 'animals' },
    { word: 'frog', image: '🐸', category: 'animals' },
    { word: 'flower', image: '🌸', category: 'other' },
  ],
  G: [
    { word: 'grapes', image: '🍇', category: 'food' },
    { word: 'goat', image: '🐐', category: 'animals' },
    { word: 'gift', image: '🎁', category: 'other' },
    { word: 'green', image: '🟢', category: 'colors' },
  ],
  H: [
    { word: 'house', image: '🏠', category: 'other' },
    { word: 'hat', image: '🎩', category: 'other' },
    { word: 'heart', image: '❤️', category: 'other' },
  ],
  I: [
    { word: 'ice cream', image: '🍦', category: 'other' },
    { word: 'island', image: '🏝️', category: 'other' },
  ],
  J: [
    { word: 'jellyfish', image: '🪼', category: 'animals' },
    { word: 'juice', image: '🧃', category: 'other' },
    { word: 'jacket', image: '🧥', category: 'other' },
  ],
  K: [
    { word: 'kite', image: '🪁', category: 'other' },
    { word: 'key', image: '🔑', category: 'other' },
    { word: 'kangaroo', image: '🦘', category: 'animals' },
  ],
  L: [
    { word: 'lion', image: '🦁', category: 'animals' },
    { word: 'lemon', image: '🍋', category: 'food' },
    { word: 'leaf', image: '🍃', category: 'other' },
  ],
  M: [
    { word: 'monkey', image: '🐒', category: 'animals' },
    { word: 'moon', image: '🌙', category: 'other' },
    { word: 'mouse', image: '🐁', category: 'animals' },
  ],
  N: [
    { word: 'nose', image: '👃', category: 'other' },
    { word: 'net', image: '🥅', category: 'other' },
    { word: 'notebook', image: '📓', category: 'other' },
  ],
  O: [
    { word: 'orange', image: '🍊', category: 'food' },
    { word: 'octopus', image: '🐙', category: 'animals' },
    { word: 'owl', image: '🦉', category: 'animals' },
    { word: 'one', image: '1️⃣', category: 'other' },
  ],
  P: [
    { word: 'pig', image: '🐖', category: 'animals' },
    { word: 'pizza', image: '🍕', category: 'other' },
    { word: 'pencil', image: '✏️', category: 'other' },
  ],
  Q: [
    { word: 'queen', image: '👸', category: 'other' },
    { word: 'question', image: '❓', category: 'other' },
    { word: 'quilt', image: '🛌', category: 'other' },
  ],
  R: [
    { word: 'robot', image: '🤖', category: 'other' },
    { word: 'rainbow', image: '🌈', category: 'colors' },
    { word: 'ring', image: '💍', category: 'other' },
    { word: 'red', image: '🔴', category: 'colors' },
  ],
  S: [
    { word: 'sun', image: '☀️', category: 'other' },
    { word: 'star', image: '⭐', category: 'other' },
    { word: 'snake', image: '🐍', category: 'animals' },
  ],
  T: [
    { word: 'tree', image: '🌳', category: 'other' },
    { word: 'turtle', image: '🐢', category: 'animals' },
    { word: 'train', image: '🚂', category: 'other' },
    { word: 'two', image: '2️⃣', category: 'other' },
  ],
  U: [
    { word: 'umbrella', image: '☂️', category: 'other' },
    { word: 'unicorn', image: '🦄', category: 'animals' },
    { word: 'utensils', image: '🍴', category: 'other' },
  ],
  V: [
    { word: 'volcano', image: '🌋', category: 'other' },
    { word: 'vase', image: '🏺', category: 'other' },
    { word: 'violin', image: '🎻', category: 'other' },
  ],
  W: [
    { word: 'whale', image: '🐋', category: 'animals' },
    { word: 'worm', image: '🐛', category: 'animals' },
    { word: 'watermelon', image: '🍉', category: 'food' },
  ],
  X: [
    { word: 'xylophone', image: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB4PSIxMCIgeT0iMjAiIHdpZHRoPSI4MCIgaGVpZ2h0PSIxMCIgZmlsbD0iI2Y1OWUwYiIvPjxyZWN0IHg9IjE1IiB5PSIzNSIgd2lkdGg9IjcwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZWY0NDQ0Ii8+PHJlY3QgeD0iMjAiIHk9IjUwIiB3aWR0aD0iNjAiIGhlaWdodD0iMTAiIGZpbGw9IiM4NGNjMTYiLz48cmVjdCB4PSIyNSIgeT0iNjUiIHdpZHRoPSI1MCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzNiODJmNiIvPjwvc3ZnPg==', category: 'other' },
    { word: 'x-ray', image: '💀', category: 'other' },
  ],
  Y: [
    { word: 'yoyo', image: '🪀', category: 'other' },
    { word: 'yacht', image: '⛵', category: 'other' },
    { word: 'yarn', image: '🧶', category: 'other' },
  ],
  Z: [
    { word: 'zebra', image: '🦓', category: 'animals' },
    { word: 'zipper', image: '🤐', category: 'other' },
    { word: 'zoo', image: '🦁', category: 'other' },
  ],
};

export const ROCKET_PARTS: string[] = [
  'M45,85 L55,85 L55,50 L45,50 Z', // Main body
  'M42,85 L58,85 L60,90 L40,90 Z', // Engine nozzle
  'M45,50 L55,50 L52,35 L48,35 Z', // Upper body section
  'M48,35 L52,35 L50,20 Z', // Nose cone
  'M40,80 L35,90 L40,85 Z', // Left fin
  'M60,80 L65,90 L60,85 Z', // Right fin
  'M47,75 L53,75 L53,70 L47,70 Z', // Engine detail
  'M49,60 m-3,0 a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0', // Window
  'M46,45 L54,45 L54,42 L46,42 Z', // Upper detail band
  'M47,25 L53,25 L53,22 L47,22 Z', // Nose detail
];
export const MAX_MISTAKES = ROCKET_PARTS.length;
export const MIN_MISTAKES = 4;