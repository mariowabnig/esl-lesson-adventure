// Spaces, punctuation and accented characters are visible clues, not keyboard guesses.
export const isGuessableLetter = (letter: string) => /^[A-Z]$/i.test(letter);

export function isWordSolved(word: string, guesses: string[]): boolean {
  return !!word && [...word].some(isGuessableLetter) &&
    [...word].every(letter => !isGuessableLetter(letter) || guesses.includes(letter.toUpperCase()));
}
