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

## Verification

- `npm test` — regression tests.
- `npm run typecheck` — TypeScript validation.
- `npm run build` — production assets in `dist/`.
