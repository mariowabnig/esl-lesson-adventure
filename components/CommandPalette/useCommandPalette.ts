// ---------------------------------------------------------------------------
// Portable Command Palette — Types & Fuzzy Scoring
// Drop into any React + Tailwind project.
// ---------------------------------------------------------------------------

export interface Command {
  id: string;
  label: string;
  icon: string;
  category: string;
  keywords: string[];
  action: () => void;
  hidden?: boolean;
  searchOnly?: boolean;
  drillable?: boolean;
  parentId?: string;
  hint?: string;
  scoreBoost?: number;
  shortcut?: string;
}

export interface DisplayCommand extends Command {
  _displayCategory: string;
  matchIndices: number[];
}

// ---------------------------------------------------------------------------
// Fuzzy scoring
// ---------------------------------------------------------------------------

const WORD_BOUNDARY = new Set([' ', '-', '_', '.', '/', '\\', ':', ',']);

export function fuzzyScore(query: string, target: string): number {
  if (query.length === 0) return 0;
  if (query.length > target.length) return -1;
  if (target.startsWith(query)) return 1000 + query.length;

  let score = 0;
  let qi = 0;
  let consecutive = 0;

  for (let ti = 0; ti < target.length && qi < query.length; ti++) {
    if (target.charCodeAt(ti) === query.charCodeAt(qi)) {
      qi++;
      consecutive++;
      score += consecutive * 2;
      if (ti === 0 || WORD_BOUNDARY.has(target[ti - 1])) score += 10;
    } else {
      consecutive = 0;
    }
  }

  return qi === query.length ? score : -1;
}

export function multiTokenScore(tokens: string[], keywords: string[]): number {
  let total = 0;
  for (let t = 0; t < tokens.length; t++) {
    let best = -1;
    for (let k = 0; k < keywords.length; k++) {
      const s = fuzzyScore(tokens[t], keywords[k]);
      if (s > best) best = s;
    }
    if (best < 0) return -1;
    total += best;
  }
  return total;
}

export function fuzzyMatchIndices(query: string, target: string): number[] {
  const indices: number[] = [];
  if (query.length === 0) return indices;
  const lq = query.toLowerCase();
  const lt = target.toLowerCase();
  let qi = 0;
  for (let ti = 0; ti < lt.length && qi < lq.length; ti++) {
    if (lt.charCodeAt(ti) === lq.charCodeAt(qi)) {
      indices.push(ti);
      qi++;
    }
  }
  return qi === lq.length ? indices : [];
}

// ---------------------------------------------------------------------------
// Frecency
// ---------------------------------------------------------------------------

interface FrecencyEntry {
  count: number;
  lastUsed: number;
}

export type FrecencyMap = Record<string, FrecencyEntry>;

export function loadFrecency(storageKey: string): FrecencyMap {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveFrecency(map: FrecencyMap, storageKey: string, maxEntries = 50) {
  try {
    const entries = Object.entries(map);
    if (entries.length > maxEntries) {
      const now = Date.now();
      const scored = entries
        .map(([id, entry]) => ({ id, entry, score: computeFrecencyScore(entry, now) }))
        .sort((a, b) => b.score - a.score);
      const pruned: FrecencyMap = {};
      for (let i = 0; i < maxEntries; i++) pruned[scored[i].id] = scored[i].entry;
      localStorage.setItem(storageKey, JSON.stringify(pruned));
      return;
    }
    localStorage.setItem(storageKey, JSON.stringify(map));
  } catch { /* quota errors */ }
}

export function computeFrecencyScore(entry: FrecencyEntry, now: number): number {
  const daysSinceLastUse = (now - entry.lastUsed) / (1000 * 60 * 60 * 24);
  return entry.count * Math.pow(0.95, daysSinceLastUse);
}

export function getTopFrecent(map: FrecencyMap, limit: number): string[] {
  const now = Date.now();
  return Object.entries(map)
    .map(([id, entry]) => ({ id, score: computeFrecencyScore(entry, now) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(e => e.id);
}

// ---------------------------------------------------------------------------
// Keyboard shortcut formatting
// ---------------------------------------------------------------------------

const IS_MAC = typeof navigator !== 'undefined' && /mac/i.test(navigator.platform);

export function translateKeyboardShortcut(shortcut: string): string {
  if (IS_MAC) {
    return shortcut
      .replace(/Ctrl\+/g, '⌘')
      .replace(/Alt\+/g, '⌥')
      .replace(/Shift\+/g, '⇧');
  }
  return shortcut;
}
