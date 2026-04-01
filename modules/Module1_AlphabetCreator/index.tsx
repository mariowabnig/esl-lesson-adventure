import React, { useState, useMemo } from 'react';
import type { SessionWord, Word, AlphabetData, WordCategory } from '../../types';
import { ALPHABET, DEFAULT_ALPHABET_WORDS, MIN_WORDS_FOR_GAMES, WORD_CATEGORIES, CATEGORY_COLORS, GERMAN_PRONUNCIATIONS } from '../../constants';
import ModuleContainer from '../../components/ModuleContainer';
import ImageSelectionModal from './ImageSelectionModal';
import WordGenerator from './WordGenerator';
import ImageRenderer from '../../components/ImageRenderer';


interface Module1AlphabetCreatorProps {
  onSetupComplete: (vocabulary: SessionWord[]) => void;
}

const Module1AlphabetCreator: React.FC<Module1AlphabetCreatorProps> = ({ onSetupComplete }) => {
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [sessionVocabularyMap, setSessionVocabularyMap] = useState<Record<string, SessionWord>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allWords, setAllWords] = useState<AlphabetData>(DEFAULT_ALPHABET_WORDS);
  const [selectedCategory, setSelectedCategory] = useState<WordCategory | 'all'>('all');
  const [viewMode, setViewMode] = useState<'alphabet' | 'category'>('alphabet');
  const [pronunciations, setPronunciations] = useState<Record<string, string>>(GERMAN_PRONUNCIATIONS);

  const currentLetter = ALPHABET[currentLetterIndex];
  const selectedWord = sessionVocabularyMap[currentLetter];

  const sessionVocabulary = useMemo(() => Object.values(sessionVocabularyMap), [sessionVocabularyMap]);
  const wordsSelectedCount = sessionVocabulary.length;



  const handleNext = () => {
    setCurrentLetterIndex((prev) => (prev + 1) % ALPHABET.length);
  };

  const handlePrev = () => {
    setCurrentLetterIndex((prev) => (prev - 1 + ALPHABET.length) % ALPHABET.length);
  };

  const handleSelectWord = (word: SessionWord) => {
    const selected: SessionWord = { ...word, predefined: true };
    setSessionVocabularyMap((prev) => ({ ...prev, [word.letter]: selected }));
    setIsModalOpen(false);
  };

  const handleAddWord = (newWord: Word) => {
    // Determine the letter for this word
    const firstLetter = newWord.word.charAt(0).toUpperCase();

    // Validate that it's a valid letter
    if (!ALPHABET.includes(firstLetter)) {
      alert(`Word "${newWord.word}" must start with a letter A-Z`);
      return;
    }

    // Add to available words for future use
    setAllWords(prev => {
        const letterWords = prev[firstLetter] || [];
        const updatedLetterWords = [...letterWords, newWord];
        return { ...prev, [firstLetter]: updatedLetterWords };
    });

    // Add to session vocabulary (allow multiple words per letter)
    const sessionWord: SessionWord = {
      ...newWord,
      letter: firstLetter,
      predefined: false
    };

    // Create a unique key for multiple words per letter
    const existingKeys = Object.keys(sessionVocabularyMap).filter(key => key.startsWith(firstLetter));
    const newKey = existingKeys.length === 0 ? firstLetter : `${firstLetter}_${existingKeys.length}`;

    setSessionVocabularyMap(prev => ({ ...prev, [newKey]: sessionWord }));
  };

  const handleRemoveWord = (key: string) => {
    setSessionVocabularyMap(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  const handleCategoryChange = (key: string, newCategory: WordCategory) => {
    setSessionVocabularyMap(prev => ({
      ...prev,
      [key]: { ...prev[key], category: newCategory }
    }));
  };

  const filteredSessionWords = useMemo(() => {
    if (selectedCategory === 'all') return sessionVocabulary;
    return sessionVocabulary.filter(word => word.category === selectedCategory);
  }, [sessionVocabulary, selectedCategory]);

  const randomlyPopulateAll = () => {
    const newVocabulary: Record<string, SessionWord> = {};
    ALPHABET.forEach(letter => {
      const availableWords = allWords[letter] || [];
      if (availableWords.length > 0) {
        const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
        newVocabulary[letter] = { letter, ...randomWord };
      }
    });
    setSessionVocabularyMap(newVocabulary);
  };

  return (
    <ModuleContainer title="Create Your Word List">
      <div className="flex flex-col h-full">
        {/* View Mode Toggle */}
        <div className="flex justify-center mb-4">
          <div className="bg-gray-200 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('alphabet')}
              className={`px-4 py-2 rounded-md font-bold transition-colors ${
                viewMode === 'alphabet' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-300'
              }`}
            >
              Alphabet View
            </button>
            <button
              onClick={() => setViewMode('category')}
              className={`px-4 py-2 rounded-md font-bold transition-colors ${
                viewMode === 'category' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-300'
              }`}
            >
              Category View
            </button>
          </div>
        </div>

        {viewMode === 'alphabet' ? (
          /* Alphabet View - Simple List */
          <div className="flex flex-col flex-grow">
            <div className="w-full">
              {/* Words Organized by Letter */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-xl font-bold mb-4">All Words ({sessionVocabulary.length})</h3>
                <div className="space-y-4">
                  {ALPHABET.map(letter => {
                    const wordsForLetter = Object.entries(sessionVocabularyMap)
                      .filter(([key, word]) => word.letter === letter)
                      .sort(([, a], [, b]) => a.word.localeCompare(b.word));

                    if (wordsForLetter.length === 0) return null;

                    return (
                      <div key={letter} className="border-l-4 border-blue-500 pl-4">
                        <div className="flex items-center mb-2">
                          <div className="text-2xl font-bold text-blue-600 mr-3">{letter}</div>
                          <div className="text-sm text-gray-500">({wordsForLetter.length} words)</div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {wordsForLetter.map(([key, word]) => (
                            <div key={key} className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2 hover:bg-gray-200 transition-colors">
                              <div className="text-sm font-medium">{word.word}</div>
                              <div className={`text-xs px-2 py-1 rounded-full ${CATEGORY_COLORS[word.category]}`}>
                                {word.category}
                              </div>
                              <button
                                onClick={() => handleRemoveWord(key)}
                                className="text-red-500 hover:text-red-700 text-xs ml-1"
                                title="Remove word"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {sessionVocabulary.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      No words added yet. Use the form below to add words.
                    </div>
                  )}
                </div>
              </div>

              {/* Add Words Section */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-xl font-bold mb-4">Add New Words</h3>
                <div className="space-y-4">
                  <WordGenerator letter="" onAddWord={handleAddWord} />
                  <div className="flex justify-center gap-3 flex-wrap">
                    <button
                      onClick={randomlyPopulateAll}
                      className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors"
                      title="Randomly select one word for each letter"
                    >
                      🎲 Add Random Words
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Summary */}
            <div className="w-full bg-white rounded-lg shadow-md p-4 mt-6">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-slate-600">Progress: {wordsSelectedCount} / {ALPHABET.length} words</span>
                {wordsSelectedCount >= MIN_WORDS_FOR_GAMES && <span className="text-green-600 font-bold">✅ Ready for games!</span>}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(wordsSelectedCount / ALPHABET.length) * 100}%` }}
                ></div>
              </div>

              {wordsSelectedCount >= MIN_WORDS_FOR_GAMES && (
                <button
                  onClick={() => onSetupComplete(sessionVocabulary)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl py-3 px-6 rounded-lg shadow-lg transition-colors"
                >
                  🎮 Ready to Play Games!
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Category View */
          <div className="flex-grow">
            {/* Category Filter */}
            <div className="flex justify-center mb-6">
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                    selectedCategory === 'all' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  All ({sessionVocabulary.length})
                </button>
                {WORD_CATEGORIES.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg font-bold transition-colors border-2 ${
                      selectedCategory === category
                        ? `${CATEGORY_COLORS[category]} border-current`
                        : `${CATEGORY_COLORS[category]} border-transparent hover:border-current`
                    }`}
                  >
                    {category} ({Object.values(sessionVocabularyMap).filter(word => word.category === category).length})
                  </button>
                ))}
              </div>
            </div>

            {/* Add Word in Category View */}
            <div className="flex justify-center mb-6">
              <div className="bg-white rounded-lg shadow-md p-4">
                <h4 className="font-bold text-center mb-3">Add New Word</h4>
                <WordGenerator letter="" onAddWord={handleAddWord} />
              </div>
            </div>

            {/* Category Columns Layout */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold mb-6 text-center">Words by Category</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {WORD_CATEGORIES.map(category => {
                  const categoryWords = Object.entries(sessionVocabularyMap)
                    .filter(([key, word]) => word.category === category)
                    .sort(([, a], [, b]) => a.word.localeCompare(b.word));

                  return (
                    <div key={category} className={`border-2 rounded-lg p-4 ${CATEGORY_COLORS[category]} border-opacity-50`}>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-lg capitalize">{category}</h4>
                        <span className="text-sm text-gray-600">({categoryWords.length})</span>
                      </div>

                      <div className="space-y-2 mb-4 min-h-[200px]">
                        {categoryWords.map(([key, word]) => (
                          <div key={key} className="flex items-center justify-between bg-white bg-opacity-70 rounded px-3 py-2 group">
                            <div className="flex items-center space-x-2">
                              <div className="text-sm font-bold text-blue-600">{word.letter}</div>
                              <div className="text-sm font-medium">{word.word}</div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <select
                                value={word.category}
                                onChange={(e) => handleCategoryChange(key, e.target.value as WordCategory)}
                                className="text-xs border border-gray-300 rounded px-1 py-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Change category"
                              >
                                {WORD_CATEGORIES.map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleRemoveWord(key)}
                                className="text-red-500 hover:text-red-700 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Remove word"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                        {categoryWords.length === 0 && (
                          <div className="text-center text-gray-500 py-8 text-sm">
                            No {category} words yet
                          </div>
                        )}
                      </div>

                      <div className="border-t pt-3">
                        <WordGenerator
                          letter=""
                          onAddWord={(word) => handleAddWord({...word, category})}
                          defaultCategory={category}
                          compact={true}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Progress and Finish Button */}
            <div className="mt-8 text-center">
              <div className="flex justify-center items-center mb-4">
                <span className="font-bold text-slate-600 mr-4">Total Words: {wordsSelectedCount}</span>
                {wordsSelectedCount >= MIN_WORDS_FOR_GAMES && <span className="text-green-600 font-bold">✅ Ready for games!</span>}
              </div>

              {wordsSelectedCount >= MIN_WORDS_FOR_GAMES && (
                <button
                  onClick={() => onSetupComplete(sessionVocabulary)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl py-3 px-8 rounded-lg shadow-lg transition-colors"
                >
                  🎮 Ready to Play Games!
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <ImageSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        letter={currentLetter}
        words={allWords[currentLetter] || []}
        onSelect={handleSelectWord}
      />
    </ModuleContainer>
  );
};

export default Module1AlphabetCreator;