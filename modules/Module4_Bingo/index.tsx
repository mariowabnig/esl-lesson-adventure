import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { useSessionVocabulary } from '../../contexts/SessionVocabularyContext';
import { useGameFilters } from '../../contexts/GameFiltersContext';
import ModuleContainer from '../../components/ModuleContainer';
import type { SessionWord } from '../../types';
import ImageRenderer from '../../components/ImageRenderer';

const shuffleArray = <T,>(array: T[]): T[] => [...array].sort(() => Math.random() - 0.5);




const Module4Bingo: React.FC = () => {
    const { sessionVocabulary } = useSessionVocabulary();
    const { settings } = useSettings();
    const { gameFilters } = useGameFilters();
    const [calledWords, setCalledWords] = useState<SessionWord[]>([]);
    const [currentWord, setCurrentWord] = useState<SessionWord | null>(null);
    const [gridSize, setGridSize] = useState(4);
    const [showCalledList, setShowCalledList] = useState(false);
    const [gameMode, setGameMode] = useState<'practice' | 'advanced'>('practice');
    const [playerCard, setPlayerCard] = useState<SessionWord[]>([]);
    const [customGrid, setCustomGrid] = useState<string[]>([]);
    const [markedCells, setMarkedCells] = useState<Set<string>>(new Set());
    const [isGameWon, setIsGameWon] = useState(false);
    const [advancedMarkedIndices, setAdvancedMarkedIndices] = useState<Set<number>>(new Set());
    const [predictedRounds, setPredictedRounds] = useState<number | null>(null);
    const speechSynth = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);
    const [userPrediction, setUserPrediction] = useState<number | ''>('');
    const [turnCount, setTurnCount] = useState<number>(0);



    // Check for bingo win
    const checkForBingo = useCallback((marked: Set<string>, card: SessionWord[]) => {
        const size = gridSize;

        // Check rows
        for (let row = 0; row < size; row++) {
            let rowComplete = true;
            for (let col = 0; col < size; col++) {
                const index = row * size + col;
                if (!marked.has(card[index]?.word)) {
                    rowComplete = false;
                    break;
                }
            }
            if (rowComplete) return true;
        }

        // Check columns
        for (let col = 0; col < size; col++) {
            let colComplete = true;
            for (let row = 0; row < size; row++) {
                const index = row * size + col;
                if (!marked.has(card[index]?.word)) {
                    colComplete = false;
                    break;
                }
            }
            if (colComplete) return true;
        }

        // Check diagonals
        let diag1Complete = true;
        let diag2Complete = true;
        for (let i = 0; i < size; i++) {
            if (!marked.has(card[i * size + i]?.word)) diag1Complete = false;
            if (!marked.has(card[i * size + (size - 1 - i)]?.word)) diag2Complete = false;
        }

        return diag1Complete || diag2Complete;
    }, [gridSize]);

    // Filter words based on game filters
    const filteredVocabulary = useMemo(() => {
        let filtered = sessionVocabulary;

        if (gameFilters.category !== 'all') {
            filtered = filtered.filter(word => word.category === gameFilters.category);
        }

        // Max word length
        if (gameFilters.maxWordLength != null) {
            filtered = filtered.filter(word => word.word.length <= gameFilters.maxWordLength!);
        }

        // Vocabulary source filter
        if (gameFilters.vocabSource === 'alphabet') {
            filtered = filtered.filter(word => word.predefined === true);
        } else if (gameFilters.vocabSource === 'custom') {
            filtered = filtered.filter(word => word.predefined !== true);
        }

        return filtered;
    }, [sessionVocabulary, gameFilters]);

    const availableWords = useMemo(
        () => filteredVocabulary.filter(v => !calledWords.some(cw => cw.word === v.word)),
        [filteredVocabulary, calledWords]
    );

    // Advanced mode: estimate rounds to bingo via Monte Carlo
    useEffect(() => {
        if (gameMode !== 'advanced' || customGrid.length !== gridSize * gridSize) {
            setPredictedRounds(null);
            return;
        }
        const trials = 300;
        const words = customGrid.filter(Boolean);
        if (words.length === 0) { setPredictedRounds(null); return; }
        const simulate = (): number => {
            const order = [...words].sort(() => Math.random() - 0.5);
            const marked = new Set<string>();
            for (let i = 0; i < order.length; i++) {
                marked.add(order[i]);
                if (checkForBingo(marked, customGrid.map(w => ({ word: w } as any)))) {
                    return i + 1;
                }
            }
            return words.length;
        };
        let total = 0;
        for (let t = 0; t < trials; t++) total += simulate();
        setPredictedRounds(Math.round(total / trials));
    }, [gameMode, customGrid, gridSize, checkForBingo]);



    const callNextWord = useCallback(() => {
        if (availableWords.length > 0) {
            const nextWord = availableWords[Math.floor(Math.random() * availableWords.length)];
            setCurrentWord(nextWord);
            setCalledWords(prev => [...prev, nextWord]);
            setTurnCount(prev => prev + 1);
            if (settings.audio.global && settings.audio.bingo && speechSynth.current) {
                const utterance = new SpeechSynthesisUtterance(`${nextWord.letter} is for ${nextWord.word}`);
                speechSynth.current.speak(utterance);
            }
        }
    }, [availableWords, settings.audio]);

    useEffect(() => {
        if (userPrediction === '' || gameMode !== 'practice') return;
        if (turnCount >= (userPrediction as number) && !isGameWon) {
            // soft warning only
        }
    }, [userPrediction, turnCount, isGameWon, gameMode]);

    const startNewGame = useCallback(() => {
        setCalledWords([]);
        setCurrentWord(null);
        setShowCalledList(false);
        setMarkedCells(new Set());
        setIsGameWon(false);
        setTurnCount(0);
    }, []);


    // resize custom grid when gridSize changes or entering advanced mode
    useEffect(() => {
        if (gameMode === 'advanced') {
            const total = gridSize * gridSize;
            setCustomGrid(prev => {
                const next = Array(total).fill('');
                for (let i = 0; i < Math.min(prev.length, total); i++) next[i] = prev[i];
                return next;
            });
            setAdvancedMarkedIndices(new Set());
        }
    }, [gridSize, gameMode]);

    const toggleAdvancedCell = useCallback((index: number) => {
        setAdvancedMarkedIndices(prev => {
            const next = new Set(prev);
            if (next.has(index)) next.delete(index); else next.add(index);
            // evaluate win on-the-fly
            const size = gridSize;
            const words = customGrid;
            const marked = new Set<string>();
            next.forEach(i => { const w = words[i]; if (w) marked.add(w); });
            setIsGameWon(checkForBingo(marked, words.map(w => ({ word: w } as any))));
            return next;
        });
    }, [gridSize, customGrid, checkForBingo]);

    // shuffle practice card
    const reshufflePracticeCard = useCallback(() => {
        const totalCells = gridSize * gridSize;
        const pool = filteredVocabulary;
        if (pool.length >= totalCells) {
            const shuffled = shuffleArray([...pool]);
            setPlayerCard(shuffled.slice(0, totalCells));
            setMarkedCells(new Set());
            setIsGameWon(false);
            setCalledWords([]);
            setCurrentWord(null);
        } else {
            setPlayerCard([]);
        }
    }, [filteredVocabulary, gridSize]);

    // Handle cell click
    const handleCellClick = useCallback((word: SessionWord) => {
        if (calledWords.some(called => called.word === word.word)) {
            setMarkedCells(prev => {
                const newMarked = new Set(prev);
                if (newMarked.has(word.word)) {
                    newMarked.delete(word.word);
                } else {
                    newMarked.add(word.word);
                }

                // Check for win
                if (checkForBingo(newMarked, playerCard)) {
                    setIsGameWon(true);
                }

                return newMarked;
            });
        }
    }, [calledWords, checkForBingo, playerCard]);

    // Initialize card on mount
    useEffect(() => {
        if (filteredVocabulary.length >= gridSize * gridSize) {
            reshufflePracticeCard();
        }
    }, [filteredVocabulary, gridSize, reshufflePracticeCard]);

    return (
        <ModuleContainer title="BINGO">
            {/* Game Mode Selection */}
            <div className="mb-6 bg-white rounded-lg shadow-md p-4">
                <h3 className="text-lg font-bold mb-3 text-center">Spielmodus wählen:</h3>
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={() => setGameMode('practice')}
                        className={`px-6 py-3 rounded-lg font-bold transition-colors ${
                            gameMode === 'practice'
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        🎯 Practice Mode
                    </button>
                    <button
                        onClick={() => setGameMode('advanced')}
                        className={`px-6 py-3 rounded-lg font-bold transition-colors ${
                            gameMode === 'advanced'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        🧩 Erweiterter Modus
                    </button>
                </div>
            </div>

            {/* Interactive Bingo Card for Practice Mode */}
            {gameMode === 'practice' && playerCard.length > 0 && (
                <div className="mb-8 bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">Ihr BINGO-Karte</h3>
                        <button
                            onClick={reshufflePracticeCard}
                            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg"
                        >
                            Neue Karte
                        </button>
                    </div>

                    <div className="flex justify-center mb-4">
                        <div className={`grid gap-2 p-4 bg-gray-50 rounded-lg`} style={{gridTemplateColumns: `repeat(${gridSize}, 1fr)`}}>
                            {playerCard.map((word, index) => {
                                const isMarked = markedCells.has(word.word);
                                const isCalled = calledWords.some(called => called.word === word.word);

                                return (
                                    <div
                                        key={`${word.word}-${index}`}
                                        onClick={() => handleCellClick(word)}
                                        className={`w-20 h-20 border-2 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all ${
                                            isMarked
                                                ? 'bg-green-500 text-white border-green-600'
                                                : isCalled
                                                ? 'bg-yellow-200 border-yellow-400 hover:bg-yellow-300'
                                                : 'bg-white border-gray-300 hover:bg-gray-100'
                                        }`}
                                    >
                                        <ImageRenderer image={word.image} alt={word.word} className="w-8 h-8 mb-1" />
                                        <span className="text-xs font-bold text-center">{word.word}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {isGameWon && (
                        <div className="text-center p-4 bg-green-100 rounded-lg">
                            <h2 className="text-2xl font-bold text-green-800 mb-2">🎉 BINGO! 🎉</h2>
                            <p className="text-green-700">Herzlichen Glückwunsch! Sie haben gewonnen!</p>
                        </div>
                    )}
                </div>
            )}
            {/* Advanced Mode Grid */}
            {gameMode === 'advanced' && (
              <div className="mb-8 bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold mb-4">Erweiterte Grid-Eingabe</h3>
                <div className="flex justify-center mb-4">
                  <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
                    {Array.from({ length: gridSize * gridSize }).map((_, idx) => {
                      const val = customGrid[idx] ?? '';
                      const isMarked = advancedMarkedIndices.has(idx);
                      return (
                        <div key={idx} className={`w-28 h-28 border-2 rounded-lg p-1 ${isMarked ? 'bg-green-200 border-green-400' : 'bg-gray-50 border-gray-300'}`}
                             onClick={() => toggleAdvancedCell(idx)}>
                          <input
                            value={val}
                            onChange={(e) => {
                              const v = e.target.value.trim().toLowerCase();
                              setCustomGrid(prev => {
                                const next = [...prev];
                                next[idx] = v;
                                return next;
                              });
                            }}
                            placeholder="word"
                            className="w-full h-full text-center text-xs font-bold bg-transparent outline-none"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
                {predictedRounds != null && (
                  <div className="text-center text-sm text-gray-700">Predicted rounds to bingo: <span className="font-bold">{predictedRounds}</span></div>
                )}
                {isGameWon && (
                  <div className="text-center p-4 bg-green-100 rounded-lg mt-4">
                    <h2 className="text-2xl font-bold text-green-800 mb-2">🎉 BINGO! 🎉</h2>
                    <p className="text-green-700">Herzlichen Glückwunsch! Sie haben gewonnen!</p>
                  </div>
                )}
              </div>
            )}
                            {userPrediction !== '' && (
                              <div className={`inline-block ml-4 text-lg font-bold px-3 py-1 rounded-full ${turnCount <= Math.floor(0.7*(userPrediction as number)) ? 'bg-green-100 text-green-700' : (turnCount < (userPrediction as number) ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700')}`}>
                                Round {turnCount} / {userPrediction}
                              </div>
                            )}


            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 h-full">
                <div className="md:col-span-3 flex flex-col items-center justify-center bg-sky-50 rounded-2xl p-8">
                    {currentWord ? (
                        <>
                        <div className="text-center animate-fade-in">
                            <h3 className="font-display text-8xl text-sky-500">{currentWord.letter}</h3>
                             <div className="my-6 h-64 w-64 bg-white rounded-lg shadow-md flex items-center justify-center">
                                <ImageRenderer image={currentWord.image} alt={currentWord.word} className="w-56 h-56 object-contain" />
                            </div>
                            <p className="font-display text-4xl text-slate-700 capitalize">is for <span className="text-blue-600">{currentWord.word}</span></p>
                        </div>
                            {/* Prediction input under the card */}
                            <div className="mt-4">
                              <input
                                type="number"
                                min={1}
                                max={gridSize * gridSize}
                                value={userPrediction === '' ? '' : userPrediction}
                                onChange={(e)=> setUserPrediction(e.target.value === '' ? '' : Math.max(1, Math.min(gridSize*gridSize, parseInt(e.target.value) || 1)))}
                                className="w-40 px-3 py-2 border border-yellow-300 rounded-lg text-center font-bold"
                                placeholder="Predict rounds"
                              />
                            </div>
                        </>
                    ) : (
                        <div className="text-center">
                            <p className="text-3xl font-bold text-slate-500">Click "Call Word" to begin!</p>
                        </div>
                    )}

                    <div className="mt-8 space-x-4">
                        <button
                            onClick={callNextWord}
                            disabled={availableWords.length === 0}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-2xl py-4 px-8 rounded-full shadow-lg transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:scale-100"
                        >
                            {availableWords.length === 0 ? "All words called!" : "Call Word"}
                        </button>
                        <button onClick={startNewGame} className="bg-green-500 hover:bg-green-600 text-white font-bold text-2xl py-4 px-8 rounded-full shadow-lg transition-transform transform hover:scale-105">
                           New Game
                        </button>
                    </div>
                </div>

                <div className="md:col-span-1 bg-yellow-50 rounded-2xl p-4 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-display text-2xl text-yellow-800">Called Words</h3>
                        <button onClick={() => setShowCalledList(!showCalledList)} className="text-sm bg-yellow-200 px-2 py-1 rounded-md">{showCalledList ? 'Hide' : 'Show'}</button>
                    </div>
                    {showCalledList && (
                        <div className="flex-grow overflow-y-auto pr-2">
                            <ul className="space-y-2">
                                {calledWords.slice().reverse().map(word => (
                                    <li key={word.word} className="flex items-center bg-white p-2 rounded-lg shadow-sm">
                                        <ImageRenderer image={word.image} alt={word.word} className="w-8 h-8 mr-3 !text-2xl"/>
                                        <span className="font-semibold text-slate-700 capitalize">{word.word}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <div className="mt-4 pt-4 border-t-2 border-yellow-200">
                         <label className="font-bold block text-center mb-2">Grid Size</label>
                         <select value={gridSize} onChange={(e) => setGridSize(Number(e.target.value))} className="w-full p-2 rounded-md">
                            <option value={3}>3x3</option>
                            <option value={4}>4x4</option>
                            <option value={5}>5x5</option>
                        </select>
                        {gameMode === 'advanced' && (
                          <div className="mt-4 space-y-2">
                            <button
                              onClick={() => {
                                const total = gridSize * gridSize;
                                const words = filteredVocabulary.slice(0, total).map(w => w.word);
                                setCustomGrid(prev => {
                                  const next = Array(total).fill('');
                                  for (let i = 0; i < Math.min(words.length, total); i++) next[i] = words[i];
                                  return next;
                                });
                              }}
                              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
                            >
                              Fill grid from filtered words
                            </button>
                            <button
                              onClick={() => setCustomGrid(Array(gridSize * gridSize).fill(''))}
                              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg"
                            >
                              Clear grid
                            </button>
                            {predictedRounds != null && (
                              <div className="text-center text-sm text-gray-700">Predicted rounds to bingo: <span className="font-bold">{predictedRounds}</span></div>
                            )}
                          </div>
                        )}
                    </div>
                </div>
            </div>
        </ModuleContainer>
    );
};

export default Module4Bingo;