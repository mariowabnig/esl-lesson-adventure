import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import type { Command, DisplayCommand, FrecencyMap } from './useCommandPalette';
import {
  multiTokenScore,
  fuzzyMatchIndices,
  loadFrecency,
  saveFrecency as saveFrecencyUtil,
  getTopFrecent,
} from './useCommandPalette';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_RESULTS = 30;

// ---------------------------------------------------------------------------
// Match highlighting
// ---------------------------------------------------------------------------

const HighlightedLabel = React.memo<{ label: string; matchIndices: number[] }>(({ label, matchIndices }) => {
  if (matchIndices.length === 0) return <>{label}</>;
  const matchSet = new Set(matchIndices);
  const parts: React.ReactNode[] = [];
  let run = '';
  let runIsMatch = false;

  for (let i = 0; i < label.length; i++) {
    const isMatch = matchSet.has(i);
    if (isMatch !== runIsMatch && run) {
      parts.push(
        runIsMatch
          ? <mark key={i} className="bg-transparent font-semibold text-blue-500 dark:text-blue-400">{run}</mark>
          : <span key={i}>{run}</span>
      );
      run = '';
    }
    run += label[i];
    runIsMatch = isMatch;
  }
  if (run) {
    parts.push(
      runIsMatch
        ? <mark key="end" className="bg-transparent font-semibold text-blue-500 dark:text-blue-400">{run}</mark>
        : <span key="end">{run}</span>
    );
  }
  return <>{parts}</>;
});
HighlightedLabel.displayName = 'HighlightedLabel';

// ---------------------------------------------------------------------------
// PaletteRow
// ---------------------------------------------------------------------------

interface PaletteRowProps {
  id: string;
  icon: string;
  label: string;
  hint?: string;
  shortcut?: string;
  matchIndices: number[];
  drillable?: boolean;
  flatIdx: number;
  isActive: boolean;
  onExecute: (id: string) => void;
  onHover: (idx: number) => void;
}

const PaletteRow = React.memo<PaletteRowProps>(({ id, icon, label, hint, shortcut, matchIndices, drillable, flatIdx, isActive, onExecute, onHover }) => (
  <button
    id={`cmd-palette-item-${id}`}
    role="option"
    aria-selected={isActive}
    data-active={isActive}
    tabIndex={-1}
    className={`
      w-full flex items-center gap-3 px-4 py-2 text-left text-sm transition-colors
      ${isActive
        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'}
    `}
    onMouseDown={e => e.preventDefault()}
    onClick={() => onExecute(id)}
    onMouseEnter={() => onHover(flatIdx)}
  >
    <span className="text-base shrink-0 w-6 text-center">{icon}</span>
    <span className="truncate flex-1">
      <HighlightedLabel label={label} matchIndices={matchIndices} />
    </span>
    {hint && (
      <span className="text-[11px] text-slate-400 dark:text-slate-500 shrink-0">{hint}</span>
    )}
    <span className={`${hint ? '' : 'ml-auto '}flex items-center gap-1.5 shrink-0`}>
      {shortcut && (
        <kbd className="inline-flex items-center rounded border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 dark:text-slate-500">
          {shortcut}
        </kbd>
      )}
      {isActive && drillable && (
        <span className="text-[11px] text-slate-400 dark:text-slate-500">⇥</span>
      )}
      {isActive && (
        <span className="text-[11px] text-slate-400 dark:text-slate-500">↵</span>
      )}
    </span>
  </button>
));
PaletteRow.displayName = 'PaletteRow';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface CommandPaletteProps {
  /** All available commands (including children for drill-down) */
  commands: Command[];
  /** Localized category labels: { 'navigation': 'Navigation', ... } */
  categoryLabels: Record<string, string>;
  /** localStorage key for frecency data */
  storageKey: string;
  /** Max recent commands to show */
  maxRecent?: number;
  /** Whether to disable the palette (e.g. during modals) */
  disabled?: boolean;
  /** Keyboard shortcut to open — default 'k' (⌘K / Ctrl+K) */
  openKey?: string;
  /** Localized strings */
  strings?: {
    placeholder?: string;
    noResults?: string;
    recent?: string;
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const CommandPalette: React.FC<CommandPaletteProps> = ({
  commands,
  categoryLabels,
  storageKey,
  maxRecent = 5,
  disabled = false,
  openKey = 'k',
  strings = {} as NonNullable<CommandPaletteProps['strings']>,
}) => {
  const {
    placeholder = 'Search commands...',
    noResults = 'No matching commands',
    recent: recentLabel = 'Recent',
  } = strings;

  // State
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [frecencyMap, setFrecencyMap] = useState<FrecencyMap>(() => loadFrecency(storageKey));
  const [drillStack, setDrillStack] = useState<Command[]>([]);
  const [slideDirection, setSlideDirection] = useState<'none' | 'left' | 'right'>('none');
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const closingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    if (slideDirection !== 'none') {
      const timer = setTimeout(() => setSlideDirection('none'), 120);
      return () => clearTimeout(timer);
    }
  }, [slideDirection]);

  const recentIds = useMemo(() => getTopFrecent(frecencyMap, maxRecent), [frecencyMap, maxRecent]);
  const drillParent = drillStack.length > 0 ? drillStack[drillStack.length - 1] : null;

  // Open / Close
  const open = useCallback(() => {
    if (closingTimerRef.current) { clearTimeout(closingTimerRef.current); closingTimerRef.current = null; }
    setIsClosing(false);
    setQuery('');
    setActiveIndex(0);
    setDrillStack([]);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    if (!prefersReducedMotion.current) {
      setIsClosing(true);
      closingTimerRef.current = setTimeout(() => {
        setIsOpen(false); setIsClosing(false); setDrillStack([]); closingTimerRef.current = null;
      }, 100);
    } else {
      setIsOpen(false); setDrillStack([]);
    }
  }, []);

  // Global keyboard listener
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (disabled) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === openKey) {
        e.preventDefault();
        e.stopPropagation();
        isOpenRef.current ? close() : open();
      }
      if (e.key === 'Escape' && isOpenRef.current) { e.preventDefault(); close(); }
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [open, close, disabled, openKey]);

  useEffect(() => { if (isOpen) requestAnimationFrame(() => inputRef.current?.focus()); }, [isOpen]);

  // Filter & sort
  const visibleCommands = useMemo(() => commands.filter(c => !c.hidden), [commands]);

  const { childIndex, cmdById } = useMemo(() => {
    const children = new Map<string, Command[]>();
    const byId = new Map<string, Command>();
    for (const cmd of visibleCommands) {
      byId.set(cmd.id, cmd);
      if (cmd.parentId) {
        const arr = children.get(cmd.parentId);
        if (arr) arr.push(cmd); else children.set(cmd.parentId, [cmd]);
      }
    }
    return { childIndex: children, cmdById: byId };
  }, [visibleCommands]);

  const drillParentId = drillParent?.id ?? null;

  const filtered: DisplayCommand[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    const tokens = q.split(/\s+/).filter(Boolean);
    const scoreCmd = (kws: string[]): number => multiTokenScore(tokens, kws);

    if (drillParentId) {
      const children = childIndex.get(drillParentId) ?? [];
      if (q.length === 0) return children.map(c => ({ ...c, _displayCategory: c.category, matchIndices: [] }));
      return children
        .map(cmd => ({ cmd, score: scoreCmd(cmd.keywords) }))
        .filter(x => x.score >= 0)
        .sort((a, b) => b.score - a.score)
        .map(({ cmd }) => ({ ...cmd, _displayCategory: cmd.category, matchIndices: fuzzyMatchIndices(q, cmd.label) }));
    }

    if (q.length === 0) {
      const recentSet = new Set(recentIds);
      const recent = recentIds.map(id => cmdById.get(id)).filter(Boolean) as Command[];
      const rest = visibleCommands.filter(c => !recentSet.has(c.id) && !c.searchOnly);
      const recentTagged: DisplayCommand[] = recent.map(c => ({ ...c, _displayCategory: 'recent', matchIndices: [] }));
      const restTagged: DisplayCommand[] = rest.map(c => ({ ...c, _displayCategory: c.category, matchIndices: [] }));
      return [...recentTagged, ...restTagged];
    }

    let scored = visibleCommands
      .map(cmd => ({ cmd, score: scoreCmd(cmd.keywords) + (cmd.scoreBoost ?? 0) }))
      .filter(x => x.score >= 0)
      .sort((a, b) => b.score - a.score);
    if (scored.length > MAX_RESULTS) scored = scored.slice(0, MAX_RESULTS);
    return scored.map(({ cmd }) => ({ ...cmd, _displayCategory: cmd.category, matchIndices: fuzzyMatchIndices(q, cmd.label) }));
  }, [query, visibleCommands, recentIds, drillParentId, childIndex, cmdById]);

  // Grouped results
  const hasQuery = query.trim().length > 0;

  const grouped = useMemo(() => {
    if (hasQuery) return filtered.length === 0 ? [] : [{ category: filtered[0]._displayCategory, items: filtered }];
    const groups: { category: string; items: DisplayCommand[] }[] = [];
    let lastCat: string | null = null;
    for (const item of filtered) {
      if (item._displayCategory !== lastCat) {
        groups.push({ category: item._displayCategory, items: [] });
        lastCat = item._displayCategory;
      }
      groups[groups.length - 1].items.push(item);
    }
    return groups;
  }, [filtered, hasQuery]);

  const groupOffsets = useMemo(() => {
    const offsets: number[] = [];
    let offset = 0;
    for (const group of grouped) { offsets.push(offset); offset += group.items.length; }
    return offsets;
  }, [grouped]);

  // Execute
  const cmdByIdRef = useRef(cmdById);
  cmdByIdRef.current = cmdById;

  const execute = useCallback((cmdId: string) => {
    const cmd = cmdByIdRef.current.get(cmdId);
    if (!cmd) return;
    setFrecencyMap(prev => {
      const now = Date.now();
      const existing = prev[cmdId];
      const updated = { ...prev, [cmdId]: { count: (existing?.count ?? 0) + 1, lastUsed: now } };
      saveFrecencyUtil(updated, storageKey);
      return updated;
    });
    cmd.action();
    setIsOpen(false); setIsClosing(false); setDrillStack([]);
  }, [storageKey]);

  // Drill
  const drillInto = useCallback((cmd: Command) => {
    if (!prefersReducedMotion.current) setSlideDirection('left');
    setDrillStack(prev => [...prev, cmd]);
    setQuery(''); setActiveIndex(0);
  }, []);

  const drillBack = useCallback(() => {
    if (!prefersReducedMotion.current) setSlideDirection('right');
    setDrillStack(prev => prev.slice(0, -1));
    setQuery(''); setActiveIndex(0);
  }, []);

  const drillTo = useCallback((index: number) => {
    if (!prefersReducedMotion.current) setSlideDirection('right');
    setDrillStack(prev => prev.slice(0, index + 1));
    setQuery(''); setActiveIndex(0);
  }, []);

  // Keyboard navigation
  const filteredRef = useRef(filtered);
  filteredRef.current = filtered;
  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;
  const drillStackRef = useRef(drillStack);
  drillStackRef.current = drillStack;

  useEffect(() => { setActiveIndex(0); if (listRef.current) listRef.current.scrollTop = 0; }, [query, drillStack.length]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const len = filteredRef.current.length;
    const clamp = (idx: number) => Math.max(0, Math.min(idx, len - 1));

    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); setActiveIndex(prev => clamp(prev + 1)); break;
      case 'ArrowUp': e.preventDefault(); setActiveIndex(prev => clamp(prev - 1)); break;
      case 'Tab': {
        const target = filteredRef.current[activeIndexRef.current];
        if (target?.drillable) { e.preventDefault(); drillInto(target); }
        break;
      }
      case 'Backspace': {
        const input = e.target as HTMLInputElement;
        if (drillStackRef.current.length > 0 && input.value === '') { e.preventDefault(); drillBack(); }
        break;
      }
      case 'Enter': {
        e.preventDefault();
        const target = filteredRef.current[activeIndexRef.current];
        if (target) execute(target.id);
        break;
      }
      case 'Escape':
        e.preventDefault();
        if (drillStackRef.current.length > 0) drillBack(); else close();
        break;
    }
  }, [execute, drillInto, drillBack, close]);

  // Scroll active into view
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector('[data-active="true"]');
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  // Render
  if (!isOpen || disabled) return null;

  return createPortal(
    <>
      <div
        className={`fixed inset-0 z-[9998] bg-black/50${isClosing ? ' animate-backdrop-fade-out' : ''}`}
        onClick={close}
        onTouchEnd={close}
        aria-hidden
      />
      <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-0 sm:pt-[15vh] px-0 sm:px-4 pointer-events-none">
        <div
          className={`pointer-events-auto w-full h-full sm:h-auto sm:max-w-lg rounded-none sm:rounded-xl border-0 sm:border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl overflow-hidden ${isClosing ? 'animate-command-palette-out' : 'animate-command-palette-in'}`}
          role="dialog"
          aria-label="Command Palette"
        >
          {/* Search */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            {drillStack.map((parent, idx) => (
              <button
                key={parent.id}
                tabIndex={-1}
                onMouseDown={e => e.preventDefault()}
                onClick={() => idx < drillStack.length - 1 ? drillTo(idx) : undefined}
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium shrink-0 max-w-[120px] ${
                  idx < drillStack.length - 1
                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-500 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600'
                    : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                }`}
              >
                <span className="shrink-0">{parent.icon}</span>
                <span className="truncate">{parent.label}</span>
                <span className="text-blue-400 ml-0.5 shrink-0">›</span>
              </button>
            ))}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="flex-1 bg-transparent text-base text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none"
              autoComplete="off"
              spellCheck={false}
              role="combobox"
              aria-expanded={true}
              aria-controls="cmd-palette-listbox"
              aria-activedescendant={filtered[activeIndex] ? `cmd-palette-item-${filtered[activeIndex].id}` : undefined}
            />
            <kbd className="hidden sm:inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-1.5 py-0.5 text-[11px] font-medium text-slate-500">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div
            ref={listRef}
            id="cmd-palette-listbox"
            role="listbox"
            className={`max-h-[calc(100vh-8rem)] sm:max-h-[50vh] overflow-y-auto overscroll-contain py-2${
              slideDirection === 'left' ? ' animate-cmd-slide-right-in' :
              slideDirection === 'right' ? ' animate-cmd-slide-left-in' : ''
            }`}
          >
            {filtered.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-slate-400">{noResults}</div>
            )}
            {grouped.map((group, gi) => {
              const baseOffset = groupOffsets[gi];
              return (
                <React.Fragment key={group.category + gi}>
                  {!drillParent && !hasQuery && (
                    <div className="px-4 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 select-none">
                      {group.category === 'recent' ? recentLabel : (categoryLabels[group.category] ?? group.category)}
                    </div>
                  )}
                  {group.items.map((item, ii) => {
                    const flatIdx = baseOffset + ii;
                    return (
                      <PaletteRow
                        key={item.id}
                        id={item.id}
                        icon={item.icon}
                        label={item.label}
                        hint={item.hint}
                        shortcut={item.shortcut}
                        matchIndices={item.matchIndices}
                        drillable={item.drillable}
                        flatIdx={flatIdx}
                        isActive={flatIdx === activeIndex}
                        onExecute={(id) => {
                          const cmd = cmdByIdRef.current.get(id);
                          if (cmd?.drillable) drillInto(cmd);
                          else execute(id);
                        }}
                        onHover={setActiveIndex}
                      />
                    );
                  })}
                </React.Fragment>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 px-4 py-2 border-t border-slate-100 dark:border-slate-700 text-[11px] text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1">
              <kbd className="inline-flex items-center justify-center rounded border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 w-5 h-5 text-[10px]">↑</kbd>
              <kbd className="inline-flex items-center justify-center rounded border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 w-5 h-5 text-[10px]">↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="inline-flex items-center justify-center rounded border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-1.5 h-5 text-[10px]">↵</kbd>
              select
            </span>
            {!drillParent && (
              <span className="flex items-center gap-1">
                <kbd className="inline-flex items-center justify-center rounded border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-1.5 h-5 text-[10px]">⇥</kbd>
                expand
              </span>
            )}
            {drillParent && (
              <span className="flex items-center gap-1">
                <kbd className="inline-flex items-center justify-center rounded border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-1.5 h-5 text-[10px]">⌫</kbd>
                back
              </span>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default CommandPalette;
