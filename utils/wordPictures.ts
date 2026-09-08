import { EMOJI_DATABASE } from '../emojiDatabase';

export const PICTURE_WORDS = [
  'apple', 'banana', 'bicycle', 'book', 'butterfly', 'cake', 'car', 'cat',
  'dinosaur', 'dog', 'dragon', 'elephant', 'fish', 'football', 'hamster',
  'horse', 'ice cream', 'lion', 'pencil', 'pizza', 'rabbit', 'robot',
  'school bag', 'teddy bear',
] as const;

const aliases: Record<string, string> = {
  bike: 'bicycle', schoolbag: 'school bag', backpack: 'school bag',
  'ice-cream': 'ice cream', icecream: 'ice cream', teddy: 'teddy bear',
  'teddy-bear': 'teddy bear', 'soccer ball': 'football', ball: 'football',
};

export function getWordPicture(word: string): string | undefined {
  const normalized = word.trim().toLowerCase().replace(/\s+/g, ' ');
  const canonical = Object.hasOwn(aliases, normalized) ? aliases[normalized] : normalized;
  return (PICTURE_WORDS as readonly string[]).includes(canonical)
    ? `/word-pictures/${canonical.replaceAll(' ', '-')}.jpg`
    : undefined;
}

export function isImageSource(image: string): boolean {
  return image.startsWith('data:image/') || /^\/word-pictures\/[a-z-]+\.jpg$/.test(image);
}

// Resolve at display time so vocabulary saved before this library also gets pictures.
// Preserve a deliberately supplied image instead of replacing it with a library item.
export function resolveWordImage(word: string, image: string): string {
  if (isImageSource(image)) return image;
  const picture = getWordPicture(word);
  if (picture) return picture;
  const emoji = fallbackWordEmoji(word, image);
  return emoji === '📝' ? word.toLowerCase() : emoji;
}

export function fallbackWordEmoji(word: string, image: string): string {
  if (image && !isImageSource(image) && image !== '📝') return image;
  const key = word.trim().toLowerCase().replace(/\s+/g, ' ');
  return (Object.hasOwn(EMOJI_DATABASE, key) ? EMOJI_DATABASE[key][0]?.emoji : undefined) ?? '📝';
}
