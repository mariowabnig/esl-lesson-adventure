import React, { useCallback, useEffect, useState } from "react";
import {
  createSizedTreasures,
  parseGridCoordinate,
} from "../../utils/coordinates";
import {
  chooseComputerSquare,
  uncoverTreasure,
  type Explorer,
  type TreasureProgress,
} from "../../utils/treasureGame";

export default function ModuleTreasureHunt() {
  const [size, setSize] = useState(6);
  const [treasureCounts, setTreasureCounts] = useState([1, 1, 1]);
  const treasureSizes = treasureCounts.flatMap((count, index) =>
    Array(count).fill(index + 2),
  );
  const [mode, setMode] = useState<"together" | "computer">("together");
  const [round, setRound] = useState<{
    size: number;
    treasures: number[][];
    mode: "together" | "computer";
  } | null>(null);
  const [progress, setProgress] = useState<TreasureProgress>({
    moves: [],
    owners: {},
  });
  const visited = new Set(progress.moves.map((move) => move.cell));
  const [coordinate, setCoordinate] = useState("");
  const [message, setMessage] = useState(
    "Choose a map, then start exploring together.",
  );
  const [ended, setEnded] = useState(false);
  const completedTreasures = round
    ? Object.keys(progress.owners).map(
        (index) => round.treasures[Number(index)],
      )
    : [];
  const found = completedTreasures.length;
  const pieces = progress.moves.filter((move) => move.hit).length;
  const complete = !!round && found === round.treasures.length;
  const computerTurn =
    round?.mode === "computer" &&
    progress.moves.length % 2 === 1 &&
    !ended &&
    !complete;
  const teamScore = Object.values(progress.owners).filter(
    (owner) => owner === "team",
  ).length;
  const computerScore = Object.values(progress.owners).filter(
    (owner) => owner === "computer",
  ).length;
  const result =
    teamScore === computerScore
      ? "It’s a draw!"
      : teamScore > computerScore
        ? "Your team wins! 🎉"
        : "The computer wins. Try another round!";
  const start = () => {
    try {
      setRound({
        size,
        treasures: createSizedTreasures(size, treasureSizes),
        mode,
      });
    } catch (error) {
      setMessage((error as Error).message);
      return;
    }
    setProgress({ moves: [], owners: {} });
    setCoordinate("");
    setEnded(false);
    setMessage("Where shall we look? Say a letter and a number: “B three!”");
  };
  const makeMove = useCallback(
    (cell: number, explorer: Explorer) => {
      if (
        !round ||
        ended ||
        complete ||
        progress.moves.some((move) => move.cell === cell)
      )
        return;
      const next = uncoverTreasure(round.treasures, progress, cell, explorer);
      const label = `${String.fromCharCode(65 + Math.floor(cell / round.size))}${(cell % round.size) + 1}`;
      const treasureIndex = round.treasures.findIndex((treasure) =>
        treasure.includes(cell),
      );
      const collected =
        treasureIndex >= 0 && next.owners[treasureIndex] !== undefined;
      const who = explorer === "team" ? "Your team" : "Computer";
      const feedback =
        treasureIndex < 0
          ? `No treasure at ${label}. 🌿`
          : collected
            ? `Treasure collected at ${label}! All ${round.treasures[treasureIndex].length} squares uncovered. 🎉`
            : `Part of a treasure at ${label}! Find the rest in neighbouring squares. 💎`;
      setProgress(next);
      setCoordinate("");
      setMessage(`${round.mode === "computer" ? `${who}: ` : ""}${feedback}`);
    },
    [round, ended, complete, progress],
  );
  useEffect(() => {
    if (!computerTurn || !round) return;
    const timer = window.setTimeout(() => {
      const collectedCells = Object.keys(progress.owners).flatMap(
        (index) => round.treasures[Number(index)],
      );
      const cell = chooseComputerSquare(
        round.size,
        progress.moves,
        collectedCells,
      );
      if (cell !== null) makeMove(cell, "computer");
    }, 1400);
    return () => window.clearTimeout(timer);
  }, [computerTurn, round, progress, makeMove]);

  const selected = round ? parseGridCoordinate(coordinate, round.size) : null;
  const selectedCell =
    selected && round ? selected.row * round.size + selected.col : null;
  const explore = () => {
    if (!round || ended || complete || computerTurn) return;
    const parsed = parseGridCoordinate(coordinate, round.size);
    if (!parsed) {
      setMessage(
        `Try a coordinate from A1 to ${String.fromCharCode(64 + round.size)}${round.size}, for example B3.`,
      );
      return;
    }
    const cell = parsed.row * round.size + parsed.col;
    if (visited.has(cell)) {
      setMessage("We have already looked there. Choose another square!");
      return;
    }
    makeMove(cell, "team");
  };
  return (
    <section className="treasure-module max-w-5xl mx-auto p-2 sm:p-6 space-y-5">
      <header className="text-center">
        <h1 className="text-4xl text-emerald-700">💎 Treasure Hunt</h1>
        <p className="text-lg mt-2">
          Choose your map. Find the treasures together or challenge the
          computer!
        </p>
      </header>
      <div className="treasure-controls bg-white rounded-xl p-5 shadow">
        <label>
          Map size · total search area
          <select
            className="block border rounded p-2"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
          >
            {Array.from({ length: 13 }, (_, i) => i + 4).map((n) => (
              <option key={n} value={n}>
                {n} × {n} · {n * n} squares
              </option>
            ))}
          </select>
        </label>
        <label>
          Play mode
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as "together" | "computer")}
          >
            <option value="together">Explore together</option>
            <option value="computer">Your team vs computer</option>
          </select>
        </label>
        <fieldset className="treasure-counts col-span-full">
          <legend className="font-bold mb-2">
            How many treasures of each size?
          </legend>
          <div className="grid grid-cols-3 gap-3">
            {treasureCounts.map((count, index) => (
              <label key={index}>
                {index + 2}-square treasures
                <select
                  value={count}
                  onChange={(e) =>
                    setTreasureCounts((counts) =>
                      counts.map((value, i) =>
                        i === index ? Number(e.target.value) : value,
                      ),
                    )
                  }
                >
                  {Array.from({ length: 7 }, (_, n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </fieldset>
        <p>
          {treasureSizes.length}{" "}
          {treasureSizes.length === 1 ? "treasure" : "treasures"} ·{" "}
          {treasureSizes.reduce((sum, n) => sum + n, 0)} treasure squares hidden
          in a {size * size}-square area. Leave room between treasures. If they
          do not fit, choose fewer treasures or a larger map.
        </p>
        <button
          onClick={start}
          disabled={!treasureSizes.length}
          className="disabled:opacity-50 bg-emerald-700 text-white font-bold rounded-lg px-5 py-3"
        >
          {round ? "New round" : "Start exploring"}
        </button>
        {round && !ended && !complete && (
          <button
            onClick={() => {
              setEnded(true);
              setMessage(
                round.mode === "computer"
                  ? "Round finished! Let’s compare the scores."
                  : "Exploring finished! Look at the treasures you found together.",
              );
            }}
            className="border rounded-lg px-5 py-3"
          >
            Finish round
          </button>
        )}
        {round && (
          <p className="text-sm w-full">
            Map, treasure and mode choices apply when you start a new round.
          </p>
        )}
      </div>
      <p
        className="text-xl bg-emerald-50 rounded-xl p-4"
        role="status"
        aria-live="polite"
      >
        {message}
      </p>
      {round && (
        <>
          {round.mode === "computer" && (
            <div className="rounded-xl bg-violet-50 p-4 space-y-2">
              <p className="text-xl font-bold">
                Your team: {teamScore} 🏆 · Computer: {computerScore} 🏆
              </p>
              <p>
                Take turns on the same map. Whoever uncovers a treasure’s final
                square collects it for one point, whatever its size. Most
                treasures wins. Your team goes first; the computer uses only
                revealed clues.
              </p>
            </div>
          )}
          {complete || ended ? (
            <p
              className="text-xl font-bold rounded-xl bg-amber-100 p-4"
              role="status"
            >
              {round.mode === "computer"
                ? result
                : complete
                  ? "Wonderful teamwork! You collected every treasure! 🎉"
                  : "Round finished. Well explored, everyone!"}
            </p>
          ) : (
            <p className="font-bold" role="status">
              {computerTurn
                ? "🤖 Computer is choosing a square…"
                : round.mode === "computer"
                  ? "Your team’s turn!"
                  : "Let’s explore together!"}
            </p>
          )}
          <div className="flex flex-wrap gap-3 text-lg font-bold">
            <span>
              💎 {found} / {round.treasures.length}{" "}
              {round.treasures.length === 1 ? "treasure" : "treasures"}{" "}
              collected · {pieces} treasure squares uncovered
            </span>
            <span>{visited.size} places explored</span>
          </div>
          {!ended && !complete && (
            <form
              className="coordinate-controls"
              onSubmit={(e) => {
                e.preventDefault();
                explore();
              }}
            >
              <label className="font-bold">
                Let’s look at…
                <input
                  aria-label="Coordinate"
                  disabled={computerTurn}
                  className="block border-2 rounded-lg p-3 text-xl uppercase"
                  placeholder="B3"
                  value={coordinate}
                  onChange={(e) => setCoordinate(e.target.value)}
                  autoComplete="off"
                />
              </label>
              <button
                className="bg-emerald-700 text-white rounded-lg px-6 py-3 text-xl"
                disabled={!coordinate.trim() || computerTurn}
              >
                Explore
              </button>
              <p>Say the coordinate in English before exploring.</p>
            </form>
          )}
          <p className="text-lg">
            Treasure sizes:{" "}
            {round.treasures.map((t) => `${t.length} squares`).join(" · ")}.
            Each treasure stretches straight across or down. Treasures never
            touch, even at corners.
          </p>
          <div className="overflow-x-auto bg-white rounded-xl shadow p-4">
            <div
              className="grid gap-1 mx-auto"
              style={{
                gridTemplateColumns: `28px repeat(${round.size}, minmax(32px, 1fr))`,
                minWidth: 28 + round.size * 36,
                maxWidth: 800,
              }}
            >
              <span />
              {Array.from({ length: round.size }, (_, c) => (
                <span key={`col${c}`} className="text-center font-bold">
                  {c + 1}
                </span>
              ))}
              {Array.from({ length: round.size }, (_, r) => (
                <React.Fragment key={r}>
                  <span className="flex items-center font-bold">
                    {String.fromCharCode(65 + r)}
                  </span>
                  {Array.from({ length: round.size }, (_, c) => {
                    const cell = r * round.size + c,
                      seen = visited.has(cell),
                      treasure = round.treasures.some((treasure) =>
                        treasure.includes(cell),
                      ),
                      collected = completedTreasures.some((treasure) =>
                        treasure.includes(cell),
                      ),
                      label = `${String.fromCharCode(65 + r)}${c + 1}`;
                    return (
                      <button
                        key={c}
                        aria-label={`${label}${seen ? (collected ? ", treasure collected" : treasure ? ", part of a treasure" : ", explored") : ""}`}
                        disabled={seen || ended || complete || computerTurn}
                        onClick={() => setCoordinate(label)}
                        className={`aspect-square border-2 rounded-lg text-2xl ${collected ? "bg-amber-200 border-amber-600" : seen ? "bg-emerald-100 border-emerald-400" : selectedCell === cell ? "bg-amber-100 border-amber-500" : "bg-sky-50 border-sky-200 hover:bg-amber-50"}`}
                      >
                        {seen
                          ? collected
                            ? "🌟"
                            : treasure
                              ? "💎"
                              : "🌿"
                          : "·"}
                      </button>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </>
      )}
      <aside className="rounded-xl bg-amber-50 p-4">
        <strong>Say it together:</strong> “Let’s look at B3!” · “Part of a
        treasure!” · “Treasure collected!” · “Keep looking!” · “Your turn!”
        <p className="mt-2">
          The treasures have different sizes: each one covers 2, 3 or 4 squares
          in a straight line. After finding part of a treasure, explore above,
          below, left or right to uncover the rest. Uncover every square of a
          treasure to collect it. For a short game, choose fewer treasures or
          finish after a few turns. For more practice, start another round and
          let new explorers call the coordinates.
        </p>
      </aside>
    </section>
  );
}
