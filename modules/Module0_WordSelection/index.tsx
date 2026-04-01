import React, { useState, useMemo } from 'react';

import { SessionWord, Word, WordCategory, ALPHABET, DEFAULT_ALPHABET_WORDS, CATEGORY_COLORS } from '../../types';
import ImageRenderer from '../../components/ImageRenderer';

interface WordSelectionProps {
  sessionVocabulary: SessionWord[];
  onWordsUpdate: (words: SessionWord[]) => void;
}

const Module0_WordSelection: React.FC<WordSelectionProps> = ({ sessionVocabulary, onWordsUpdate }) => {
  const [selectedLetter, setSelectedLetter] = useState<string>('A');
  const [pronunciations, setPronunciations] = useState<Record<string, string>>({});
  const [customWord, setCustomWord] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<WordCategory>('other');
  const [pronunciation, setPronunciation] = useState('');
  const [lastAddedKey, setLastAddedKey] = useState<string | null>(null);
  const [autoFillCount, setAutoFillCount] = useState<1 | 2 | 3>(1);

  // Get current words for selected letter
  const currentLetterWords = useMemo(() => {
    return sessionVocabulary.filter(word => word.letter === selectedLetter);
  }, [sessionVocabulary, selectedLetter]);

  // Get available predefined words for selected letter
  const availableWords = useMemo(() => {
    const predefinedWords = DEFAULT_ALPHABET_WORDS[selectedLetter] || [];
    const selectedWordTexts = currentLetterWords.map(w => w.word.toLowerCase());
    return predefinedWords.filter(word => !selectedWordTexts.includes(word.word.toLowerCase()));
  }, [selectedLetter, currentLetterWords]);
  // Most recently added word per letter (computed by array order)
  const lastWordByLetter = useMemo(() => {
    const out: Record<string, string | undefined> = {};
    for (const w of sessionVocabulary) {
      out[w.letter] = w.word;
    }
    return out;
  }, [sessionVocabulary]);

  const handleAddPredefinedWord = (word: Word) => {
    const newWord: SessionWord = {
      ...word,
      letter: selectedLetter,
      pronunciation: pronunciations[selectedLetter] || '',
      predefined: true
    };
    setLastAddedKey(`${selectedLetter}:${newWord.word}`);
    onWordsUpdate([...sessionVocabulary, newWord]);
  };

  const handleAddCustomWord = () => {
    if (!customWord.trim()) return;

    const newWord: SessionWord = {
      word: customWord.trim().toLowerCase(),
      image: '📝', // Default emoji for custom words
      category: selectedCategory,
      letter: selectedLetter,
      pronunciation: pronunciations[selectedLetter] || '',
      predefined: false
    };

    onWordsUpdate([...sessionVocabulary, newWord]);
    setLastAddedKey(`${selectedLetter}:${newWord.word}`);
    setCustomWord('');
  };

  const handleRemoveWord = (wordToRemove: SessionWord) => {
    onWordsUpdate(sessionVocabulary.filter(word =>
      !(word.letter === wordToRemove.letter && word.word === wordToRemove.word)
    ));
  };

  const handlePronunciationChange = (letter: string, pronunciation: string) => {
    setPronunciations(prev => ({
      ...prev,
      [letter]: pronunciation
    }));
    // Persist pronunciation on all words for this letter
    const updated = sessionVocabulary.map(w => w.letter === letter ? { ...w, pronunciation } : w);
    onWordsUpdate(updated);
  };
  // Auto-Fill empty letters with random predefined words
  const handleAutoFill = () => {
    const emptyLetters = ALPHABET.filter(letter => !sessionVocabulary.some(w => w.letter === letter));
    if (emptyLetters.length === 0) {
      alert('All letters already have words.');
      return;
    }
    const confirmMsg = `Auto-fill ${emptyLetters.length} empty letter(s) with ${autoFillCount} word(s) each?`;
    if (!confirm(confirmMsg)) return;

    const additions: SessionWord[] = [];
    emptyLetters.forEach(letter => {
      const candidates = (DEFAULT_ALPHABET_WORDS[letter] || []).slice();
      // Shuffle candidates
      for (let i = candidates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
      }
      const take = Math.min(autoFillCount, candidates.length);
      for (let k = 0; k < take; k++) {
        const w = candidates[k];
        additions.push({ letter, word: w.word, image: w.image, category: w.category, predefined: true });
      }
    });

    if (additions.length === 0) {
      alert('No predefined words available to fill.');
      return;
    }
    onWordsUpdate([...sessionVocabulary, ...additions]);
  };


  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">📚 Word Selection</h1>
        <p className="text-lg text-gray-600">Choose words for each letter to build your vocabulary</p>
        <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg">
            <span className="font-bold">{sessionVocabulary.length} words selected</span>
            {sessionVocabulary.length >= 10 && <span className="ml-2">✅ Ready for games!</span>}
          </div>

          {/* Auto-Fill Controls */}
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
            <label className="text-sm font-bold text-blue-700">Auto-Fill per Letter:</label>
            <select value={autoFillCount} onChange={(e) => setAutoFillCount(Number(e.target.value) as 1 | 2 | 3)} className="text-sm border rounded px-2 py-1">
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>
            <button
              onClick={handleAutoFill}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-3 py-2 rounded-md"
              title="Automatically add words for empty letters"
            >
              🎲 Auto-Fill Empty Letters
            </button>
          </div>

          {sessionVocabulary.length > 0 && (
            <button
              onClick={() => onWordsUpdate([])}
              className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-lg transition-colors"
              title="Delete all words"
            >
              🗑️ Delete All Words
            </button>
          )}
        </div>
      </div>

      {/* Letter Selection Grid */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold text-center mb-6">Select a Letter</h2>
        <div className="grid grid-cols-6 md:grid-cols-9 lg:grid-cols-13 gap-3">
          {ALPHABET.map(letter => {
            const letterWordCount = sessionVocabulary.filter(w => w.letter === letter).length;
            const isSelected = letter === selectedLetter;

            return (
              <button
                key={letter}
                onClick={() => setSelectedLetter(letter)}
                className={`relative p-4 rounded-lg border-2 transition-all transform hover:scale-105 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : letterWordCount > 0
                    ? 'border-green-400 bg-green-50 hover:border-green-500'
                    : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                }`}
              >
                <div className="text-3xl font-bold text-blue-600 mb-2">{letter}</div>
                {letterWordCount > 0 && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    {letterWordCount}
                  </div>
                )}

                {/* German Pronunciation Input */}
                <input
                  type="text"
                  value={pronunciations[letter] || ''}
                  onChange={(e) => {
                    e.stopPropagation();
                    handlePronunciationChange(letter, e.target.value);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Deutsche Aussprache..."
                  className="w-full mt-2 px-2 py-1 text-xs border border-gray-300 rounded text-center"
                />

	        {/* Most recent chosen word preview below each letter */}
	        <div className="mt-2 text-center text-xs text-gray-600">
	          <span className="inline-block px-2 py-1 rounded bg-blue-50 border border-blue-200 capitalize">
	            {lastWordByLetter[letter] ?? '—'}
	          </span>
	        </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Letter Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Current Words for Letter */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">
            Words for Letter {selectedLetter} ({currentLetterWords.length})
          </h3>

          {currentLetterWords.length > 0 ? (
            <div className="space-y-3">
              {currentLetterWords.map((word, index) => {
                const k = `${word.letter}:${word.word}`;
                const isLast = lastAddedKey === k;
                return (
                  <div key={index} className={`flex items-center justify-between rounded-lg p-3 ${isLast ? 'bg-yellow-100 border-2 border-yellow-400 shadow-lg' : 'bg-gray-50'}`}>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 flex items-center justify-center">
                        <ImageRenderer image={word.image} alt={word.word} className="max-w-full max-h-full" />
                      </div>
                      <div>
                        <div className="font-medium capitalize">{word.word}</div>
                        <div className={`text-xs px-2 py-1 rounded-full inline-block ${CATEGORY_COLORS[word.category]}`}>
                          {word.category}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveWord(word)}
                      className="text-red-500 hover:text-red-700 font-bold"
                      title="Remove word"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No words selected for letter {selectedLetter} yet
            </div>
          )}
        </div>

        {/* Add Words Section */}
        <div className="space-y-6">
          {/* Add Custom Word */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">Add Custom Word</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={customWord}
                onChange={(e) => setCustomWord(e.target.value)}
                placeholder={`Enter a word starting with ${selectedLetter}...`}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                onKeyPress={(e) => e.key === 'Enter' && handleAddCustomWord()}
              />

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Category:</label>
                <div className="flex flex-wrap gap-2">
                  {(['animals', 'colors', 'food', 'other'] as WordCategory[]).map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1 rounded-full text-sm font-bold border-2 transition-colors ${
                        selectedCategory === category
                          ? `${CATEGORY_COLORS[category]} border-current`
                          : `${CATEGORY_COLORS[category]} border-transparent hover:border-current`
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleAddCustomWord}
                disabled={!customWord.trim()}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Add Word
              </button>
            </div>
          </div>

          {/* Predefined Words */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">Choose from Predefined Words</h3>
            {availableWords.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {availableWords.map((word, index) => (
                  <button
                    key={index}
                    onClick={() => handleAddPredefinedWord(word)}
                    className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    <div className="w-8 h-8 flex items-center justify-center">
                      <ImageRenderer image={word.image} alt={word.word} className="max-w-full max-h-full" />
                    </div>
                    <div className="flex-grow text-left">
                      <div className="font-medium capitalize">{word.word}</div>
                      <div className={`text-xs px-2 py-1 rounded-full inline-block ${CATEGORY_COLORS[word.category]}`}>
                        {word.category}
                      </div>
                    </div>
                    <div className="text-blue-500 font-bold">+</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                All predefined words for {selectedLetter} have been selected
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Module0_WordSelection;
