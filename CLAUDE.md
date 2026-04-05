# ESL Lesson Adventure

## Required Reading
→ **[ARCHITECTURE.md](./ARCHITECTURE.md)** — app purpose, folder structure, module map, data flow, gotchas

## Stack
- React 19 + TypeScript + Vite 6 + Tailwind CSS 4

## Commands
```bash
npm run dev      # Vite dev server (http://localhost:5173)
npm run build    # Production build → dist/
npm run preview  # Preview production build
```

## Critical Gotchas
- **No router** — navigation is a flat integer switch (`activeModule`) in `App.tsx`
- **No test suite** — no test runner configured
- **Module1_AlphabetCreator** is unreachable from nav (superseded by Module0)
- **Module4_Battleships** takes vocab as props, not from context — unique among game modules
- **`Module6_LetterExplanation/`** is imported as `Module7LetterExplanation` — naming mismatch, don't rename without fixing the import
- **Two Module4_ folders** (`Battleships` + `Bingo`) — unrelated games, naming collision
- Default UI language is `'de'` (German) — bilingual app (DE teacher / EN student)
- Images are emoji strings OR `data:image/svg+xml;base64,` — always use `ImageRenderer` component
- `localStorage` keys: `esl-lesson-vocabulary` (vocab) and `esl-lesson-settings` (settings)
- Minimum 15 words required (`MIN_WORDS_FOR_GAMES`) before Games button appears
