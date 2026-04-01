import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type AudioSettings = {
  global: boolean;
  numbers: boolean;
  bingo: boolean;
};

export type GamePreferences = {
  battleshipsGrid: 12 | 15 | 10;
  memoryGrid: 12 | 16 | 20 | 24;
};

export type InterfaceOptions = {
  language: 'de' | 'en';
  theme: 'light' | 'dark';
};

export type SettingsState = {
  audio: AudioSettings;
  gamePrefs: GamePreferences;
  ui: InterfaceOptions;
};

const DEFAULT_SETTINGS: SettingsState = {
  audio: { global: true, numbers: true, bingo: true },
  gamePrefs: { battleshipsGrid: 12, memoryGrid: 16 },
  ui: { language: 'de', theme: 'light' },
};

const STORAGE_KEY = 'esl-lesson-settings';

export const SettingsContext = createContext<{
  settings: SettingsState;
  setSettings: React.Dispatch<React.SetStateAction<SettingsState>>;
  resetAudio: () => void;
  resetGamePrefs: () => void;
  resetUI: () => void;
}>({
  settings: DEFAULT_SETTINGS,
  setSettings: () => {},
  resetAudio: () => {},
  resetGamePrefs: () => {},
  resetUI: () => {},
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  const value = useMemo(() => ({
    settings,
    setSettings,
    resetAudio: () => setSettings(s => ({ ...s, audio: DEFAULT_SETTINGS.audio })),
    resetGamePrefs: () => setSettings(s => ({ ...s, gamePrefs: DEFAULT_SETTINGS.gamePrefs })),
    resetUI: () => setSettings(s => ({ ...s, ui: DEFAULT_SETTINGS.ui })),
  }), [settings]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);

