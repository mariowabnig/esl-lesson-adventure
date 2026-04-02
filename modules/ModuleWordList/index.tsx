import React, { useState, useMemo } from 'react';
import { SessionWord, ALPHABET, CATEGORY_COLORS, WordCategory, DEFAULT_ALPHABET_WORDS } from '../../types';
import type { Word } from '../../types';
import ImageRenderer from '../../components/ImageRenderer';

import CategoryAddWord from '../../components/CategoryAddWord';
interface WordListProps {
  sessionVocabulary: SessionWord[];
  onWordsUpdate: (words: SessionWord[]) => void;
}


const ModuleWordList: React.FC<WordListProps> = ({ sessionVocabulary, onWordsUpdate }) => {
  const [viewMode, setViewMode] = useState<'letter' | 'category'>('letter');

  const hasAllLetters = useMemo(() => ALPHABET.every(letter => sessionVocabulary.some(w => w.letter === letter)), [sessionVocabulary]);
  const [addLetter, setAddLetter] = useState<string>('A');
  const [customWord, setCustomWord] = useState('');
  const [customCategory, setCustomCategory] = useState<WordCategory>('other');

  const availablePredefined = useMemo(() => {
    const all = DEFAULT_ALPHABET_WORDS[addLetter] || [];
    const taken = new Set(
      sessionVocabulary
        .filter(w => w.letter === addLetter)
        .map(w => w.word.toLowerCase())
    );
    return all.filter(w => !taken.has(w.word.toLowerCase()));
  }, [addLetter, sessionVocabulary]);

  const handleAddCustom = () => {
    const word = customWord.trim().toLowerCase();
    if (!word) return;
    if (word[0]?.toUpperCase() !== addLetter) {
      alert(`Word must start with ${addLetter}`);
      return;
    }
    const newEntry: SessionWord = { letter: addLetter, word, image: '📝', category: customCategory };
    onWordsUpdate([...sessionVocabulary, newEntry]);
    setCustomWord('');
  };

  const handleAddPredefined = (w: Word) => {
    const newEntry: SessionWord = { letter: addLetter, word: w.word, image: w.image, category: w.category };
    onWordsUpdate([...sessionVocabulary, newEntry]);
  };

  // Group words by letter
  const wordsByLetter = useMemo(() => {
    const grouped: Record<string, SessionWord[]> = {};
    ALPHABET.forEach(letter => {
      grouped[letter] = sessionVocabulary
        .filter(word => word.letter === letter)
        .sort((a, b) => a.word.localeCompare(b.word));
    });
    return grouped;
  }, [sessionVocabulary]);

  // Group words by category
  const wordsByCategory = useMemo(() => {
    const grouped: Record<WordCategory, SessionWord[]> = {
      animals: [],
      colors: [],
      food: [],
      other: []
    };

    sessionVocabulary.forEach(word => {
      grouped[word.category].push(word);
    });

    // Sort words within each category
    Object.keys(grouped).forEach(category => {
      grouped[category as WordCategory].sort((a, b) => a.word.localeCompare(b.word));
    });

    return grouped;
  }, [sessionVocabulary]);

  const handleRemoveWord = (wordToRemove: SessionWord) => {
    onWordsUpdate(sessionVocabulary.filter(word =>
      !(word.letter === wordToRemove.letter && word.word === wordToRemove.word)
    ));
  };

  const handleCategoryChange = (wordToUpdate: SessionWord, newCategory: WordCategory) => {
    onWordsUpdate(sessionVocabulary.map(word =>
      (word.letter === wordToUpdate.letter && word.word === wordToUpdate.word)
        ? { ...word, category: newCategory }
        : word
    ));
  };

  const exportWordList = () => {
    const wordListText = ALPHABET.map(letter => {
      const words = wordsByLetter[letter];
      if (words.length === 0) return null;
      return `${letter}: ${words.map(w => w.word).join(', ')}`;
    }).filter(Boolean).join('\n');

    const blob = new Blob([wordListText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vocabulary-list.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">📋 word list</h1>
        <p className="text-lg text-gray-600">overview of selected vocabulary</p>
        <div className="mt-4 flex justify-center space-x-4">
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
            <span className="font-bold">{sessionVocabulary.length} words total</span>
          </div>
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg">
            <span className="font-bold">{Object.values(wordsByLetter).filter(words => words.length > 0).length} letters covered</span>
          </div>

      {/* Add Words (available after full alphabet coverage) */}
      {hasAllLetters && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-10">
          <h3 className="text-xl font-bold mb-4">Add Words (nachträglich)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Letter</label>
              <select value={addLetter} onChange={(e) => setAddLetter(e.target.value)} className="w-full p-2 border rounded-lg">
                {ALPHABET.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Choose Predefined</label>
              <div className="flex gap-2 flex-wrap">
                {availablePredefined.slice(0, 5).map((w, i) => (
                  <button key={w.word} onClick={() => handleAddPredefined(w)} className="px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded-full text-sm">
                    {w.word}
                  </button>
                ))}
                {availablePredefined.length === 0 && <div className="text-xs text-gray-500">No suggestions</div>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Custom</label>
              <div className="flex gap-2">
                <input value={customWord} onChange={(e) => setCustomWord(e.target.value)} placeholder={`Word starting with ${addLetter}`} className="flex-1 p-2 border rounded-lg" />
                <select value={customCategory} onChange={(e) => setCustomCategory(e.target.value as WordCategory)} className="p-2 border rounded-lg">
                  {(['animals', 'colors', 'food', 'other'] as WordCategory[]).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button onClick={handleAddCustom} className="bg-green-500 hover:bg-green-600 text-white font-bold px-3 py-2 rounded-lg">Add</button>
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2">This input only appears after you have added at least one word for each letter.</div>
        </div>
      )}

            <button onClick={exportWordList}
            className="bg-purple-500 hover:bg-purple-600 text-white font-bold px-4 py-2 rounded-lg transition-colors"
          >
            📄 Export List
          </button>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-lg shadow-md p-1 flex">
          <button
            onClick={() => setViewMode('letter')}
            className={`px-6 py-2 rounded-lg font-bold transition-colors ${
              viewMode === 'letter'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            by letter
          </button>
          <button
            onClick={() => setViewMode('category')}
            className={`px-6 py-2 rounded-lg font-bold transition-colors ${
              viewMode === 'category'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            by category
          </button>
        </div>
      </div>

      {sessionVocabulary.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-gray-600 mb-4">no words selected yet</h2>
          <p className="text-gray-500 mb-6">Start by selecting words in the Word Selection section</p>
        </div>
      ) : viewMode === 'letter' ? (
        /* Words by Letter View */
        <div className="space-y-6">
          {ALPHABET.map(letter => {
            const words = wordsByLetter[letter];
            if (words.length === 0) return null;

            return (
              <div key={letter} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <div className="text-3xl font-bold text-blue-600 mr-4 w-12">{letter}</div>
                  <div className="text-lg font-bold text-gray-700">
                    {words.length} word{words.length !== 1 ? 's' : ''}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {words.map((word, index) => (
                    <div key={`${word.word}-${index}`} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 group">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 flex items-center justify-center">
                          <ImageRenderer image={word.image} alt={word.word} className="max-w-full max-h-full" />
                        </div>
                        <div>
                          <div className="font-medium capitalize">{word.word}</div>
                          <select
                            value={word.category}
                            onChange={(e) => handleCategoryChange(word, e.target.value as WordCategory)}
                            className={`text-xs px-2 py-1 rounded-full border-0 ${CATEGORY_COLORS[word.category]} opacity-70 group-hover:opacity-100 transition-opacity`}
                          >
                            <option value="animals">animals</option>
                            <option value="colors">colors</option>
                            <option value="food">food</option>
                            <option value="other">other</option>
                          </select>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveWord(word)}
                        className="text-red-500 hover:text-red-700 font-bold opacity-0 group-hover:opacity-100 transition-opacity"
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
        </div>
      ) : (
        /* Words by Category View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(wordsByCategory).map(([category, words]) => (
            <div key={category} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className={`text-lg font-bold px-3 py-1 rounded-lg ${CATEGORY_COLORS[category as WordCategory]}`}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </div>
                <div className="ml-3 text-sm text-gray-600">
                  {words.length} word{words.length !== 1 ? 's' : ''}
                </div>
              </div>

              {words.length > 0 ? (
                <div className="space-y-3">
                  {words.map((word, index) => (
                    <div key={`${word.word}-${index}`} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 group">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 flex items-center justify-center">
                          <ImageRenderer image={word.image} alt={word.word} className="max-w-full max-h-full" />
                        </div>
                        <div>
                          <div className="font-medium capitalize">{word.word}</div>
                          <div className="text-xs text-gray-500">Letter: {word.letter}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveWord(word)}
                        className="text-red-500 hover:text-red-700 font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove word"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              ) : (

                <div className="text-center text-gray-500 py-8">
                  no words in {category} yet
                </div>
              )}
            </div>
          ))}

	            {/* Quick add per category */}
	            <div className="text-center mt-4">
	              {(['animals','colors','food','other'] as WordCategory[]).map((cat) => (
	                <div key={cat} className="inline-block m-1">
	                  <CategoryAddWord
	                    category={cat}
	                    onAdd={(word) => onWordsUpdate([...sessionVocabulary, word])}
	                  />
	                </div>
	              ))}
	            </div>

        </div>
      )}

      {/* Statistics Section */}
      {sessionVocabulary.length > 0 && (
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-center mb-6">📊 Vocabulary Statistics</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Category Breakdown */}
            <div className="text-center">
              <h3 className="font-bold text-gray-700 mb-3">By Category</h3>
              <div className="space-y-2">
                {Object.entries(wordsByCategory).map(([category, words]) => (
                  <div key={category} className={`px-3 py-2 rounded-lg ${CATEGORY_COLORS[category as WordCategory]}`}>
                    <div className="font-bold capitalize">{category}</div>
                    <div className="text-sm">{words.length} words</div>
                  </div>
                ))}

              </div>
            </div>

            {/* Letter Coverage */}
            <div className="text-center">
              <h3 className="font-bold text-gray-700 mb-3">Letter Coverage</h3>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {Object.values(wordsByLetter).filter(words => words.length > 0).length}/26
              </div>
              <div className="text-sm text-gray-600">letters covered</div>
            </div>

            {/* Average Words per Letter */}
            <div className="text-center">
              <h3 className="font-bold text-gray-700 mb-3">Average per Letter</h3>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {(sessionVocabulary.length / Math.max(1, Object.values(wordsByLetter).filter(words => words.length > 0).length)).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">words per letter</div>
            </div>

            {/* Readiness Status */}
            <div className="text-center">
              <h3 className="font-bold text-gray-700 mb-3">Game Readiness</h3>
              <div className={`text-3xl font-bold mb-2 ${sessionVocabulary.length >= 10 ? 'text-green-600' : 'text-orange-600'}`}>
                {sessionVocabulary.length >= 10 ? '✅' : '⏳'}
              </div>
              <div className="text-sm text-gray-600">
                {sessionVocabulary.length >= 10 ? 'Ready for games!' : `Need ${10 - sessionVocabulary.length} more words`}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModuleWordList;
