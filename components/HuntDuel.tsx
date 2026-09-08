import React, { useEffect, useState } from 'react';
import { parseGridCoordinate } from '../utils/coordinates';
import { placementCells, type PlacementDirection } from '../utils/huntPlacement';
import { chooseComputerSquare, remainingLives, uncoverTreasure, type TreasureProgress } from '../utils/treasureGame';

const empty = (): TreasureProgress => ({ moves: [], owners: {} });
export default function HuntDuel({ size, lives, enemy, ships, allowDiagonal, onSetup, onRestart }: {
  allowDiagonal: boolean; size: number; lives: number; enemy: number[][]; ships: boolean; onSetup: () => void; onRestart: () => void;
}) {
  const [own, setOwn] = useState<number[][]>([]);
  const [directionIndex, setDirectionIndex] = useState(0);
  const directions: PlacementDirection[] = allowDiagonal ? ['horizontal', 'vertical', 'diagonal-down', 'diagonal-up'] : ['horizontal', 'vertical'];
  const direction = directions[directionIndex];
  const directionLabels = ['↔ Waagrecht', '↕ Senkrecht', '↘ Diagonal rechts unten', '↗ Diagonal rechts oben'];
  const [hover, setHover] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [attack, setAttack] = useState(empty);
  const [defence, setDefence] = useState(empty);
  const [coordinate, setCoordinate] = useState('');
  const [message, setMessage] = useState('Platziert zuerst eure eigenen Objekte. Klickt auf das Startfeld.');
  const lengths = enemy.map(object => object.length);
  const teamLives = remainingLives(attack.moves, 'team', lives);
  const computerLives = remainingLives(defence.moves, 'computer', lives);
  const score = Object.keys(attack.owners).length, computerScore = Object.keys(defence.owners).length;
  const won = score === enemy.length || computerLives === 0;
  const lost = computerScore === enemy.length || teamLives === 0;
  const finished = ended || won || lost;
  const computerTurn = playing && !finished && attack.moves.length > defence.moves.length;
  const noun = ships ? 'Schiff' : 'Schatz';
  const label = (cell: number) => `${String.fromCharCode(65 + Math.floor(cell / size))}${cell % size + 1}`;
  const feedback = (cell: number, next: TreasureProgress, previous: TreasureProgress, who: string) => `${who}: ${label(cell)} – ${next.moves.at(-1)?.hit ? Object.keys(next.owners).length > Object.keys(previous.owners).length ? ships ? 'Schiff versenkt!' : 'Schatz gefunden!' : 'Treffer!' : lives === 0 ? 'Nichts gefunden.' : 'Nichts gefunden. Ein Leben weniger.'}`;
  useEffect(() => {
    if (!computerTurn) return;
    const timer = window.setTimeout(() => {
      const cell = chooseComputerSquare(size, defence.moves, Object.keys(defence.owners).flatMap(index => own[Number(index)]), Math.random, allowDiagonal);
      if (cell === null) return;
      const next = uncoverTreasure(own, defence, cell, 'computer');
      setDefence(next);
      setMessage(feedback(cell, next, defence, 'Computer'));
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [computerTurn, size, own, defence, ships, allowDiagonal]);
  const shoot = () => {
    if (!playing || finished || computerTurn) return;
    const parsed = parseGridCoordinate(coordinate, size);
    if (!parsed) { setMessage(`Koordinate von A1 bis ${label(size * size - 1)} eingeben.`); return; }
    const cell = parsed.row * size + parsed.col;
    if (attack.moves.some(move => move.cell === cell)) { setMessage('Dieses Feld wurde bereits aufgedeckt. Wählt ein anderes.'); return; }
    const next = uncoverTreasure(enemy, attack, cell, 'team');
    setAttack(next); setCoordinate(''); setMessage(feedback(cell, next, attack, 'Euer Team'));
  };
  const place = (cell: number) => {
    if (own.length === lengths.length) return;
    const cells = placementCells(size, lengths[own.length], cell, direction, own);
    if (!cells) { setMessage('Passt hier nicht: Bleibt im Feld und lasst Abstand, auch diagonal.'); return; }
    setOwn([...own, cells]);
    setMessage(`${noun} platziert. ${own.length + 1} / ${lengths.length} fertig.`);
  };
  const board = (objects: number[][], progress: TreasureProgress, home: boolean) => {
    const preview = !playing && hover !== null && own.length < lengths.length ? placementCells(size, lengths[own.length], hover, direction, own) : null;
    return <div className="hunt-board grid gap-1 mx-auto" style={{ gridTemplateColumns: `22px repeat(${size}, minmax(0, 1fr))`, width: 'min(100%, max(240px, calc(100dvh - 390px)))', maxWidth: 560 }}>
      <span />{Array.from({ length: size }, (_, col) => <span className="text-center" key={`col${col}`}>{col + 1}</span>)}
      {Array.from({ length: size }, (_, row) => <React.Fragment key={row}><span className="flex items-center">{String.fromCharCode(65 + row)}</span>{Array.from({ length: size }, (_, col) => {
        const cell = row * size + col, move = progress.moves.find(move => move.cell === cell);
        const occupied = objects.some(object => object.includes(cell));
        const sunk = Object.keys(progress.owners).some(index => objects[Number(index)].includes(cell));
        const visible = occupied && (home || finished);
        const state = sunk ? 'hunt-sunk' : move?.hit ? 'hunt-hit' : move ? 'hunt-miss' : 'hunt-hidden';
        const icon = sunk ? ships ? '🚢' : '🌟' : move?.hit ? '💥' : move ? '💦' : visible ? ships ? '🚢' : '💎' : '·';
        const selected = !home && coordinate.toUpperCase() === label(cell);
        return <button key={cell} aria-label={`${home ? 'Eigenes Feld' : 'Computerfeld'} ${label(cell)}: ${sunk ? 'vollständig gefunden' : move ? move.hit ? 'Treffer' : 'Fehlschuss' : visible ? noun : 'unentdeckt'}`}
          disabled={playing ? home || finished || computerTurn || !!move : own.length === lengths.length}
          onMouseEnter={() => setHover(cell)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(cell)} onBlur={() => setHover(null)}
          onClick={() => playing ? setCoordinate(label(cell)) : place(cell)}
          className={`treasure-cell aspect-square border rounded ${state}`}
          style={{ outline: selected ? '3px solid #7c3aed' : preview?.includes(cell) && home ? '3px solid #059669' : undefined, outlineOffset: -3 }}>
          <span key={`${icon}-${move ? 'revealed' : 'hidden'}`} className={move ? `battleship-symbol battleship-${sunk ? 'sunk' : move.hit ? 'hit' : 'miss'}` : ''}>{icon}</span>
        </button>;
      })}</React.Fragment>)}
    </div>;
  };
  return <section className="treasure-module max-w-6xl mx-auto p-4 space-y-4">
    <h1 className="text-3xl font-bold">{ships ? '🚢 Schiffe versenken' : '💎 Treasure Hunt'} · Team gegen Computer</h1>
    <div className="hunt-round-actions"><button onClick={onSetup}>Einstellungen</button><button onClick={onRestart}>Neue Runde</button>{playing && !finished && <button onClick={() => setEnded(true)}>Runde beenden</button>}</div>
    <p role="status" aria-live="polite" className="rounded-xl bg-emerald-50 p-3">{message}</p>
    {!playing ? <>
      <h2 className="text-xl font-bold">1. Eigene {ships ? 'Schiffe' : 'Schätze'} platzieren · {own.length}/{lengths.length}</h2>
      <p>Jedes Objekt liegt gerade{allowDiagonal ? ", auch diagonal erlaubt" : " (waagrecht oder senkrecht)"}. Zwischen den Objekten bleibt ein Feld Abstand, auch diagonal. Euer Team beginnt nach dem Platzieren.</p>
      <div className="hunt-round-actions">
        <button onClick={() => setDirectionIndex((directionIndex + 1) % directions.length)}>{directionLabels[directionIndex]} · Drehen</button>
        <button disabled={!own.length} onClick={() => setOwn(own.slice(0, -1))}>Rückgängig</button>
        <button disabled={!own.length} onClick={() => setOwn([])}>Platzierung löschen</button>
      </div>
      <p>{own.length < lengths.length ? `Nächster ${noun}: ${lengths[own.length]} Felder` : 'Alles platziert. Bereit!'} · Größen: {lengths.join(', ')}</p>
      {board(own, defence, true)}
      <button className="bg-emerald-700 text-white rounded-lg px-5 py-3 disabled:opacity-50" disabled={own.length !== lengths.length} onClick={() => { setPlaying(true); setHover(null); setMessage('Euer Team beginnt. Wählt ein Ziel auf dem Computerfeld.'); }}>2. Spiel starten</button>
    </> : <>
      <p className="font-bold">❤️ Euer Team: {teamLives === Infinity ? '∞' : teamLives} · Computer: {computerLives === Infinity ? '∞' : computerLives} Leben · Gefunden: {score}/{enemy.length} : {computerScore}/{own.length}</p>
      <p role="status" className="text-xl font-bold">{finished ? won ? 'Euer Team gewinnt! 🎉' : lost ? 'Der Computer gewinnt.' : score === computerScore ? 'Runde beendet: Unentschieden.' : score > computerScore ? 'Runde beendet: Euer Team gewinnt!' : 'Runde beendet: Der Computer gewinnt.' : computerTurn ? '🤖 Der Computer wählt ein Feld …' : 'Euer Team ist dran!'}</p>
      {!finished && <form className="coordinate-controls" onSubmit={event => { event.preventDefault(); shoot(); }}>
        <label>Zielkoordinate<input aria-label="Zielkoordinate" placeholder="B3" value={coordinate} disabled={computerTurn} onChange={event => setCoordinate(event.target.value)} className="border rounded p-2 uppercase" /></label>
        <button disabled={computerTurn || !coordinate.trim()} className="bg-emerald-700 text-white rounded px-4 py-2">{ships ? 'Schießen' : 'Suchen'}</button><span>Say “B three!”</span>
      </form>}
      <div className="grid gap-6 md:grid-cols-2">
        <div><h2 className="font-bold text-xl mb-2">Computerfeld · Hier {ships ? 'schießen' : 'suchen'}</h2>{board(enemy, attack, false)}</div>
        <div><h2 className="font-bold text-xl mb-2">Euer Feld · Computer sucht hier</h2>{board(own, defence, true)}</div>
      </div>
      <p>⬜ Unentdeckt · 🟧 Treffer · 🟦 Fehlschuss · 🟩 Vollständig gefunden. {finished && 'Beide Felder sind jetzt aufgedeckt.'}</p>
    </>}
    <details><summary>Spielregeln</summary><p>Ihr sucht abwechselnd auf getrennten Feldern. Wer alle gegnerischen {ships ? 'Schiffe versenkt' : 'Schätze findet'}, gewinnt. Ein Fehlschuss kostet ein Leben; bei null Leben verliert die Seite. 0 als Einstellung bedeutet unbegrenzt. Bei vorzeitigem Ende zählen vollständig gefundene Objekte. Der Computer nutzt nur seine eigenen bisherigen Treffer und Fehlschüsse.</p></details>
  </section>;
}
