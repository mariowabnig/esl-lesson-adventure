import React, { useState, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';

interface NumbersModuleProps {
  onBack?: () => void;
}

const NUMBER_WORDS = [
  { number: 1, word: 'one', pronunciation: 'wʌn' },
  { number: 2, word: 'two', pronunciation: 'tuː' },
  { number: 3, word: 'three', pronunciation: 'θriː' },
  { number: 4, word: 'four', pronunciation: 'fɔːr' },
  { number: 5, word: 'five', pronunciation: 'faɪv' },
  { number: 6, word: 'six', pronunciation: 'sɪks' },
  { number: 7, word: 'seven', pronunciation: 'ˈsevən' },
  { number: 8, word: 'eight', pronunciation: 'eɪt' },
  { number: 9, word: 'nine', pronunciation: 'naɪn' },
  { number: 10, word: 'ten', pronunciation: 'ten' },
  { number: 11, word: 'eleven', pronunciation: 'ɪˈlevən' },
  { number: 12, word: 'twelve', pronunciation: 'twelv' },
  { number: 13, word: 'thirteen', pronunciation: 'ˌθɜːrˈtiːn' },
  { number: 14, word: 'fourteen', pronunciation: 'ˌfɔːrˈtiːn' },
  { number: 15, word: 'fifteen', pronunciation: 'ˌfɪfˈtiːn' },
  { number: 16, word: 'sixteen', pronunciation: 'ˌsɪksˈtiːn' },
  { number: 17, word: 'seventeen', pronunciation: 'ˌsevənˈtiːn' },
  { number: 18, word: 'eighteen', pronunciation: 'ˌeɪˈtiːn' },
  { number: 19, word: 'nineteen', pronunciation: 'ˌnaɪnˈtiːn' },
  { number: 20, word: 'twenty', pronunciation: 'ˈtwenti' },
  { number: 21, word: 'twenty-one', pronunciation: 'ˈtwenti wʌn' },
  { number: 22, word: 'twenty-two', pronunciation: 'ˈtwenti tuː' },
  { number: 23, word: 'twenty-three', pronunciation: 'ˈtwenti θriː' },
  { number: 24, word: 'twenty-four', pronunciation: 'ˈtwenti fɔːr' },
  { number: 25, word: 'twenty-five', pronunciation: 'ˈtwenti faɪv' }
];

const ModuleNumbers: React.FC<NumbersModuleProps> = ({ onBack }) => {
  const { settings } = useSettings();
  const [maxNumber, setMaxNumber] = useState(12);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [practiceMode, setPracticeMode] = useState<'view' | 'listen' | 'quiz'>('view');
  const [quizAnswer, setQuizAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  const currentNumbers = NUMBER_WORDS.slice(0, maxNumber);

  const speakNumber = (text: string) => {
    if (!settings.audio.global || !settings.audio.numbers) return;
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const handleQuizSubmit = () => {
    if (!selectedNumber) return;
    
    const correctAnswer = NUMBER_WORDS.find(n => n.number === selectedNumber)?.word.toLowerCase();
    const userAnswer = quizAnswer.toLowerCase().trim();
    const isCorrect = userAnswer === correctAnswer;
    
    setTotalQuestions(prev => prev + 1);
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    }
    
    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
      setQuizAnswer('');
      setSelectedNumber(null);
    }, 2000);
  };

  const startRandomQuiz = () => {
    const randomIndex = Math.floor(Math.random() * currentNumbers.length);
    setSelectedNumber(currentNumbers[randomIndex].number);
    setPracticeMode('quiz');
    setQuizAnswer('');
    setShowFeedback(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">🔢 Numbers Learning</h1>
        <p className="text-lg text-gray-600">Learn English numbers with interactive practice</p>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-wrap items-center justify-center gap-6">
          <div className="flex items-center space-x-3">
            <label className="font-bold text-gray-700">Range:</label>
            <select
              value={maxNumber}
              onChange={(e) => setMaxNumber(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value={12}>1-12 (Basic)</option>
              <option value={25}>1-25 (Extended)</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-3">
            <label className="font-bold text-gray-700">Mode:</label>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setPracticeMode('view')}
                className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                  practiceMode === 'view' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                👀 View
              </button>
              {settings.audio.global && settings.audio.numbers && (
                <button
                  onClick={() => setPracticeMode('listen')}
                  className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                    practiceMode === 'listen' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  🔊 Listen
                </button>
              )}
              <button
                onClick={startRandomQuiz}
                className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                  practiceMode === 'quiz' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                🎯 Quiz
              </button>
            </div>
          </div>

          {totalQuestions > 0 && (
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg">
              <span className="font-bold">Score: {correctAnswers}/{totalQuestions}</span>
              <span className="ml-2">({Math.round((correctAnswers / totalQuestions) * 100)}%)</span>
            </div>
          )}
        </div>
      </div>

      {/* Quiz Mode */}
      {practiceMode === 'quiz' && selectedNumber && (
        <div className="bg-white rounded-lg shadow-md p-8 mb-8 text-center">
          <h2 className="text-2xl font-bold mb-6">Write the English word for this number:</h2>
          <div className="text-8xl font-bold text-blue-600 mb-6">{selectedNumber}</div>
          
          {!showFeedback ? (
            <div className="max-w-md mx-auto">
              <input
                type="text"
                value={quizAnswer}
                onChange={(e) => setQuizAnswer(e.target.value)}
                placeholder="Type the English word..."
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg mb-4"
                onKeyPress={(e) => e.key === 'Enter' && handleQuizSubmit()}
                autoFocus
              />
              <button
                onClick={handleQuizSubmit}
                disabled={!quizAnswer.trim()}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Submit Answer
              </button>
            </div>
          ) : (
            <div className="max-w-md mx-auto">
              {quizAnswer.toLowerCase().trim() === NUMBER_WORDS.find(n => n.number === selectedNumber)?.word.toLowerCase() ? (
                <div className="text-green-600 text-2xl font-bold mb-4">✅ Correct!</div>
              ) : (
                <div className="text-red-600 text-2xl font-bold mb-4">
                  ❌ Incorrect
                  <div className="text-lg mt-2">
                    Correct answer: <span className="text-blue-600">{NUMBER_WORDS.find(n => n.number === selectedNumber)?.word}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Number Cards Grid */}
      {practiceMode !== 'quiz' && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {currentNumbers.map(({ number, word, pronunciation }) => (
            <div
              key={number}
              className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow cursor-pointer transform hover:scale-105"
              onClick={() => practiceMode === 'listen' && speakNumber(word)}
            >
              <div className="text-4xl font-bold text-blue-600 mb-3">{number}</div>
              
              {practiceMode === 'view' && (
                <>
                  <div className="text-xl font-bold text-gray-800 mb-2">{word}</div>
                  <div className="text-sm text-gray-500 mb-3">/{pronunciation}/</div>
                </>
              )}
              
              {settings.audio.global && settings.audio.numbers && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    speakNumber(word);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                  title="Listen to pronunciation"
                >
                  🔊 Play
                </button>
              )}
              
              {practiceMode === 'view' && settings.audio.global && settings.audio.numbers && (
                <div className="mt-3 text-xs text-gray-600">
                  Click 🔊 to hear pronunciation
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-12 bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-bold text-blue-800 mb-4">📚 How to Use Numbers Learning</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <h3 className="font-bold text-blue-700 mb-2">👀 View Mode</h3>
            <p className="text-blue-600">See numbers with their English words and pronunciation guides. Click 🔊 to hear each number spoken aloud.</p>
          </div>
          <div>
            <h3 className="font-bold text-blue-700 mb-2">🔊 Listen Mode</h3>
            <p className="text-blue-600">Practice listening! Click on any number card to hear its pronunciation. Perfect for audio learning.</p>
          </div>
          <div>
            <h3 className="font-bold text-blue-700 mb-2">🎯 Quiz Mode</h3>
            <p className="text-blue-600">Test your knowledge! See a number and type the English word. Track your progress with the score counter.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleNumbers;
