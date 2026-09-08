<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1l1ysFns_nl3fUi4e4fX9GjcuZREfBNJQ

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

## Classroom games

Select vocabulary in **Word Selection** (or auto-fill empty letters for a demo).
The Games menu unlocks at 15 words. **Treasure Hunt** is a cooperative alternative
to Battleships: find treasures of different sizes, each covering 2, 3 or 4 squares
in a straight line across or down. Treasures never touch, even diagonally. Each hit
uncovers part of a treasure; uncover all its squares to collect it. Choose
maps from 4 × 4 to 16 × 16 and independently select 0–6 treasures of each size
(2, 3 or 4 squares). At least one treasure is required; crowded layouts show a
message asking for fewer treasures or a larger map. **Finish round** lets the teacher stop at any time; **New round** resets.
**Your team vs computer** uses the same map with alternating turns. The team goes
first. Whoever uncovers a treasure’s final square gets one point, regardless of
its size. The computer follows revealed hits and otherwise chooses an unexplored
square; it cannot inspect hidden positions. Most collected treasures wins; equal
scores are a draw, including when the teacher finishes early. Setup changes apply
to the next round.

Vocabulary/settings are saved in the current browser, not shared with other visitors.

Spoken English in Numbers, Word List Simple and Bingo explicitly uses `en-US`,
independently of the interface or browser language.

## Verification and hosting

- `npm test` — game utility regression tests.
- `npm run typecheck` — TypeScript validation.
- `npm run build` — production assets in `dist/`.
- Deploy the built static assets with Vercel; no backend or API key is needed.
  First link the build folder explicitly (Vite rebuilds remove that link):
  `npx vercel link --cwd dist --project esl-lesson-adventure --yes --scope mariowabnigs-projects`
  Then `npx vercel deploy dist --prod --scope mariowabnigs-projects`.
  Never deploy an unlinked `dist` folder: it can create a separate project named dist.
- Rebuild before deploying changes. Vercel connected the existing GitHub repository. Local edits must be committed and pushed separately to reach GitHub; CLI deployments publish the current build.

Live website: https://esl-lesson-adventure.vercel.app

## Prepared word pictures

24 generated illustrations are bundled with the website in `public/word-pictures/`.
They appear automatically for matching words in the word picker, saved vocabulary,
alphabet overview, picture games and printable Bingo. Type a matching custom word
(e.g. hamster or schoolbag) to use its picture immediately. Bike, backpack,
ice-cream, teddy and soccer ball are also recognised. Other words retain emoji
support. No image API key or generation step is needed in class.

The full list and generation provenance are in `docs/word-picture-sources.json`.
Word matching and image fallback are shared in `utils/wordPictures.ts`; supplied
data images are preserved. Use `npm test` to check aliases and asset completeness.

Vocabulary is displayed in lowercase across word lists, flashcards, games and Bingo
printouts. Alphabet buttons and coordinate labels retain uppercase letters.

Game menu descriptions and game instructions are in German; English vocabulary,
coordinate practice and spoken example phrases remain in English. Treasure Hunt
animates each revealed miss (leaf), partial find (diamond), and all cells of a
collected treasure (stars). Effects run once per move, reset with a new round,
and respect the system's reduced-motion preference.

Every game has a sticky **Zurück zu den Spielen** button. Game overlays are scoped
to their activity so the return button and lesson navigation remain accessible.
Battleships' own back buttons also return to the game selection.

**Guess the Word / Rocket Launch** offers **Weltraum** (illustrated space scene)
and **Linienzeichnung** (original line-art rocket). Switching views preserves the
round. Both build toward the selected mistake limit and animate lift-off; correct
letters reveal with a pop and guessed keys show a tick or cross. Results stay
inside the game, with hints disabled after the round. Word filters restart the
round, honour minimum length, and show an empty state when nothing matches.
Spaces and punctuation are visible clues, so multiword vocabulary is solvable.

Battleships animates water, hits and every cell of a newly sunk ship. Its final
board remains visible, with shooting disabled after game over. All new effects
respect reduced motion. Verification includes word-completion regression tests
and browser checks for rocket win/loss, view switching, navigation and ship effects.

Word Selection shows a short German-spelling pronunciation aid under each A–Z
button (e.g. C = sie, P = pie), without IPA. A colon marks a long sound. Z follows
the app's American English voice (sie); the explanatory note also gives British
sed. These letter-name hints are separate from editable vocabulary notes.

Custom words without a prepared picture or matching emoji display the word itself
instead of a placeholder, including printable Bingo. Card media stays inside its
allocated slot and does not intercept clicks or start image dragging. Memory and
Word Review use keyboard-accessible buttons; Memory reserves space for its label
so pictures cannot expand across adjacent cards.

Battleships now opens **Flottenjagd**, with Treasure Hunt feature parity: 4–16
square sides, 0–6 ships of each length (2/3/4), separated random placement,
cooperative or alternating team/computer play on a shared fleet, last-hit points,
score comparison including draws, early finish, per-round settings snapshots,
coordinate selection/input, progress counters and hit/miss/sunk animations.
Computer moves use only public hits/misses and are cancelled on finish, restart
or leaving the view. The former Battleships modes remain under **Bisherige
Spielmodi**; changing versions starts fresh.

Both Treasure Hunt and Flottenjagd support 3/5/10/15/20 lives per side (default 5),
or unlimited. A miss costs one life; hits do not. In cooperative play zero lives
ends the round; against the computer the first side at zero loses. Otherwise
completed-board and early-finish results use collected-object scores. Life limits
are frozen at round start. Pending computer moves cancel when a round ends.
The previous Battleships computer button now routes to the functioning shared-fleet
computer game rather than the unfinished legacy placement flow.

Treasure Hunt and Flottenjagd use compact play views. Setup collapses when a round
starts, rules are expandable, and the full grid scales to the viewport height.
Round controls remain available above the board. Cells use white for unvisited,
orange for partial hits, blue for misses and green for completed objects, with
symbols and accessible state labels alongside a visible color legend.
