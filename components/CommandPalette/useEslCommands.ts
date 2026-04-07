import { useMemo } from 'react';
import type { Command } from './useCommandPalette';
import type { GameFilters } from '../../contexts/GameFiltersContext';
import type { SettingsState } from '../../contexts/SettingsContext';
import type { SessionWord, WordCategory } from '../../types';
import { MIN_WORDS_FOR_GAMES } from '../../constants';

interface UseEslCommandsProps {
  activeModule: number;
  setActiveModule: (n: number) => void;
  sessionVocabulary: SessionWord[];
  setSessionVocabulary: (fn: (prev: SessionWord[]) => SessionWord[]) => void;
  isGameReady: boolean;
  setShowGamesGrid: (v: boolean) => void;
  gameFilters: GameFilters;
  setGameFilters: (fn: (prev: GameFilters) => GameFilters) => void;
  settings: SettingsState;
  setSettings: (fn: (prev: SettingsState) => SettingsState) => void;
  resetSetup: () => void;
}

const MODULE_LABELS: { id: number; label: string; labelDe: string; icon: string }[] = [
  { id: 0, label: 'Word Selection', labelDe: 'Wortauswahl', icon: '📚' },
  { id: 1, label: 'Word List', labelDe: 'Wortliste', icon: '📋' },
  { id: 2, label: 'Numbers', labelDe: 'Zahlen', icon: '🔢' },
  { id: 3, label: 'Letter Explanation', labelDe: 'Buchstabenerklärung', icon: '📝' },
  { id: 4, label: 'Memory Bomb', labelDe: 'Memory Bombe', icon: '🧠' },
  { id: 5, label: 'Rocket Launch', labelDe: 'Raketenstart', icon: '🚀' },
  { id: 6, label: 'Battleships', labelDe: 'Schiffe versenken', icon: '🚢' },
  { id: 7, label: 'Bingo', labelDe: 'Bingo', icon: '🎯' },
  { id: 8, label: 'Word Review', labelDe: 'Wortrückblick', icon: '📖' },
  { id: 9, label: 'Settings', labelDe: 'Einstellungen', icon: '⚙️' },
  { id: 10, label: 'Alphabet Overview', labelDe: 'Alphabetübersicht', icon: '🔎' },
];

// Game modules that require MIN_WORDS_FOR_GAMES
const GAME_MODULE_IDS = new Set([4, 5, 6, 7, 8]);

export function useEslCommands({
  activeModule,
  setActiveModule,
  sessionVocabulary,
  setSessionVocabulary,
  isGameReady,
  setShowGamesGrid,
  gameFilters,
  setGameFilters,
  settings,
  setSettings,
  resetSetup,
}: UseEslCommandsProps): { commands: Command[]; categoryLabels: Record<string, string> } {
  const lang = settings.ui.language;
  const isEn = lang === 'en';

  const commands = useMemo<Command[]>(() => {
    const cmds: Command[] = [];
    const needsMoreWords = sessionVocabulary.length < MIN_WORDS_FOR_GAMES;

    // ── Navigation (11 modules) ─────────────────────────────────
    for (const mod of MODULE_LABELS) {
      const isGame = GAME_MODULE_IDS.has(mod.id);
      cmds.push({
        id: `nav-module-${mod.id}`,
        label: isEn ? mod.label : mod.labelDe,
        icon: mod.icon,
        category: 'navigation',
        keywords: [
          mod.label.toLowerCase(),
          mod.labelDe.toLowerCase(),
          'navigate', 'go', 'module',
          `nav-module-${mod.id}`,
        ],
        action: () => { setActiveModule(mod.id); setShowGamesGrid(false); },
        hint: activeModule === mod.id ? '✓' : undefined,
        hidden: isGame && !isGameReady,
      });
    }

    // ── Game Filters: Category ──────────────────────────────────
    cmds.push({
      id: 'filter-category',
      label: isEn ? 'Category Filter' : 'Kategorie-Filter',
      icon: '🏷️',
      category: 'filters',
      keywords: ['category', 'kategorie', 'filter', 'animals', 'colors', 'food', 'filter-category'],
      action: () => {},
      drillable: true,
      hint: gameFilters.category === 'all'
        ? (isEn ? 'All' : 'Alle')
        : gameFilters.category,
    });
    const categoryOptions: { key: WordCategory | 'all'; label: string; labelDe: string }[] = [
      { key: 'all', label: 'All Categories', labelDe: 'Alle Kategorien' },
      { key: 'animals', label: 'Animals', labelDe: 'Tiere' },
      { key: 'colors', label: 'Colors', labelDe: 'Farben' },
      { key: 'food', label: 'Food', labelDe: 'Essen' },
      { key: 'other', label: 'Other', labelDe: 'Sonstiges' },
    ];
    for (const cat of categoryOptions) {
      cmds.push({
        id: `filter-category-${cat.key}`,
        label: isEn ? cat.label : cat.labelDe,
        icon: '🏷️',
        category: 'filters',
        keywords: [cat.key, cat.label.toLowerCase(), cat.labelDe.toLowerCase(), `filter-category-${cat.key}`],
        action: () => setGameFilters(prev => ({ ...prev, category: cat.key })),
        parentId: 'filter-category',
        hint: gameFilters.category === cat.key ? '✓' : undefined,
      });
    }

    // ── Game Filters: Max Word Length ────────────────────────────
    cmds.push({
      id: 'filter-length',
      label: isEn ? 'Max Word Length' : 'Max. Wortlänge',
      icon: '📏',
      category: 'filters',
      keywords: ['length', 'länge', 'word', 'wort', 'max', 'filter-length'],
      action: () => {},
      drillable: true,
      hint: gameFilters.maxWordLength ? `≤ ${gameFilters.maxWordLength}` : (isEn ? 'No limit' : 'Kein Limit'),
    });
    const lengthOptions: { value: number | null; label: string }[] = [
      { value: null, label: isEn ? 'No limit' : 'Kein Limit' },
      { value: 4, label: '≤ 4' },
      { value: 5, label: '≤ 5' },
      { value: 6, label: '≤ 6' },
      { value: 8, label: '≤ 8' },
    ];
    for (const opt of lengthOptions) {
      cmds.push({
        id: `filter-length-${opt.value ?? 'none'}`,
        label: opt.label,
        icon: '📏',
        category: 'filters',
        keywords: [String(opt.value), 'length', `filter-length-${opt.value ?? 'none'}`],
        action: () => setGameFilters(prev => ({ ...prev, maxWordLength: opt.value })),
        parentId: 'filter-length',
        hint: gameFilters.maxWordLength === opt.value ? '✓' : undefined,
      });
    }

    // ── Game Filters: Vocab Source ───────────────────────────────
    cmds.push({
      id: 'filter-source',
      label: isEn ? 'Vocab Source' : 'Vokabelquelle',
      icon: '📂',
      category: 'filters',
      keywords: ['source', 'quelle', 'vocab', 'alphabet', 'custom', 'filter-source'],
      action: () => {},
      drillable: true,
      hint: gameFilters.vocabSource === 'all'
        ? (isEn ? 'All' : 'Alle')
        : gameFilters.vocabSource,
    });
    const sourceOptions: { key: 'all' | 'alphabet' | 'custom'; label: string; labelDe: string }[] = [
      { key: 'all', label: 'All Sources', labelDe: 'Alle Quellen' },
      { key: 'alphabet', label: 'Alphabet Words', labelDe: 'Alphabet-Wörter' },
      { key: 'custom', label: 'Custom Words', labelDe: 'Eigene Wörter' },
    ];
    for (const src of sourceOptions) {
      cmds.push({
        id: `filter-source-${src.key}`,
        label: isEn ? src.label : src.labelDe,
        icon: '📂',
        category: 'filters',
        keywords: [src.key, src.label.toLowerCase(), `filter-source-${src.key}`],
        action: () => setGameFilters(prev => ({ ...prev, vocabSource: src.key })),
        parentId: 'filter-source',
        hint: gameFilters.vocabSource === src.key ? '✓' : undefined,
      });
    }

    // ── Actions ─────────────────────────────────────────────────
    cmds.push({
      id: 'action-shuffle',
      label: isEn ? 'Shuffle Words' : 'Wörter mischen',
      icon: '🔀',
      category: 'actions',
      keywords: ['shuffle', 'mischen', 'random', 'zufall', 'action-shuffle'],
      action: () => {
        setSessionVocabulary(prev => {
          const arr = [...prev];
          for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
          }
          return arr;
        });
      },
      hidden: sessionVocabulary.length === 0,
    });
    cmds.push({
      id: 'action-clear',
      label: isEn ? 'Clear All Vocabulary' : 'Alle Vokabeln löschen',
      icon: '🗑️',
      category: 'actions',
      keywords: ['clear', 'löschen', 'reset', 'zurücksetzen', 'vocabulary', 'action-clear'],
      action: () => {
        if (window.confirm(isEn ? 'Clear all vocabulary and reset? This cannot be undone.' : 'Alle Vokabeln löschen und zurücksetzen? Das kann nicht rückgängig gemacht werden.')) {
          resetSetup();
        }
      },
    });
    cmds.push({
      id: 'action-add-word',
      label: isEn ? 'Add Custom Word' : 'Eigenes Wort hinzufügen',
      icon: '➕',
      category: 'actions',
      keywords: ['add', 'hinzufügen', 'word', 'wort', 'custom', 'eigene', 'action-add-word'],
      action: () => { setActiveModule(0); setShowGamesGrid(false); },
    });

    // ── Settings ────────────────────────────────────────────────
    cmds.push({
      id: 'settings-audio',
      label: isEn
        ? (settings.audio.global ? 'Disable Audio' : 'Enable Audio')
        : (settings.audio.global ? 'Audio deaktivieren' : 'Audio aktivieren'),
      icon: settings.audio.global ? '🔊' : '🔇',
      category: 'settings',
      keywords: ['audio', 'sound', 'ton', 'mute', 'settings-audio'],
      action: () => setSettings(s => ({ ...s, audio: { ...s.audio, global: !s.audio.global } })),
      hint: settings.audio.global ? 'ON' : 'OFF',
    });

    cmds.push({
      id: 'settings-language',
      label: isEn ? 'Language' : 'Sprache',
      icon: '🌐',
      category: 'settings',
      keywords: ['language', 'sprache', 'deutsch', 'english', 'settings-language'],
      action: () => {},
      drillable: true,
      hint: settings.ui.language === 'en' ? 'English' : 'Deutsch',
    });
    cmds.push({
      id: 'settings-language-en',
      label: 'English',
      icon: '🌐',
      category: 'settings',
      keywords: ['english', 'en', 'settings-language-en'],
      action: () => setSettings(s => ({ ...s, ui: { ...s.ui, language: 'en' } })),
      parentId: 'settings-language',
      hint: settings.ui.language === 'en' ? '✓' : undefined,
    });
    cmds.push({
      id: 'settings-language-de',
      label: 'Deutsch',
      icon: '🌐',
      category: 'settings',
      keywords: ['deutsch', 'de', 'german', 'settings-language-de'],
      action: () => setSettings(s => ({ ...s, ui: { ...s.ui, language: 'de' } })),
      parentId: 'settings-language',
      hint: settings.ui.language === 'de' ? '✓' : undefined,
    });

    cmds.push({
      id: 'settings-theme',
      label: settings.ui.theme === 'dark'
        ? (isEn ? 'Switch to Light Mode' : 'Zum hellen Modus wechseln')
        : (isEn ? 'Switch to Dark Mode' : 'Zum dunklen Modus wechseln'),
      icon: settings.ui.theme === 'dark' ? '☀️' : '🌙',
      category: 'settings',
      keywords: ['dark', 'light', 'theme', 'dunkel', 'hell', 'mode', 'settings-theme'],
      action: () => setSettings(s => ({
        ...s,
        ui: { ...s.ui, theme: s.ui.theme === 'dark' ? 'light' : 'dark' },
      })),
      hint: settings.ui.theme === 'dark' ? 'Dark' : 'Light',
    });

    // ── Contextual ──────────────────────────────────────────────
    if (needsMoreWords) {
      cmds.push({
        id: 'ctx-add-words',
        label: isEn
          ? `Add more words (${sessionVocabulary.length}/${MIN_WORDS_FOR_GAMES} minimum)`
          : `Mehr Wörter hinzufügen (${sessionVocabulary.length}/${MIN_WORDS_FOR_GAMES} Minimum)`,
        icon: '⚠️',
        category: 'contextual',
        keywords: ['add', 'words', 'more', 'hinzufügen', 'wörter', 'ctx-add-words'],
        action: () => { setActiveModule(0); setShowGamesGrid(false); },
        scoreBoost: 50,
      });
    }

    // Show "Back to Word Selection" when on a game module
    if (GAME_MODULE_IDS.has(activeModule) || activeModule === 1 || activeModule === 3) {
      cmds.push({
        id: 'ctx-back-to-selection',
        label: isEn ? 'Back to Word Selection' : 'Zurück zur Wortauswahl',
        icon: '↩️',
        category: 'contextual',
        keywords: ['back', 'zurück', 'word', 'selection', 'wortauswahl', 'ctx-back-to-selection'],
        action: () => { setActiveModule(0); setShowGamesGrid(false); },
        scoreBoost: 30,
      });
    }

    return cmds;
  }, [
    activeModule, setActiveModule, sessionVocabulary, setSessionVocabulary,
    isGameReady, setShowGamesGrid, gameFilters, setGameFilters,
    settings, setSettings, resetSetup, lang, isEn,
  ]);

  const categoryLabels = useMemo<Record<string, string>>(() => ({
    navigation: isEn ? 'Navigation' : 'Navigation',
    filters: isEn ? 'Game Filters' : 'Spielfilter',
    actions: isEn ? 'Actions' : 'Aktionen',
    settings: isEn ? 'Settings' : 'Einstellungen',
    contextual: isEn ? 'Suggested' : 'Vorschläge',
  }), [isEn]);

  return { commands, categoryLabels };
}
