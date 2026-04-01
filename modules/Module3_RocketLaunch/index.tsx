import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useSessionVocabulary } from '../../contexts/SessionVocabularyContext';
import { useGameFilters } from '../../contexts/GameFiltersContext';
import ModuleContainer from '../../components/ModuleContainer';
import { ALPHABET, ROCKET_PARTS, MAX_MISTAKES, MIN_MISTAKES } from '../../constants';

const RocketDrawing: React.FC<{ partsDrawn: number }> = ({ partsDrawn }) => {
    return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
            {ROCKET_PARTS.slice(0, partsDrawn).map((part, index) => (
                <path key={index} d={part} stroke="#334155" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            ))}
        </svg>
    );
};

const WordDisplay: React.FC<{ word: string; guessedLetters: string[] }> = ({ word, guessedLetters }) => {
    return (
        <div className="flex justify-center space-x-2 sm:space-x-4">
            {word.split('').map((letter, index) => (
                <div key={index} className="w-12 h-16 sm:w-16 sm:h-20 bg-sky-100 rounded-lg flex items-center justify-center font-display text-4xl sm:text-5xl text-slate-700">
                    {guessedLetters.includes(letter.toUpperCase()) ? letter.toUpperCase() : ''}
                </div>
            ))}
        </div>
    );
};

const Keyboard: React.FC<{ onGuess: (letter: string) => void; guessedLetters: string[] }> = ({ onGuess, guessedLetters }) => {
    return (
        <div className="grid grid-cols-7 sm:grid-cols-9 gap-2">
            {ALPHABET.map(letter => {
                const isGuessed = guessedLetters.includes(letter);
                return (
                    <button
                        key={letter}
                        onClick={() => onGuess(letter)}
                        disabled={isGuessed}
                        className={`font-bold py-3 rounded-lg text-xl transition-colors ${
                            isGuessed ? 'bg-gray-300 text-gray-500' : 'bg-blue-200 hover:bg-blue-300 text-blue-800'
                        }`}
                    >
                        {letter}
                    </button>
                );
            })}
        </div>
    );
};

const SettingsPanel: React.FC<{
    mistakes: number;
    setMistakes: (m: number) => void;
    wordBankSize: number;
    setWordBankSize: (s: number) => void;
    minWordLength: number;
    setMinWordLength: (n: number) => void;
    onRestart: () => void;
    availableWordsCount: number;
}> = ({ mistakes, setMistakes, wordBankSize, setWordBankSize, minWordLength, setMinWordLength, onRestart, availableWordsCount }) => (
    <div className="bg-sky-100 p-3 rounded-lg flex flex-wrap items-center justify-center gap-4 text-sm">
        <div className="flex flex-col items-center">
            <label className="font-bold text-gray-700 mb-1">Available Words:</label>
            <span className="text-lg font-bold text-blue-600">{availableWordsCount}</span>
            <span className="text-xs text-gray-600">words match filters</span>
        </div>
        <div className="flex flex-col items-center">
            <label className="font-bold text-gray-700 mb-1">Word Bank Size: {wordBankSize}</label>
            <input
                type="range"
                min={3}
                max={Math.min(10, availableWordsCount)}
                value={wordBankSize}
                onChange={(e) => setWordBankSize(Number(e.target.value))}
                className="w-32"
            />
            <div className="flex justify-between w-32 text-xs text-gray-600">
                <span>3</span>
                <span>{Math.min(10, availableWordsCount)}</span>
            </div>
        </div>
        <div className="flex flex-col items-center">
            <label className="font-bold text-gray-700 mb-1">Min Word Length: {minWordLength}</label>
            <input
                type="range"
                min={1}
                max={10}
                value={minWordLength}
                onChange={(e) => setMinWordLength(Number(e.target.value))}
                className="w-32"
            />
            <div className="flex justify-between w-32 text-xs text-gray-600">
                <span>1</span>
                <span>10</span>
            </div>
        </div>
        <div className="flex flex-col items-center">
            <label className="font-bold text-gray-700 mb-1">Rocket Parts: {mistakes}</label>
            <input
                type="range"
                min={MIN_MISTAKES}
                max={MAX_MISTAKES}
                value={mistakes}
                onChange={(e) => setMistakes(Number(e.target.value))}
                className="w-32"
            />
            <div className="flex justify-between w-32 text-xs text-gray-600">
                <span>Difficult ({MIN_MISTAKES})</span>
                <span>Easy ({MAX_MISTAKES})</span>
            </div>
        </div>
        <div className="flex flex-col items-center">
            <button onClick={onRestart} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                New Word
            </button>
            <span className="text-xs text-gray-600 mt-1">Get a different word</span>
        </div>
    </div>
);

const Module3RocketLaunch: React.FC = () => {
    const { sessionVocabulary } = useSessionVocabulary();
    const { gameFilters } = useGameFilters();
    const [secretWord, setSecretWord] = useState('');
    const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
    const [mistakesAllowed, setMistakesAllowed] = useState(MAX_MISTAKES);
    const [wordBankSize, setWordBankSize] = useState(5);
    const [wordBank, setWordBank] = useState<string[]>([]);
    const [wordLength, setWordLength] = useState<'all' | 'short' | 'medium' | 'long'>('all');
    const [minWordLength, setMinWordLength] = useState<number>(1);

    // Filter words based on game filters
    const filteredVocabulary = useMemo(() => {
        let filtered = sessionVocabulary;

        if (gameFilters.category !== 'all') {
            filtered = filtered.filter(word => word.category === gameFilters.category);
        }

        // Filter by max word length if provided
        if (gameFilters.maxWordLength != null) {
            filtered = filtered.filter(word => word.word.length <= gameFilters.maxWordLength!);
        }

        // Filter by vocabulary source
        if (gameFilters.vocabSource === 'alphabet') {
            filtered = filtered.filter(word => word.predefined === true);
        } else if (gameFilters.vocabSource === 'custom') {
            filtered = filtered.filter(word => word.predefined !== true);
        }

        return filtered;
    }, [sessionVocabulary, gameFilters]);

    const incorrectGuesses = useMemo(() => guessedLetters.filter(l => !secretWord.toUpperCase().includes(l)), [guessedLetters, secretWord]);
    const isGameWon = useMemo(() => secretWord && secretWord.split('').every(l => guessedLetters.includes(l.toUpperCase())), [secretWord, guessedLetters]);
    const isGameOver = useMemo(() => incorrectGuesses.length >= mistakesAllowed, [incorrectGuesses, mistakesAllowed]);
    
    // Get filtered words based on length preference (additional to game filters)
    const getFilteredWords = useCallback(() => {
        if (filteredVocabulary.length === 0) return [];

        let filtered = filteredVocabulary.filter(w => w.word.length >= minWordLength);
        if (wordLength === 'short') {
            filtered = filtered.filter(w => w.word.length <= 4);
        } else if (wordLength === 'medium') {
            filtered = filtered.filter(w => w.word.length >= 5 && w.word.length <= 6);
        } else if (wordLength === 'long') {
            filtered = filtered.filter(w => w.word.length >= 7);
        }

        // Fallback to filtered vocabulary if length filter yields no results
        return filtered.length > 0 ? filtered : filteredVocabulary;
    }, [filteredVocabulary, wordLength]);

    const availableWords = useMemo(() => getFilteredWords(), [getFilteredWords]);

    const startNewGame = useCallback(() => {
        if (availableWords.length > 0) {
            const selectedWord = availableWords[Math.floor(Math.random() * availableWords.length)];
            // Keep proper capitalization for proper nouns like 'Earth', otherwise uppercase for game display
            const newWord = selectedWord.word === 'Earth' ? 'EARTH' : selectedWord.word.toUpperCase();
            setSecretWord(newWord);
            setGuessedLetters([]);
            setWordBank([]);
        }
    }, [availableWords]);

    useEffect(() => {
        startNewGame();
    }, [sessionVocabulary, startNewGame]);

    const handleGuess = (letter: string) => {
        if (isGameOver || isGameWon) return;
        setGuessedLetters(prev => [...prev, letter]);
    };
    
    const showVowelHint = () => {
        const vowels = ['A', 'E', 'I', 'O', 'U'];
        const newGuesses = vowels.filter(v => secretWord.includes(v) && !guessedLetters.includes(v));
        setGuessedLetters(prev => [...new Set([...prev, ...newGuesses])]);
    };
    
    const showWordBank = () => {
        if (availableWords.length === 0) return;

        let options = [secretWord];
        const otherWords = availableWords.filter(w => w.word.toUpperCase() !== secretWord);

        // Use available words, even if less than desired wordBankSize
        const actualBankSize = Math.min(wordBankSize, availableWords.length);

        while(options.length < actualBankSize && otherWords.length > 0) {
            const randomIndex = Math.floor(Math.random() * otherWords.length);
            options.push(otherWords.splice(randomIndex, 1)[0].word.toUpperCase());
        }
        setWordBank(options.sort(() => Math.random() - 0.5));
    };

    if (availableWords.length === 0) {
        return (
            <ModuleContainer title="Rocket Launch">
                <div className="text-center py-16">
                    <div className="text-6xl mb-4">🚀</div>
                    <h2 className="text-2xl font-bold text-gray-600 mb-4">No Words Available</h2>
                    <p className="text-gray-500 mb-6">
                        Please add more words to your vocabulary or adjust the game filters to play Rocket Launch.
                    </p>
                    <p className="text-sm text-gray-400">
                        Current filters may be too restrictive, or you need to add more vocabulary words.
                    </p>
                </div>
            </ModuleContainer>
        );
    }

    if (!secretWord) {
        return <ModuleContainer title="Rocket Launch"><div>Loading...</div></ModuleContainer>;
    }
    
    return (
        <ModuleContainer title="Rocket Launch">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-full">
                <div className="md:col-span-1 flex flex-col items-center justify-between bg-slate-100 rounded-lg p-4">
                    <h3 className="font-bold text-2xl text-slate-600">Launch Status</h3>
                    <div className="w-full h-64">
                       <RocketDrawing partsDrawn={incorrectGuesses.length} />
                    </div>
                    <div className="space-y-2 w-full">
                        <button onClick={showVowelHint} className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded">Vowel Hint</button>
                        <button onClick={showWordBank} className="w-full bg-green-400 hover:bg-green-500 text-white font-bold py-2 px-4 rounded">Word Bank</button>
                    </div>
                     {wordBank.length > 0 && (
                        <div className="mt-4 bg-white p-2 rounded-lg">
                            <h4 className="font-bold text-center">Word Bank</h4>
                            <ul className="flex justify-center space-x-4">
                                {wordBank.map(word => <li key={word}>{word}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
                <div className="md:col-span-2 flex flex-col justify-between">
                    <div>
                      <SettingsPanel
                         mistakes={mistakesAllowed} setMistakes={setMistakesAllowed}
                         wordBankSize={wordBankSize} setWordBankSize={setWordBankSize}
                         minWordLength={minWordLength} setMinWordLength={setMinWordLength}
                         onRestart={startNewGame}
                         availableWordsCount={availableWords.length}
                      />
                      <div className="my-6">
                        <WordDisplay word={secretWord} guessedLetters={guessedLetters} />
                      </div>
                      <div className="mt-4 text-center font-semibold text-red-500">
                          Mistakes: {incorrectGuesses.length} / {mistakesAllowed}
                      </div>
                    </div>
                    <div className="mt-8">
                      <Keyboard onGuess={handleGuess} guessedLetters={guessedLetters} />
                    </div>
                </div>
            </div>
            
             {(isGameOver || isGameWon) && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-20">
                    <div className="bg-white p-12 rounded-2xl text-center shadow-2xl">
                        <h3 className="text-5xl font-display mb-4">
                            {isGameWon ? 'You Win!' : 'Game Over!'}
                        </h3>
                        <p className="text-xl text-slate-600 mb-2">
                            {isGameWon ? 'You guessed the word!' : 'The rocket launched! The word was:'}
                        </p>
                        <p className="text-4xl font-display text-blue-600 mb-8">{secretWord}</p>
                        <button onClick={startNewGame} className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-2xl py-3 px-8 rounded-full">
                            Play Again
                        </button>
                    </div>
                </div>
            )}
        </ModuleContainer>
    );
};

export default Module3RocketLaunch;