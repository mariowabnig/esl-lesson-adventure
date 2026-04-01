
export type WordCategory = 'animals' | 'colors' | 'food' | 'other';

export interface Word {
  word: string;
  image: string; // base64 encoded SVG or emoji
  category: WordCategory;
}

export interface AlphabetData {
  [key: string]: Word[];
}

export interface SessionWord {
  letter: string;
  word: string;
  image: string;
  category: WordCategory;
  pronunciation?: string; // teacher pronunciation notes (persisted)
  predefined?: boolean; // true when sourced from DEFAULT_ALPHABET_WORDS
}

export const ALPHABET = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
];

export const CATEGORY_COLORS = {
  animals: 'bg-green-100 text-green-800',
  colors: 'bg-blue-100 text-blue-800',
  food: 'bg-orange-100 text-orange-800',
  other: 'bg-gray-100 text-gray-800'
};

// Re-export from constants
export { DEFAULT_ALPHABET_WORDS } from './constants';
