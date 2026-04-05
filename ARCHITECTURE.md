# Architecture — ESL Lesson Adventure

## Purpose
Browser-based interactive ESL lesson tool for English teachers. Students build a per-session alphabet vocabulary (A–Z), then play word games using those words. No backend — fully client-side.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 6 |
| Styling | Tailwind CSS 4 (PostCSS plugin) |
| State | React Context + `useState` (no Redux/Zustand) |
| Persistence | `localStorage` (two keys: vocabulary + settings) |
| Images | Emoji strings or base64-encoded SVG `data:` URIs |

## Folder Structure

```
esl-lesson-adventure/
├── index.html              # Vite entry HTML
├── index.tsx               # React root mount
├── App.tsx                 # Root component — nav, module routing, localStorage sync
├── types.ts                # Core types + ALPHABET const + re-export of DEFAULT_ALPHABET_WORDS
├── constants.ts            # DEFAULT_ALPHABET_WORDS, MIN_WORDS_FOR_GAMES, ROCKET_PARTS, etc.
├── emojiDatabase.ts        # Emoji lookup helpers
├── metadata.json           # App metadata (unused at runtime)
├── components/
│   ├── GameFiltersPanel.tsx    # Global filter bar (category / max length / source)
│   ├── ImageRenderer.tsx       # Renders emoji string or base64 img tag
│   ├── Modal.tsx               # Generic modal wrapper
│   ├── ModuleContainer.tsx     # Shared module shell (title, back button)
│   └── CategoryAddWord.tsx     # Reusable "add word by category" UI
├── contexts/
│   ├── SessionVocabularyContext.tsx  # sessionVocabulary array + setter
│   ├── GameFiltersContext.tsx        # category / maxWordLength / vocabSource filters
│   └── SettingsContext.tsx           # audio flags, game prefs, UI language/theme
├── modules/
│   ├── Module0_WordSelection/    # Main vocab builder — pick words per letter A–Z
│   ├── Module1_AlphabetCreator/  # Older letter-by-letter wizard (one word per letter)
│   ├── Module2_MemoryBomb/       # Card-flip memory matching game
│   ├── Module3_RocketLaunch/     # Hangman-style game (rocket drawing = wrong guesses)
│   ├── Module4_Battleships/      # Battleships grid — say coordinates to sink ships
│   ├── Module4_Bingo/            # Printable BINGO card generator + live game
│   ├── Module5_WordReview/       # Flashcard-style vocabulary review
│   ├── Module6_LetterExplanation/# Simple word list display (no interactivity)
│   ├── ModuleAlphabetOverview/   # Read-only A–Z summary of chosen words
│   ├── ModuleNumbers/            # Numbers learning module (independent of vocab)
│   ├── ModuleSettings/           # Audio, game prefs, UI language toggle
│   └── ModuleWordList/           # Editable full word list with remove/add
└── utils/
    └── bingoExport.ts            # generateBingoCards() + exportBingoCardsToPDF()
```

## Key Types

```ts
SessionWord {
  letter: string;       // 'A'–'Z' — which alphabet slot
  word: string;
  image: string;        // emoji char or "data:image/svg+xml;base64,..."
  category: 'animals' | 'colors' | 'food' | 'other';
  pronunciation?: string;  // German phonetic hint, teacher-editable
  predefined?: boolean;    // true = from DEFAULT_ALPHABET_WORDS
}
```

## Module ID → Component Map

| `activeModule` | Component | Notes |
|---|---|---|
| 0 | Module0_WordSelection | Default landing; multi-word-per-letter picker |
| 1 | ModuleWordList | Full editable word list |
| 2 | ModuleNumbers | Standalone — no vocab dependency |
| 3 | Module6_LetterExplanation | Simple display (mislabeled Module7 in import) |
| 4 | Module2_MemoryBomb | Needs vocab; reads context |
| 5 | Module3_RocketLaunch | Hangman variant |
| 6 | Module4_Battleships | Receives vocab + onBack as props |
| 7 | Module4_Bingo | Generates printable cards |
| 8 | Module5_WordReview | Flashcard review |
| 9 | ModuleSettings | App settings |
| 10 | ModuleAlphabetOverview | Read-only A–Z view |

## Data Flow

```
DEFAULT_ALPHABET_WORDS (constants.ts)
        │  predefined words pool
        ▼
Module0_WordSelection
  └─ onWordsUpdate(words[]) ──► App.tsx state: sessionVocabulary[]
                                        │
                          ┌─────────────┤
                          │             │
                          ▼             ▼
                  localStorage    SessionVocabularyContext
                  (persisted)     (consumed by game modules)
                                        │
                              GameFiltersContext
                              (category / length / source)
                                        │
                                   Game modules
                             filter vocab → render game
```

- `App.tsx` owns `sessionVocabulary` and `isSetupComplete` — passed to vocab modules as props, exposed to game modules via `SessionVocabularyContext`.
- `GameFilters` live in `App.tsx` state, exposed via `GameFiltersContext`. Games apply these filters locally before rendering.
- `SettingsContext` is self-contained (reads/writes its own `localStorage` key).
- Games require `MIN_WORDS_FOR_GAMES = 15` before the Games button appears.

## Patterns & Conventions

- **Module routing**: flat integer switch in `App.tsx` (`activeModule`). No router library.
- **Context pattern**: thin — contexts are just `createContext` + provider alias. State lives in `App.tsx`, not inside the context.
- **Image encoding**: two formats coexist — emoji Unicode string (most words) and `data:image/svg+xml;base64,` (rare, e.g. xylophone). `ImageRenderer` handles both.
- **Persistence**: two `localStorage` keys — `esl-lesson-vocabulary` (vocab + last module) and `esl-lesson-settings` (settings). Each loaded at mount, saved on change via `useEffect`.
- **Tailwind 4**: uses `@tailwindcss/postcss` plugin — no `tailwind.config.js` directives needed in CSS; config in `tailwind.config.js` is minimal.
- **No test suite** — no test runner configured.

## Known Quirks & Gotchas

- `Module1_AlphabetCreator` is an older wizard (one word per letter max). It's not reachable from the current nav — it was superseded by `Module0_WordSelection` which allows multiple words per letter.
- `Module4_Battleships` (id=6) receives `sessionVocabulary` and `onBack` as direct props from `App.tsx` — it does NOT use `SessionVocabularyContext`, unlike all other game modules.
- The file is named `Module6_LetterExplanation/` but is imported as `Module7LetterExplanation` in `App.tsx` — naming mismatch, no functional impact.
- Two modules share the `Module4_` prefix: `Module4_Battleships` and `Module4_Bingo`. They are separate, unrelated games.
- `bingoExport.ts` uses `window.open()` + `document.write()` for PDF printing — not a real PDF library, just a print dialog trigger.
- Vocabulary is keyed by `letter + word` string concatenation — no UUID. Duplicate word+letter combinations are not prevented by the data model.
- `SettingsContext` default UI language is `'de'` (German) — the app is bilingual (DE teacher interface, EN student content).
