import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { SessionVocabularyProvider } from './contexts/SessionVocabularyContext';
import { GameFiltersProvider, type GameFilters } from './contexts/GameFiltersContext';
import Module0WordSelection from './modules/Module0_WordSelection';
import ModuleWordList from './modules/ModuleWordList';
import ModuleNumbers from './modules/ModuleNumbers';
import Module1AlphabetCreator from './modules/Module1_AlphabetCreator';
import Module2MemoryBomb from './modules/Module2_MemoryBomb';
import Module3RocketLaunch from './modules/Module3_RocketLaunch';
import Module4Battleships from './modules/Module4_Battleships';
import Module4Bingo from './modules/Module4_Bingo';
import Module5WordReview from './modules/Module5_WordReview';
import Module7LetterExplanation from './modules/Module6_LetterExplanation';
import ModuleAlphabetOverview from './modules/ModuleAlphabetOverview';
import ModuleSettings from './modules/ModuleSettings';
import { SettingsProvider } from './contexts/SettingsContext';
import { useSettings } from './contexts/SettingsContext';
import GameFiltersPanel from './components/GameFiltersPanel';
import CommandPalette from './components/CommandPalette/CommandPalette';
import { useEslCommands } from './components/CommandPalette/useEslCommands';
import type { SessionWord, WordCategory } from './types';
import { MIN_WORDS_FOR_GAMES } from './constants';

const STORAGE_KEY = 'esl-lesson-vocabulary';

const App: React.FC = () => {
  const [sessionVocabulary, setSessionVocabulary] = useState<SessionWord[]>([]);
  const [activeModule, setActiveModule] = useState<number>(0); // Start with Word Selection
  const [isSetupComplete, setIsSetupComplete] = useState<boolean>(false);
  const [showGamesGrid, setShowGamesGrid] = useState<boolean>(false);

  // Game customization filters
  const [gameFilters, setGameFilters] = useState<GameFilters>({
    category: 'all',
    maxWordLength: null,
    vocabSource: 'all'
  });

  // Load data from localStorage on app start
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setSessionVocabulary(data.vocabulary || []);
        setIsSetupComplete(data.isComplete || false);
        if (data.isComplete && data.vocabulary?.length >= MIN_WORDS_FOR_GAMES) {
          setActiveModule(data.lastModule || 2);
        }
      }
    } catch (error) {
      console.warn('Failed to load saved vocabulary:', error);
    }
  }, []);

  // Save data to localStorage whenever vocabulary changes
  useEffect(() => {
    if (sessionVocabulary.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          vocabulary: sessionVocabulary,
          isComplete: isSetupComplete,
          lastModule: activeModule,
          timestamp: Date.now()
        }));
      } catch (error) {
        console.warn('Failed to save vocabulary:', error);
      }
    }
  }, [sessionVocabulary, isSetupComplete, activeModule]);

  const handleWordsUpdate = useCallback((vocabulary: SessionWord[]) => {
    setSessionVocabulary(vocabulary);
    setIsSetupComplete(vocabulary.length >= MIN_WORDS_FOR_GAMES);
  }, []);

  const resetSetup = useCallback(() => {
    setSessionVocabulary([]);
    setIsSetupComplete(false);
    setActiveModule(0); // Return to Word Selection
    setShowGamesGrid(false);
    // Clear localStorage
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear saved data:', error);
    }
  }, []);

  const isGameReady = useMemo(() =>
    isSetupComplete && sessionVocabulary.length >= MIN_WORDS_FOR_GAMES,
    [isSetupComplete, sessionVocabulary.length]
  );



  const renderActiveModule = () => {
    switch (activeModule) {
      case 0:
        return <Module0WordSelection sessionVocabulary={sessionVocabulary} onWordsUpdate={handleWordsUpdate} />;
      case 1:
        return <ModuleWordList sessionVocabulary={sessionVocabulary} onWordsUpdate={handleWordsUpdate} />;
      case 2:
        return <ModuleNumbers />;
      case 3:
        return <Module7LetterExplanation />;
      case 4:
        return <Module2MemoryBomb />;
      case 5:
        return <Module3RocketLaunch />;
      case 6:
        return <Module4Battleships sessionVocabulary={sessionVocabulary} onBack={() => setActiveModule(0)} />;
      case 7:
        return <Module4Bingo />;
      case 8:
        return <Module5WordReview />;
      case 10:
        return <ModuleAlphabetOverview sessionVocabulary={sessionVocabulary} />;
      case 9:
        return <ModuleSettings />;
      default:
        return <Module0WordSelection sessionVocabulary={sessionVocabulary} onWordsUpdate={handleWordsUpdate} />;
    }
  };

  const gameItems = [
    { id: 4, name: 'Memory', icon: '🧠', description: 'Match pairs to test your memory' },
    { id: 5, name: 'Rocket Launch', icon: '🚀', description: 'Guess the word before launch' },
    { id: 6, name: 'Battleships', icon: '🚢', description: 'Say coordinates in English to sink ships' },
    { id: 7, name: 'BINGO', icon: '🎯', description: 'Classic word bingo game' },
    { id: 8, name: 'Word Review', icon: '📚', description: 'Review your vocabulary' },
  ];

  return (
    <SessionVocabularyProvider value={{ sessionVocabulary, setSessionVocabulary }}>
      <GameFiltersProvider value={{ gameFilters, setGameFilters }}>
        <SettingsProvider>
          <AppInner
            activeModule={activeModule}
            setActiveModule={setActiveModule}
            sessionVocabulary={sessionVocabulary}
            setSessionVocabulary={setSessionVocabulary}
            isGameReady={isGameReady}
            showGamesGrid={showGamesGrid}
            setShowGamesGrid={setShowGamesGrid}
            gameFilters={gameFilters}
            setGameFilters={setGameFilters}
            resetSetup={resetSetup}
            gameItems={gameItems}
            renderActiveModule={renderActiveModule}
          />
        </SettingsProvider>
      </GameFiltersProvider>
    </SessionVocabularyProvider>
  );
};

const AppInner: React.FC<{
  activeModule: number;
  setActiveModule: (n: number) => void;
  sessionVocabulary: SessionWord[];
  setSessionVocabulary: React.Dispatch<React.SetStateAction<SessionWord[]>>;
  isGameReady: boolean;
  showGamesGrid: boolean;
  setShowGamesGrid: (v: boolean) => void;
  gameFilters: GameFilters;
  setGameFilters: React.Dispatch<React.SetStateAction<GameFilters>>;
  resetSetup: () => void;
  gameItems: { id: number; name: string; icon: string; description: string }[];
  renderActiveModule: () => React.ReactNode;
}> = ({
  activeModule, setActiveModule, sessionVocabulary, setSessionVocabulary,
  isGameReady, showGamesGrid, setShowGamesGrid, gameFilters, setGameFilters,
  resetSetup, gameItems, renderActiveModule,
}) => {
  const { settings, setSettings } = useSettings();

  const { commands: paletteCommands, categoryLabels } = useEslCommands({
    activeModule, setActiveModule, sessionVocabulary, setSessionVocabulary,
    isGameReady, setShowGamesGrid, gameFilters, setGameFilters,
    settings, setSettings, resetSetup,
  });

  const isEn = settings.ui.language === 'en';

  return (
          <div className="bg-sky-100 min-h-screen text-slate-800 flex flex-col">
          <header className="bg-white shadow-md p-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-display text-blue-600">ESL Lesson Adventure</h1>
              {isGameReady && (
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold border border-green-300">
                  📚 {sessionVocabulary.length} words ready
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {/* Word Selection */}
              <button
                onClick={() => setActiveModule(0)}
                className={`font-bold py-2 px-4 rounded-full text-sm transition-colors flex items-center space-x-2 ${
                  activeModule === 0
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-500 hover:bg-gray-600 text-white'
                }`}
                title="Word Selection - Choose vocabulary words"
              >
                <span>📚</span>
                <span>Word Selection</span>
              </button>

              {/* Word List */}
              <button
                onClick={() => setActiveModule(1)}
                className={`font-bold py-2 px-4 rounded-full text-sm transition-colors flex items-center space-x-2 ${
                  activeModule === 1
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-500 hover:bg-gray-600 text-white'
                }`}
                title="Word List - View all selected words"
              >
                <span>📋</span>
                <span>Word List</span>
              </button>

              {/* Word List Simple */}
              <button
                onClick={() => setActiveModule(3)}
                className={`font-bold py-2 px-4 rounded-full text-sm transition-colors flex items-center space-x-2 ${
                  activeModule === 3
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-500 hover:bg-gray-600 text-white'
                }`}
                title="Word List Simple - Educational foundation"
              >
                <span>📝</span>
                <span>Word List Simple</span>
              </button>

              {/* Numbers */}
              <button
                onClick={() => setActiveModule(2)}
                className={`font-bold py-2 px-4 rounded-full text-sm transition-colors flex items-center space-x-2 ${
                  activeModule === 2
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-500 hover:bg-gray-600 text-white'
                }`}
                title="Numbers Learning - Learn English numbers"
              >
                <span>🔢</span>
                <span>Numbers</span>
              </button>

              {/* Alphabet Overview */}
              <button
                onClick={() => setActiveModule(10)}
                className={`font-bold py-2 px-4 rounded-full text-sm transition-colors flex items-center space-x-2 ${
                  activeModule === 10
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-500 hover:bg-gray-600 text-white'
                }`}
                title="Alphabet Overview - Read-only summary"
              >
                <span>🔎</span>
                <span>Alphabet Overview</span>
              </button>

              {/* Settings */}
              <button
                onClick={() => setActiveModule(9)}
                className={`font-bold py-2 px-4 rounded-full text-sm transition-colors flex items-center space-x-2 ${
                  activeModule === 9
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'bg-gray-500 hover:bg-gray-600 text-white'
                }`}
                title="Einstellungen"
              >
                <span>⚙️</span>
                <span>Einstellungen</span>
              </button>

              {/* Games - only show when ready */}
              {isGameReady && (
                <button
                  onClick={() => setShowGamesGrid(!showGamesGrid)}
                  className={`font-bold py-2 px-4 rounded-full text-sm transition-colors flex items-center space-x-2 ${
                    showGamesGrid
                      ? 'bg-purple-500 text-white shadow-md'
                      : 'bg-purple-500 hover:bg-purple-600 text-white'
                  }`}
                  title="Games - Play learning games"
                >
                  <span>🎮</span>
                  <span>Games</span>
                </button>
              )}

              {/* Reset Button */}
              <button
                onClick={resetSetup}
                className="bg-amber-400 hover:bg-amber-500 text-white font-bold py-2 px-4 rounded-full transition-colors text-sm shadow-md flex items-center space-x-2"
                title="Start over with a new word list"
              >
                <span>🔄</span>
                <span>Reset</span>
              </button>
            </div>
          </header>

          {/* Game Filters Panel - only show when games are ready and not in Module 1 */}
          {isGameReady && activeModule !== 1 && (
            <div className="p-4">
              <GameFiltersPanel />
            </div>
          )}

          <main className="flex-grow p-4 sm:p-6 lg:p-8">
            {showGamesGrid ? (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-bold text-blue-600 mb-4">🎮 Learning Games</h1>
                  <p className="text-lg text-gray-600">Choose a game to practice your vocabulary</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gameItems.map(game => (
                    <div key={game.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-center space-x-3 mb-4">
                        <span className="text-3xl">{game.icon}</span>
                        <h3 className="font-bold text-xl">{game.name}</h3>
                      </div>
                      <p className="text-gray-600 mb-4">{game.description}</p>
                      <button
                        onClick={() => {
                          setActiveModule(game.id);
                          setShowGamesGrid(false);
                        }}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                      >
                        Play Now
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              renderActiveModule()
            )}
          </main>
          <CommandPalette
            commands={paletteCommands}
            categoryLabels={categoryLabels}
            storageKey="esl-lesson-cmd-palette-frecency"
            openKey="k"
            strings={{
              placeholder: isEn ? 'Search commands…' : 'Befehle suchen…',
              noResults: isEn ? 'No matching commands' : 'Keine Ergebnisse',
              recent: isEn ? 'Recent' : 'Zuletzt verwendet',
            }}
          />
        </div>
  );
};

export default App;

/*
SUGGESTED ADDITIONAL GAMES:

1. 🎯 Word Sorting - Sort words by category, length, or alphabetically
2. 🔤 Letter Hunt - Find all words that start with a specific letter
3. 🎪 Word Circus - Drag and drop words to match pictures
4. 🌟 Spelling Bee - Type the correct spelling of spoken words
5. 🎨 Picture Puzzle - Reconstruct word images from puzzle pieces
6. 🎵 Rhyme Time - Find words that rhyme with the given word
7. 🏃 Speed Round - Quick-fire word identification game
8. 🎭 Word Charades - Act out words for others to guess
9. 🔍 Word Detective - Find hidden words in a letter grid
10. 🎲 Word Dice - Roll dice to create new word combinations
11. 🌈 Color Match - Match words to their corresponding colors
12. 📝 Story Builder - Create stories using selected vocabulary
13. 🎪 Word Wheel - Spin to select random words for activities
14. 🏆 Vocabulary Olympics - Multiple mini-games competition
15. 🎨 Draw & Guess - Draw the word, others guess what it is
*/
