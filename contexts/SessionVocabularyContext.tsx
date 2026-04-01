
import { createContext, useContext } from 'react';
import type { SessionWord } from '../types';

interface SessionVocabularyContextType {
  sessionVocabulary: SessionWord[];
  setSessionVocabulary: React.Dispatch<React.SetStateAction<SessionWord[]>>;
}

export const SessionVocabularyContext = createContext<SessionVocabularyContextType | undefined>(undefined);

export const SessionVocabularyProvider = SessionVocabularyContext.Provider;

export const useSessionVocabulary = (): SessionVocabularyContextType => {
  const context = useContext(SessionVocabularyContext);
  if (!context) {
    throw new Error('useSessionVocabulary must be used within a SessionVocabularyProvider');
  }
  return context;
};
