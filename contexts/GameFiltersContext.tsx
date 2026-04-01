import { createContext, useContext } from 'react';
import type { WordCategory } from '../types';

export interface GameFilters {
  category: WordCategory | 'all';
  maxWordLength?: number | null; // optional max length filter (<= X)
  vocabSource: 'all' | 'alphabet' | 'custom';
}

interface GameFiltersContextType {
  gameFilters: GameFilters;
  setGameFilters: React.Dispatch<React.SetStateAction<GameFilters>>;
}

export const GameFiltersContext = createContext<GameFiltersContextType | undefined>(undefined);

export const GameFiltersProvider = GameFiltersContext.Provider;

export const useGameFilters = (): GameFiltersContextType => {
  const context = useContext(GameFiltersContext);
  if (!context) {
    throw new Error('useGameFilters must be used within a GameFiltersProvider');
  }
  return context;
};
