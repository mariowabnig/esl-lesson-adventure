import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { SessionVocabularyProvider } from './contexts/SessionVocabularyContext';
import { GameFiltersProvider, type GameFilters } from './contexts/GameFiltersContext';
import Module0WordSelection from './modules/Module0_WordSelection';
import ModuleWordList from './modules/ModuleWordList';
import ModuleTreasureHunt from './modules/ModuleTreasureHunt';
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

  const [storageLoaded, setStorageLoaded] = useState(false);

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
    } finally {
      setStorageLoaded(true);
    }
  }, []);

  // Save data to localStorage whenever vocabulary changes
  useEffect(() => {
    if (storageLoaded) {
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
  }, [sessionVocabulary, isSetupComplete, activeModule, storageLoaded]);

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
        return <Module4Battleships sessionVocabulary={sessionVocabulary} onBack={() => setShowGamesGrid(true)} />;
      case 7:
        return <Module4Bingo />;
      case 8:
        return <Module5WordReview />;
      case 11:
        return <ModuleTreasureHunt />;
      case 10:
        return <ModuleAlphabetOverview sessionVocabulary={sessionVocabulary} />;
      case 9:
        return <ModuleSettings />;
      default:
        return <Module0WordSelection sessionVocabulary={sessionVocabulary} onWordsUpdate={handleWordsUpdate} />;
    }
  };

  const gameItems = [
    { id: 11, name: 'Treasure Hunt', icon: '💎', description: 'Wählt Karte und Schätze und sucht gemeinsam oder gegen den Computer' },
    { id: 4, name: 'Memory', icon: '🧠', description: 'Deckt Karten auf und findet passende Paare' },
    { id: 5, name: 'Rocket Launch', icon: '🚀', description: 'Erratet das Wort, bevor die Rakete startet' },
    { id: 6, name: 'Battleships', icon: '🚢', description: 'Sagt Koordinaten auf Englisch an und versenkt die Schiffe' },
    { id: 7, name: 'BINGO', icon: '🎯', description: 'Hört die englischen Wörter und markiert sie auf eurer Bingo-Karte' },
    { id: 8, name: 'Word Review', icon: '📚', description: 'Wiederholt eure englischen Wörter' },
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
          <header className="app-header">
            <div className="app-header-top">
              <div className="app-brand">
                <h1>ESL Lesson Adventure</h1>
                {isGameReady && <span className="word-count">{sessionVocabulary.length} words ready</span>}
              </div>
              <div className="app-utilities">
                <button onClick={() => { setActiveModule(9); setShowGamesGrid(false); }} aria-pressed={activeModule === 9 && !showGamesGrid}>⚙️ {isEn ? 'Settings' : 'Einstellungen'}</button>
                <button onClick={resetSetup} className="reset-button" title="Start over with a new word list">🔄 Reset</button>
              </div>
            </div>
            <nav className="app-navigation" aria-label="Lesson activities">
              {[
                { id: 0, icon: '📚', label: 'Word Selection' },
                { id: 1, icon: '📋', label: 'Word List' },
                { id: 3, icon: '📝', label: 'Word List Simple' },
                { id: 2, icon: '🔢', label: 'Numbers' },
                { id: 10, icon: '🔎', label: 'Alphabet Overview' },
              ].map(item => <button key={item.id} aria-pressed={!showGamesGrid && activeModule === item.id}
                onClick={() => { setActiveModule(item.id); setShowGamesGrid(false); }}>
                <span aria-hidden="true">{item.icon}</span><span>{item.label}</span>
              </button>)}
              <button className="games-navigation" disabled={!isGameReady} aria-pressed={showGamesGrid}
                title={isGameReady ? 'Choose a learning game' : `Select ${MIN_WORDS_FOR_GAMES} words to unlock games`}
                onClick={() => setShowGamesGrid(true)}><span aria-hidden="true">🎮</span><span>Games</span></button>
            </nav>
          </header>

          {/* Game Filters Panel - only show when games are ready and not in Module 1 */}
          {isGameReady && ![1, 2, 6, 11].includes(activeModule) && (
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
                    <div key={game.id} className="game-card bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
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
              <>
                {gameItems.some(game => game.id === activeModule) && (
                  <div className="game-back-bar">
                    <button onClick={() => setShowGamesGrid(true)}>← Zurück zu den Spielen</button>
                  </div>
                )}
                <div className="active-module-content">{renderActiveModule()}</div>
              </>
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
