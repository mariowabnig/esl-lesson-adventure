import React, { useState } from 'react';
import { useSessionVocabulary } from '../../contexts/SessionVocabularyContext';
import ModuleContainer from '../../components/ModuleContainer';
import ImageRenderer from '../../components/ImageRenderer';
import { ALPHABET, GERMAN_PRONUNCIATIONS } from '../../constants';
import { useSettings } from '../../contexts/SettingsContext';

const Module6LetterExplanation: React.FC = () => {
  const { sessionVocabulary } = useSessionVocabulary();
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const { settings } = useSettings();

  const currentLetter = ALPHABET[currentLetterIndex];
  const currentWord = sessionVocabulary.find(word => word.letter === currentLetter);

  const handleNext = () => {
    setCurrentLetterIndex((prev) => (prev + 1) % ALPHABET.length);
  };

  const handlePrev = () => {
    setCurrentLetterIndex((prev) => (prev - 1 + ALPHABET.length) % ALPHABET.length);
  };

  const handleAutoPlay = () => {
    setIsAutoPlay(!isAutoPlay);
  };

  // Auto-advance every 5 seconds when autoplay is on
  React.useEffect(() => {
    if (isAutoPlay) {
      const interval = setInterval(() => {
        setCurrentLetterIndex((prev) => (prev + 1) % ALPHABET.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlay]);

  const speakLetter = () => {
    if (!settings.audio.global) return;
    if ('speechSynthesis' in window && currentWord) {
      const utterance = new SpeechSynthesisUtterance(
        `${currentLetter} is for ${currentWord.word}`
      );
      utterance.rate = 0.8;
      utterance.pitch = 1.1;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <ModuleContainer title="Word List Simple">
      <div className="flex flex-col h-full">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold">Progress: {currentLetterIndex + 1} / {ALPHABET.length}</span>
            <span className="text-sm text-gray-600">
              {sessionVocabulary.filter(w => ALPHABET.indexOf(w.letter) <= currentLetterIndex).length} words explained
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-500 h-3 rounded-full transition-all duration-500" 
              style={{ width: `${((currentLetterIndex + 1) / ALPHABET.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Alphabet Navigation */}
        <div className="flex justify-center mb-6">
          <div className="grid grid-cols-13 gap-1 bg-gray-100 p-2 rounded-lg">
            {ALPHABET.map((letter, index) => {
              const hasWord = sessionVocabulary.some(w => w.letter === letter);
              return (
                <button
                  key={letter}
                  onClick={() => setCurrentLetterIndex(index)}
                  className={`w-8 h-8 text-sm font-bold rounded transition-colors ${
                    index === currentLetterIndex
                      ? 'bg-blue-500 text-white'
                      : hasWord
                      ? 'bg-green-200 text-green-800 hover:bg-green-300'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                  disabled={!hasWord}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow flex items-center justify-center">
          {currentWord ? (
            <div className="text-center bg-white rounded-2xl shadow-lg p-12 max-w-2xl">
              <div className="text-9xl font-display text-blue-500 mb-4">{currentLetter}</div>
              
              <div className="mb-6">
                <div className="text-lg text-gray-600 mb-2">
                  German pronunciation: <span className="font-bold">"{GERMAN_PRONUNCIATIONS[currentLetter]}"</span>
                </div>
                <div className="text-lg text-gray-600">
                  English pronunciation: <span className="font-bold">"{currentLetter.toLowerCase()}"</span>
                </div>
              </div>

              <div className="my-8 h-48 w-48 mx-auto bg-gray-50 rounded-lg shadow-md flex items-center justify-center">
                <ImageRenderer image={currentWord.image} alt={currentWord.word} className="w-40 h-40 object-contain" />
              </div>

              <div className="text-4xl font-bold text-slate-700 mb-4">
                {currentLetter} is for <span className="text-blue-600 capitalize">{currentWord.word}</span>
              </div>

              <div className={`inline-block px-4 py-2 rounded-full text-sm font-bold border-2 mb-6 ${
                currentWord.category === 'food' ? 'bg-orange-100 border-orange-300 text-orange-800' :
                currentWord.category === 'colors' ? 'bg-purple-100 border-purple-300 text-purple-800' :
                currentWord.category === 'animals' ? 'bg-green-100 border-green-300 text-green-800' :
                'bg-gray-100 border-gray-300 text-gray-800'
              }`}>
                Category: {currentWord.category}
              </div>

              {settings.audio.global && (
                <button
                  onClick={speakLetter}
                  className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-transform transform hover:scale-105"
                >
                  🔊 Say it aloud
                </button>
              )}
            </div>
          ) : (
            <div className="text-center bg-gray-100 rounded-2xl p-12">
              <div className="text-9xl font-display text-gray-400 mb-4">{currentLetter}</div>
              <div className="text-2xl text-gray-500">No word selected for this letter</div>
              <div className="text-lg text-gray-400 mt-2">
                German: "{GERMAN_PRONUNCIATIONS[currentLetter]}"
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-center items-center space-x-4 mt-8">
          <button 
            onClick={handlePrev} 
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-transform transform hover:scale-105"
          >
            ← Previous
          </button>
          
          <button
            onClick={handleAutoPlay}
            className={`font-bold py-3 px-6 rounded-full shadow-lg transition-transform transform hover:scale-105 ${
              isAutoPlay 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isAutoPlay ? '⏸️ Stop Auto' : '▶️ Auto Play'}
          </button>
          
          <button 
            onClick={handleNext} 
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-transform transform hover:scale-105"
          >
            Next →
          </button>
        </div>
      </div>
    </ModuleContainer>
  );
};

export default Module6LetterExplanation;
