import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSessionVocabulary } from '../../contexts/SessionVocabularyContext';
import { useGameFilters } from '../../contexts/GameFiltersContext';
import ModuleContainer from '../../components/ModuleContainer';
import type { SessionWord } from '../../types';
import ImageRenderer from '../../components/ImageRenderer';
import { DEFAULT_ALPHABET_WORDS } from '../../types';


// Helper to shuffle array
const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

// Define Card type for the game
interface GameCard extends SessionWord {
  id: number;
}

const MemoryCard: React.FC<{ card: GameCard; isFlipped: boolean; isMatched: boolean; onCardClick: (card: GameCard) => void; }> = ({ card, isFlipped, isMatched, onCardClick }) => {
    const shouldShowFront = isFlipped || isMatched;

    return (
        <div
            className={`relative w-full aspect-square rounded-lg shadow-md cursor-pointer transition-transform duration-500 transform-style-3d ${shouldShowFront ? 'rotate-y-180' : ''} min-h-16 max-h-20`}
            onClick={() => !(isFlipped || isMatched) && onCardClick(card)}
        >
            {/* Back of card (visible initially) */}
            <div className="absolute inset-0 backface-hidden flex items-center justify-center rounded-lg bg-blue-400 hover:bg-blue-500 border-2 border-blue-600">
                <span className="text-2xl sm:text-3xl md:text-4xl font-display text-white">{card.id + 1}</span>
            </div>

            {/* Front of card (visible on flip/match) */}
            <div className={`absolute inset-0 rotate-y-180 backface-hidden flex flex-col items-center justify-center rounded-lg border-2 ${isMatched ? 'bg-green-200 border-green-400' : 'bg-white border-gray-300'}`}>
                <div className="flex-1 flex items-center justify-center p-2">
                    <ImageRenderer image={card.image} alt={card.word} className="max-w-full max-h-full object-contain" />
                </div>
                <div className="text-xs sm:text-sm font-bold text-gray-700 pb-2">
                    {card.word}
                </div>
            </div>
        </div>
    );
};


const BombVisual: React.FC<{ mistakesMade: number; mistakesAllowed: number }> = ({ mistakesMade, mistakesAllowed }) => {
    const wires = useMemo(() => Array.from({ length: mistakesAllowed }, (_, i) => ({ id: i, cut: i < mistakesMade })), [mistakesAllowed, mistakesMade]);

    return (
        <div className="flex flex-col items-center bg-gray-700 p-4 rounded-lg">
            <div className="text-white font-display text-2xl mb-2">BOMB</div>
            <div className="flex space-x-2">
                {wires.map(wire => (
                    <div key={wire.id} className={`w-4 h-12 rounded-full transition-colors ${wire.cut ? 'bg-red-500' : 'bg-yellow-300'}`}></div>
                ))}
            </div>
            <div className="text-white mt-2 font-semibold">
                {mistakesAllowed - mistakesMade} tries left
            </div>
        </div>
    );
};

const SettingsPanel: React.FC<{
    gridSize: number; setGridSize: (size: number) => void;
    mistakes: number; setMistakes: (m: number) => void;
    onRestart: () => void;
    availableWords: number;
    maxPossiblePairs: number;
}> = ({ gridSize, setGridSize, mistakes, setMistakes, onRestart, availableWords, maxPossiblePairs }) => (
    <div className="bg-sky-100 p-4 rounded-lg flex flex-wrap items-center justify-center gap-6">
        <div className="flex flex-col items-center">
            <label className="font-bold text-gray-700 mb-1">Grid Size:</label>
            <select value={gridSize} onChange={(e) => setGridSize(Number(e.target.value))} className="p-2 rounded-md border border-gray-300">
                <option value={12} disabled={maxPossiblePairs < 6}>3x4 (6 pairs)</option>
                <option value={16} disabled={maxPossiblePairs < 8}>4x4 (8 pairs)</option>
                <option value={20} disabled={maxPossiblePairs < 10}>4x5 (10 pairs)</option>
                <option value={24} disabled={maxPossiblePairs < 12}>4x6 (12 pairs)</option>
            </select>
            <span className="text-xs text-gray-600 mt-1">{availableWords} words available</span>
        </div>
        <div className="flex flex-col items-center">
            <label className="font-bold text-gray-700 mb-1">Mistakes Allowed: {mistakes}</label>
            <input
                type="range"
                min="3"
                max="15"
                value={mistakes}
                onChange={(e) => setMistakes(Number(e.target.value))}
                className="w-32"
            />
            <div className="flex justify-between w-32 text-xs text-gray-600">
                <span>Easy (15)</span>
                <span>Hard (3)</span>
            </div>
        </div>
        <div className="flex flex-col items-center">
            <button onClick={onRestart} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                New Game
            </button>
            <span className="text-xs text-gray-600 mt-1">Shuffle cards</span>
        </div>
    </div>
);


const Module2MemoryBomb: React.FC = () => {
    const { sessionVocabulary } = useSessionVocabulary();
    const { gameFilters } = useGameFilters();

    const [gridSize, setGridSize] = useState(12);
    const [mistakesAllowed, setMistakesAllowed] = useState(8);

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
    
    const [gameCards, setGameCards] = useState<GameCard[]>([]);
    const [flippedCards, setFlippedCards] = useState<GameCard[]>([]);
    const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
    const [mistakesMade, setMistakesMade] = useState(0);
    const [isChecking, setIsChecking] = useState(false);

    const isGameOver = useMemo(() => mistakesMade >= mistakesAllowed, [mistakesMade, mistakesAllowed]);
    const isGameWon = useMemo(() => matchedPairs.length === gameCards.length / 2 && gameCards.length > 0, [matchedPairs, gameCards]);
    
    const maxPossiblePairs = useMemo(() => filteredVocabulary.length, [filteredVocabulary]);

    const setupGame = useCallback(() => {
        const wordPairsNeeded = gridSize / 2;

        if (filteredVocabulary.length < wordPairsNeeded) {
            // Not enough unique words for the grid, handle gracefully
            console.warn(`Not enough unique words (${filteredVocabulary.length}) for grid size ${gridSize}. Need ${wordPairsNeeded} pairs.`);
            setGameCards([]);
            return;
        }

        const shuffledVocab = shuffleArray(filteredVocabulary);
        const selectedWords = shuffledVocab.slice(0, wordPairsNeeded);
        const pairedWords = [...selectedWords, ...selectedWords];
        const shuffledCards = shuffleArray(pairedWords).map((word, index) => ({
            ...word,
            id: index,
        }));
        setGameCards(shuffledCards);
        setFlippedCards([]);
        setMatchedPairs([]);
        setMistakesMade(0);
        setIsChecking(false);
    }, [gridSize, filteredVocabulary]);

    useEffect(() => {
        if (sessionVocabulary.length > 0) {
            setupGame();
        }
    }, [sessionVocabulary, gridSize, mistakesAllowed, setupGame]);

    useEffect(() => {
        if (flippedCards.length === 2) {
            setIsChecking(true);
            const [first, second] = flippedCards;
            if (first.word === second.word) {
                setMatchedPairs(prev => [...prev, first.word]);
                setFlippedCards([]);
                setIsChecking(false);
            } else {
                setTimeout(() => {
                    setMistakesMade(prev => prev + 1);
                    setFlippedCards([]);
                    setIsChecking(false);
                }, 1500);
            }
        }
    }, [flippedCards]);

    const handleCardClick = (card: GameCard) => {
        if (isChecking || flippedCards.some(c => c.id === card.id) || flippedCards.length === 2) return;
        setFlippedCards(prev => [...prev, card]);
    };

    // Calculate responsive grid columns based on grid size
    const gridCols = useMemo(() => {
        if (gridSize <= 8) return 4;
        if (gridSize <= 12) return 4;
        if (gridSize <= 16) return 4;
        if (gridSize <= 20) return 5;
        return 6;
    }, [gridSize]);
    
    return (
        <ModuleContainer title="Memory">
            <div className="flex flex-col h-full">
                <SettingsPanel
                    gridSize={gridSize} setGridSize={setGridSize}
                    mistakes={mistakesAllowed} setMistakes={setMistakesAllowed}
                    onRestart={setupGame}
                    availableWords={filteredVocabulary.length}
                    maxPossiblePairs={maxPossiblePairs}
                />
                <div className={`flex-grow grid gap-3 p-4 perspective-1000 min-h-0 max-h-[70vh] overflow-auto`} style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)`, gridTemplateRows: `repeat(${Math.ceil(gridSize / gridCols)}, minmax(60px, 80px))` }}>
                     {gameCards.map((card) => (
                        <MemoryCard
                            key={card.id}
                            card={card}
                            isFlipped={flippedCards.some(c => c.id === card.id)}
                            isMatched={matchedPairs.includes(card.word)}
                            onCardClick={handleCardClick}
                        />
                    ))}
                </div>
                <div className="flex justify-center">
                    <BombVisual mistakesMade={mistakesMade} mistakesAllowed={mistakesAllowed} />
                </div>
            </div>

            {(isGameOver || isGameWon) && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-20">
                    <div className="bg-white p-12 rounded-2xl text-center shadow-2xl">
                        <h3 className="text-5xl font-display mb-4">
                            {isGameWon ? 'You Win!' : 'Game Over!'}
                        </h3>
                        <p className="text-xl text-slate-600 mb-8">
                            {isGameWon ? 'Great job, you defused the bomb!' : 'The bomb exploded! Better luck next time.'}
                        </p>
                        <button onClick={setupGame} className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-2xl py-3 px-8 rounded-full">
                            Play Again
                        </button>
                    </div>
                </div>
            )}
        </ModuleContainer>
    );
};

export default Module2MemoryBomb;