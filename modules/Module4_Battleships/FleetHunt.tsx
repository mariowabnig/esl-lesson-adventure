import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  createSizedTreasures,
  parseGridCoordinate,
} from "../../utils/coordinates";
import {
  remainingLives,
  chooseComputerSquare,
  uncoverTreasure,
  type Explorer,
  type TreasureProgress,
} from "../../utils/treasureGame";

export default function FleetHunt({ initialMode = "together" }: { initialMode?: "together" | "computer" }) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [setupOpen, setSetupOpen] = useState(true);
  const [lives, setLives] = useState(5);
  const [size, setSize] = useState(6);
  const [treasureCounts, setTreasureCounts] = useState([1, 1, 1]);
  const treasureSizes = treasureCounts.flatMap((count, index) =>
    Array(count).fill(index + 2),
  );
  const [mode, setMode] = useState<"together" | "computer">(initialMode);
  const [round, setRound] = useState<{
    lives: number;
    size: number;
    treasures: number[][];
    mode: "together" | "computer";
  } | null>(null);
  const [progress, setProgress] = useState<TreasureProgress>({
    moves: [],
    owners: {},
  });
  const [reveal, setReveal] = useState<{ cells: number[]; kind: "hit" | "miss" | "collected"; turn: number } | null>(null);
  const visited = new Set(progress.moves.map((move) => move.cell));
  const [coordinate, setCoordinate] = useState("");
  const [message, setMessage] = useState(
    "Wählt ein Spielfeld und startet Schiffe versenken.",
  );
  const [ended, setEnded] = useState(false);
  const completedTreasures = round
    ? Object.keys(progress.owners).map(
        (index) => round.treasures[Number(index)],
      )
    : [];
  const found = completedTreasures.length;
  const pieces = progress.moves.filter((move) => move.hit).length;
  const teamLives = remainingLives(progress.moves, "team", round?.lives ?? 0);
  const computerLives = remainingLives(progress.moves, "computer", round?.lives ?? 0);
  const exhausted = !!round && (teamLives === 0 || (round.mode === "computer" && computerLives === 0));
  const complete = !!round && (found === round.treasures.length || exhausted);
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
  const result = exhausted
    ? teamLives === 0 ? "Keine Leben mehr – der Computer gewinnt." : "Der Computer hat keine Leben mehr – euer Team gewinnt! 🎉"
    : teamScore === computerScore
      ? "Unentschieden!"
      : teamScore > computerScore
        ? "Euer Team gewinnt! 🎉"
        : "Der Computer gewinnt. Versucht es noch einmal!";
  const start = () => {
    try {
      setRound({
        lives,
        size,
        treasures: createSizedTreasures(size, treasureSizes),
        mode,
      });
    } catch (error) {
      setMessage("Die Flotte passt nicht mit Abstand auf dieses Spielfeld. Wählt weniger Schiffe oder ein größeres Feld.");
      return;
    }
    setSetupOpen(false);
    setReveal(null);
    setProgress({ moves: [], owners: {} });
    setCoordinate("");
    setEnded(false);
    setMessage("Sagt eine Koordinate auf Englisch, zum Beispiel „B three“, und schießt!");
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
      const who = explorer === "team" ? "Euer Team" : "Computer";
      const feedback =
        treasureIndex < 0
          ? `Wasser bei ${label}! 💦`
          : collected
            ? `Schiff bei ${label} versenkt! Alle ${round.treasures[treasureIndex].length} Felder getroffen. 🚢`
            : `Treffer bei ${label}! Sucht in den Nachbarfeldern weiter. 💥`;
      setReveal({
        cells: collected ? round.treasures[treasureIndex] : [cell],
        kind: treasureIndex < 0 ? "miss" : collected ? "collected" : "hit",
        turn: next.moves.length,
      });
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

  useEffect(() => {
    if (round) boardRef.current?.scrollIntoView({ block: "start", behavior: "instant" });
  }, [round]);

  const selected = round ? parseGridCoordinate(coordinate, round.size) : null;
  const selectedCell =
    selected && round ? selected.row * round.size + selected.col : null;
  const explore = () => {
    if (!round || ended || complete || computerTurn) return;
    const parsed = parseGridCoordinate(coordinate, round.size);
    if (!parsed) {
      setMessage(
        `Gebt eine Koordinate von A1 bis ${String.fromCharCode(64 + round.size)}${round.size} ein, zum Beispiel B3.`,
      );
      return;
    }
    const cell = parsed.row * round.size + parsed.col;
    if (visited.has(cell)) {
      setMessage("Dieses Feld wurde bereits beschossen. Wählt ein anderes!");
      return;
    }
    makeMove(cell, "team");
  };
  return (
    <section className="treasure-module max-w-5xl mx-auto p-2 sm:p-6 space-y-5">
      <header className="text-center">
        <h1 className="text-4xl text-emerald-700">🚢 Schiffe versenken</h1>
        <p className="text-lg mt-2">
          Versenkt gemeinsam die Flotte oder spielt als Team gegen den Computer!
        </p>
      </header>
      <details className="hunt-setup" open={setupOpen} onToggle={e => setSetupOpen(e.currentTarget.open)}>
        <summary>Einstellungen · Feldgröße, Spielmodus und Leben</summary>
      <div className="treasure-controls bg-white rounded-xl p-5 shadow">
        <label>
          Spielfeldgröße · gesamte Fläche
          <select
            className="block border rounded p-2"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
          >
            {Array.from({ length: 13 }, (_, i) => i + 4).map((n) => (
              <option key={n} value={n}>
                {n} × {n} · {n * n} Felder
              </option>
            ))}
          </select>
        </label>
        <label>
          Spielmodus
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as "together" | "computer")}
          >
            <option value="together">Gemeinsam Schiffe versenken</option>
            <option value="computer">Euer Team gegen den Computer</option>
          </select>
        </label>
        <label>Leben pro Seite
          <select aria-label="Leben pro Seite" value={lives} onChange={e => setLives(Number(e.target.value))}>
            {[0, 3, 5, 10, 15, 20].map(n => <option key={n} value={n}>{n === 0 ? "Unbegrenzt" : n}</option>)}
          </select>
        </label>
        <p>Ein Fehlschuss kostet ein Leben. Treffer kosten nichts. Im Computermodus hat jede Seite eigene Leben; wer keine mehr hat, verliert. Einstellungen gelten ab der nächsten Runde.</p>
        <fieldset className="treasure-counts col-span-full">
          <legend className="font-bold mb-2">
            Wie viele Schiffe je Größe?
          </legend>
          <div className="grid grid-cols-3 gap-3">
            {treasureCounts.map((count, index) => (
              <label key={index}>
                Schiffe mit {index + 2} Feldern
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
          {treasureSizes.length === 1 ? "Schiff" : "Schiffe"} ·{" "}
          {treasureSizes.reduce((sum, n) => sum + n, 0)} Schiffsfelder auf insgesamt {size * size} Feldern. Zwischen den Schiffen bleibt Platz. Passen sie nicht auf das Feld, wählt weniger Schiffe oder ein größeres Spielfeld.
        </p>
        <button
          onClick={start}
          disabled={!treasureSizes.length}
          className="disabled:opacity-50 bg-emerald-700 text-white font-bold rounded-lg px-5 py-3"
        >
          {round ? "Neue Runde" : "Runde starten"}
        </button>
        {round && !ended && !complete && (
          <button
            onClick={() => {
              setEnded(true);
              setMessage(
                round.mode === "computer"
                  ? "Runde beendet! Vergleicht die Punkte."
                  : "Runde beendet! Schaut euch eure versenkten Schiffe an.",
              );
            }}
            className="border rounded-lg px-5 py-3"
          >
            Runde beenden
          </button>
        )}
        {round && (
          <p className="text-sm w-full">
            Änderungen an Spielfeld, Flotte und Spielmodus gelten ab der nächsten Runde.
          </p>
        )}
      </div>
      </details>
      <div ref={boardRef} className="hunt-play-area">
        {round && <div className="hunt-round-actions">
          <button onClick={start}>Neue Runde</button>
          {!ended && !complete && <button onClick={() => { setEnded(true); setMessage("Runde beendet."); }}>Runde beenden</button>}
        </div>}
      <p
        className="hunt-message text-xl bg-emerald-50 rounded-xl p-4"
        role="status"
        aria-live="polite"
      >
        {message}
      </p>
      {round && (
        <>
          <p className="rounded-xl bg-rose-50 p-4 font-bold" role="status">❤️ Euer Team: {Number.isFinite(teamLives) ? teamLives : "∞"} Leben{round.mode === "computer" && <> · 🤖 Computer: {Number.isFinite(computerLives) ? computerLives : "∞"} Leben</>}</p>
          {round.mode === "computer" && (
            <div className="hunt-score rounded-xl bg-violet-50 p-4 space-y-2">
              <p className="text-xl font-bold">
                Euer Team: {teamScore} 🏆 · Computer: {computerScore} 🏆
              </p>
              <p>
                Ihr schießt abwechselnd auf dieselbe Flotte. Wer das letzte Feld eines Schiffs trifft, bekommt einen Punkt – unabhängig von seiner Größe. Wer die meisten Schiffe versenkt, gewinnt. Euer Team beginnt. Der Computer kennt nur bereits beschossene Felder.
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
                : exhausted
                  ? "Keine Leben mehr. Runde beendet – versucht es noch einmal!"
                : complete
                  ? "Super Teamarbeit! Alle Schiffe sind versenkt! 🎉"
                  : "Runde beendet. Gut gespielt!"}
            </p>
          ) : (
            <p className="font-bold" role="status">
              {computerTurn
                ? "🤖 Der Computer wählt ein Feld …"
                : round.mode === "computer"
                  ? "Euer Team ist dran!"
                  : "Versenkt die Flotte gemeinsam!"}
            </p>
          )}
          <div className="flex flex-wrap gap-3 text-lg font-bold">
            <span>
              🚢 {found} / {round.treasures.length}{" "}
              {round.treasures.length === 1 ? "Schiff" : "Schiffe"}{" "}
              versenkt · {pieces} Treffer
            </span>
            <span>{visited.size} Schüsse · {visited.size - pieces} Fehlschüsse</span>
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
                Zielkoordinate
                <input
                  aria-label="Koordinate"
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
                Schießen
              </button>
              <p>Sagt die Koordinate vor dem Aufdecken auf Englisch, zum Beispiel „B three“.</p>
            </form>
          )}
          <p className="text-lg">
            Schiffsgrößen:{" "}
            {round.treasures.map((t) => `${t.length} Felder`).join(" · ")}.
            Jedes Schiff liegt waagrecht oder senkrecht. Schiffe berühren sich nicht, auch nicht an den Ecken.
          </p>
          <div className="hunt-board-wrap bg-white rounded-xl shadow p-2">
            <div
              className="hunt-board grid gap-1 mx-auto"
              style={{
                gridTemplateColumns: `22px repeat(${round.size}, minmax(0, 1fr))`,
                width: `min(100%, ${22 + round.size * 44}px, max(220px, calc(100dvh - 360px)))`,
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
                        aria-label={`${label}${seen ? (collected ? ", versenkt" : treasure ? ", Treffer" : ", Wasser") : ""}`}
                        disabled={seen || ended || complete || computerTurn}
                        onClick={() => setCoordinate(label)}
                        className={`treasure-cell ${seen ? collected ? "hunt-sunk" : treasure ? "hunt-hit" : "hunt-miss" : "hunt-hidden"} aspect-square border-2 rounded-lg text-2xl ${collected ? "bg-amber-200 border-amber-600" : seen ? "bg-emerald-100 border-emerald-400" : selectedCell === cell ? "bg-amber-100 border-amber-500" : "bg-sky-50 border-sky-200 hover:bg-amber-50"}`}
                      >
                        <span
                          key={reveal?.cells.includes(cell) ? `reveal-${reveal.turn}` : "still"}
                          aria-hidden="true"
                          className={`battleship-symbol ${reveal?.cells.includes(cell) ? `battleship-${reveal.kind === "collected" ? "sunk" : reveal.kind}` : ""}`}
                        >
                          {seen ? collected ? "🚢" : treasure ? "💥" : "💦" : "·"}
                        </span>
                      </button>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </>
      )}
      <p className="hunt-legend">⬜ Unentdeckt · 🟧 Treffer / Teilfund · 🟦 Wasser / nichts gefunden · 🟩 Vollständig gefunden / versenkt</p>
      </div>
      <details className="hunt-help"><summary>Spielregeln und englische Sprechbeispiele</summary>
      <aside className="rounded-xl bg-amber-50 p-4">
        <strong>Gemeinsam auf Englisch sprechen:</strong> “I choose B3!” · “Hit!” · “Miss!” · “Ship sunk!” · “Your turn!”
        <p className="mt-2">
          Ein Schiff belegt 2, 3 oder 4 Felder. 💥 bedeutet Treffer, 💦 bedeutet Wasser. Sucht nach einem Treffer oberhalb, unterhalb, links oder rechts weiter. Erst wenn alle Felder getroffen sind, ist das Schiff versenkt 🚢. Für kurze Runden wählt weniger Schiffe oder beendet die Runde vorzeitig. Wechselt euch beim Ansagen der englischen Koordinaten ab.
        </p>
      </aside>
      </details>
    </section>
  );
}
