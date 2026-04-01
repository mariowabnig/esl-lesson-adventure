import React, { useState, useEffect, useMemo } from 'react';
import { SessionWord } from '../../types';

type GameMode = 'practice' | 'vsComputer' | 'twoPlayer' | 'teamChallenge';
type CellState = 'empty' | 'ship' | 'hit' | 'miss' | 'sunk';
type GamePhase = 'setup' | 'placement' | 'playing' | 'gameOver';

interface Cell {
  state: CellState;
  hasShip: boolean;
  isHit: boolean;
  shipId?: number;
}

interface Ship {
  id: number;
  size: number;
  positions: Array<{ row: number; col: number }>;
  isHorizontal: boolean;
  isSunk: boolean;
}

interface BattleshipsProps {
  sessionVocabulary: SessionWord[];
  onBack: () => void;
}

const GRID_SIZES = [
  { value: 12, label: '12x12 (einfach)' },
  { value: 15, label: '15x15 (mittel)' },
  { value: 20, label: '20x20 (schwer)' }
];

const SHIP_CONFIGS = {
  12: [{ size: 2, count: 4 }, { size: 3, count: 3 }, { size: 4, count: 2 }, { size: 5, count: 1 }],
  15: [{ size: 2, count: 5 }, { size: 3, count: 4 }, { size: 4, count: 3 }, { size: 5, count: 2 }],
  20: [{ size: 2, count: 6 }, { size: 3, count: 5 }, { size: 4, count: 4 }, { size: 5, count: 3 }]
};

const Module4_Battleships: React.FC<BattleshipsProps> = ({ sessionVocabulary, onBack }) => {
  const [gameMode, setGameMode] = useState<GameMode>('practice');
  const [gridSize, setGridSize] = useState(12);
  const [gamePhase, setGamePhase] = useState<GamePhase>('setup');
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [playerGrid, setPlayerGrid] = useState<Cell[][]>([]);
  const [enemyGrid, setEnemyGrid] = useState<Cell[][]>([]);
  // per-session ship setup (sizes and counts)
  const [sessionShipConfig, setSessionShipConfig] = useState<Array<{ size: number; count: number }>>([
    { size: 2, count: 4 }, { size: 3, count: 3 }, { size: 4, count: 2 }, { size: 5, count: 1 }
  ]);

  const [playerShips, setPlayerShips] = useState<Ship[]>([]);
  const [enemyShips, setEnemyShips] = useState<Ship[]>([]);
  const [selectedCoordinate, setSelectedCoordinate] = useState<string>('');
  const [gameMessage, setGameMessage] = useState('');
  const [turnCount, setTurnCount] = useState(0);
  const [prediction, setPrediction] = useState<number | ''>('');
  const [predictionLimit, setPredictionLimit] = useState<number | null>(null);
  const [shotsTaken, setShotsTaken] = useState<number>(0);

  const [professionalMode, setProfessionalMode] = useState<boolean>(false);
  const [proPrediction, setProPrediction] = useState<number | ''>('');
  const [hitLog, setHitLog] = useState<Array<{ turn: number; coord: string; shipId?: number; size?: number; sunk?: boolean }>>([]);
  const [proIndividualShips, setProIndividualShips] = useState<number[]>([]);
  const [fleetValidationMsg, setFleetValidationMsg] = useState<string>('');
  const stats = useMemo(() => {
    const flat = enemyGrid.flat();
    const hits = flat.filter(c => c.isHit && c.hasShip).length;
    const misses = flat.filter(c => c.isHit && !c.hasShip).length;
    const shipsRemaining = enemyShips.filter(s => !s.isSunk).length;
    return { hits, misses, shipsRemaining };
  }, [enemyGrid, enemyShips]);

  const proShipSummary = useMemo(() => {
    const total = sessionShipConfig.reduce((sum, cfg) => sum + cfg.count, 0);
    return { total, items: sessionShipConfig };
  }, [sessionShipConfig]);

  // Initialize empty grid
  const createEmptyGrid = (size: number): Cell[][] => {
    return Array(size).fill(null).map(() =>
      Array(size).fill(null).map(() => ({
        state: 'empty' as CellState,
        hasShip: false,
        isHit: false
      }))
    );
  };

  // Convert grid coordinates to English (A1, B3, etc.)
  const getCoordinateString = (row: number, col: number): string => {
    const letter = String.fromCharCode(65 + row); // A, B, C, etc.
    const number = col + 1;
    return `${letter}${number}`;
  };

  // Parse coordinate string back to row/col
  const parseCoordinate = (coord: string): { row: number; col: number } | null => {
    if (coord.length < 2) return null;
    const letter = coord.charAt(0).toUpperCase();
  // Validate if a set of ship sizes can fit in a grid (rough check by total cells)
  const validateFleetFits = (size: number, ships: number[]): string => {
    const totalCells = ships.reduce((sum, s) => sum + s, 0);
    if (totalCells > size * size * 0.6) return 'flotte könnte zu groß sein (mehr als 60% der felder)';
    if (ships.some(s => s > size)) return 'ein schiff ist länger als die gittergröße';
    return '';
  };
    const number = parseInt(coord.slice(1));

    if (letter < 'A' || letter > String.fromCharCode(64 + gridSize)) return null;
    if (number < 1 || number > gridSize) return null;

    return {
      row: letter.charCodeAt(0) - 65,
      col: number - 1
    };
  };

  // Generate random ship placement
  const generateRandomShips = (size: number, config: Array<{ size: number; count: number }> = SHIP_CONFIGS[size as keyof typeof SHIP_CONFIGS] || sessionShipConfig): Ship[] => {
    const ships: Ship[] = [];
    const grid = createEmptyGrid(size);
    const shipConfig = config;
    let shipId = 0;

    shipConfig.forEach(({ size: shipSize, count }) => {
      for (let i = 0; i < count; i++) {
        let placed = false;
        let attempts = 0;

        while (!placed && attempts < 100) {
          const isHorizontal = Math.random() > 0.5;
          const row = Math.floor(Math.random() * size);
          const col = Math.floor(Math.random() * size);

          if (canPlaceShip(grid, row, col, shipSize, isHorizontal, size)) {
            const positions = [];
            for (let j = 0; j < shipSize; j++) {
              const r = isHorizontal ? row : row + j;
              const c = isHorizontal ? col + j : col;
              positions.push({ row: r, col: c });
              grid[r][c].hasShip = true;
            }

            ships.push({
              id: shipId++,
              size: shipSize,
              positions,
              isHorizontal,
              isSunk: false
            });
            placed = true;
          }
          attempts++;
        }
      }
    });

    return ships;
  };

  // Check if ship can be placed at position
  const canPlaceShip = (grid: Cell[][], row: number, col: number, size: number, isHorizontal: boolean, gridSize: number): boolean => {
    // Check bounds
    if (isHorizontal && col + size > gridSize) return false;
    if (!isHorizontal && row + size > gridSize) return false;

    // Check for overlapping ships
    for (let i = 0; i < size; i++) {
      const r = isHorizontal ? row : row + i;
      const c = isHorizontal ? col + i : col;
      if (grid[r][c].hasShip) return false;
    }

    return true;
  };

  // Place ships on grid
  const placeShipsOnGrid = (grid: Cell[][], ships: Ship[]): Cell[][] => {
    const newGrid = grid.map(row => row.map(cell => ({ ...cell })));

    ships.forEach(ship => {
      ship.positions.forEach(pos => {
        if (pos.row >= 0 && pos.row < gridSize && pos.col >= 0 && pos.col < gridSize) {
          newGrid[pos.row][pos.col].hasShip = true;
        }
      });
    });

    return newGrid;
  };

  // Initialize game
  const initializeGame = () => {
    const emptyPlayerGrid = createEmptyGrid(gridSize);
    const emptyEnemyGrid = createEmptyGrid(gridSize);

    const enemyShips = generateRandomShips(gridSize, sessionShipConfig);
    const enemyGridWithShips = placeShipsOnGrid(emptyEnemyGrid, enemyShips);

    setEnemyGrid(enemyGridWithShips);
    setEnemyShips(enemyShips);
    setPlayerShips([]);
    setGamePhase(gameMode === 'practice' || gameMode === 'teamChallenge' ? 'playing' : 'placement');
    setCurrentPlayer(1);
    setTurnCount(0);
    setGameMessage('');

    if (gameMode === 'practice' || gameMode === 'teamChallenge') {
      // In practice and team challenge modes, place player ships randomly
      const playerShips = generateRandomShips(gridSize, sessionShipConfig);
      const playerGridWithShips = placeShipsOnGrid(emptyPlayerGrid, playerShips);
      setPlayerGrid(playerGridWithShips);
      setPlayerShips(playerShips);
      setGameMessage(gameMode === 'teamChallenge' ? 'team-herausforderung: geben sie koordinaten auf englisch an!' : 'übungsmodus: sagen sie koordinaten auf englisch (z.b. "A5", "B3")');
    } else {
      setPlayerGrid(emptyPlayerGrid);
      setGameMessage('platzieren sie ihre schiffe auf dem spielfeld');
    }
  };

  // Handle coordinate input
  const handleCoordinateSubmit = () => {
    const coord = parseCoordinate(selectedCoordinate);
    if (!coord) {
      setGameMessage('Ungültige Koordinate! Verwenden Sie Format wie "A5" oder "B3"');
      return;
    }

    const { row, col } = coord;

    if (enemyGrid[row][col].isHit) {
      setGameMessage('Diese Koordinate wurde bereits getroffen!');
      return;
    }

    // Make the shot
    const newEnemyGrid = [...enemyGrid];
    newEnemyGrid[row][col].isHit = true;

    if (newEnemyGrid[row][col].hasShip) {
      newEnemyGrid[row][col].state = 'hit';
      setGameMessage(`Treffer bei ${selectedCoordinate}! 🎯`);

      // Check if ship is sunk
      const ship = enemyShips.find(s => s.positions.some(p => p.row === row && p.col === col));
  // Keep hit log updated when a shot is taken
  useEffect(() => {
    // No-op here; entries are added right in the shot handler
  }, [turnCount]);
      if (ship) {
        // Append hit log entry for ship hit
        const shipIndex = enemyShips.indexOf(ship);
        const size = ship.size;
        const willBeSunk = ship.positions.every(p => newEnemyGrid[p.row][p.col].isHit);
        setHitLog(prev => [...prev, { turn: turnCount + 1, coord: selectedCoordinate, shipId: shipIndex + 1, size, sunk: willBeSunk }]);

        if (willBeSunk) {
          ship.isSunk = true;
          ship.positions.forEach(p => {
            newEnemyGrid[p.row][p.col].state = 'sunk';
          });
          setGameMessage(`Schiff #${shipIndex + 1} (Länge ${size}) versenkt bei ${selectedCoordinate}! 🚢💥`);
        } else {
          setGameMessage(`Treffer auf Schiff #${shipIndex + 1} (Länge ${size}) bei ${selectedCoordinate}! 🎯`);
        }
      }
    } else {
      newEnemyGrid[row][col].state = 'miss';
      setGameMessage(`Verfehlt bei ${selectedCoordinate}! 💦`);
    }

    setEnemyGrid(newEnemyGrid);
    setSelectedCoordinate('');

    // increment counters
    setTurnCount(prev => prev + 1);
    setShotsTaken(prev => prev + 1);

    const allSunk = enemyShips.every(ship => ship.isSunk);

    if (gameMode === 'teamChallenge' && predictionLimit != null) {
      // Team challenge logic
      if (allSunk) {
        const used = (turnCount + 1);
        const win = used <= predictionLimit;
        setGameMessage(win ? `🎉 gewonnen! alle schiffe in ${used} zügen (vorhersage: ${predictionLimit}).` : `⚠️ verloren! ${used} züge gebraucht (vorhersage: ${predictionLimit}).`);
        setGamePhase('gameOver');
        return;
      } else if (turnCount + 1 >= predictionLimit) {
        setGameMessage(`❌ verloren! vorhersage erreicht (${predictionLimit}) und noch schiffe übrig.`);
        setGamePhase('gameOver');
        return;
      }
    }

    // Professional Mode: prediction countdown and win check
    if (professionalMode) {
      const limit = typeof proPrediction === 'number' ? proPrediction : null;
      const allSunkNow = enemyShips.every(s => s.isSunk);
      if (allSunkNow) {
        setGameMessage(`🏆 sieg! alle schiffe versenkt in ${turnCount + 1} zügen${(limit?` (vorhersage: ${limit})`: '')}.`);
        setGamePhase('gameOver');
        return;
      } else if (limit && (turnCount + 1) >= limit) {
        setGameMessage(`❌ verloren! vorhersage erreicht (${limit}) und noch schiffe übrig.`);
        setGamePhase('gameOver');
        return;
      }
    }

    // Standard win condition
    if (allSunk) {
      setGameMessage('🎉 gewonnen! alle schiffe versenkt!');
      setGamePhase('gameOver');
    }
  };

  // reset team challenge
  const resetTeamChallenge = () => {
    setPrediction('');
    setPredictionLimit(null);
    setSelectedCoordinate('');
    setTurnCount(0);
    setShotsTaken(0);
    setGamePhase('setup');
    setGameMessage('team-herausforderung zurückgesetzt');
  };


  // Render grid cell
  const renderCell = (cell: Cell, row: number, col: number, isPlayerGrid: boolean = false) => {
    let cellClass = 'w-8 h-8 border border-gray-400 flex items-center justify-center text-xs font-bold cursor-pointer transition-colors ';

    if (cell.state === 'hit') {
      cellClass += 'bg-red-500 text-white';
    } else if (cell.state === 'miss') {
      cellClass += 'bg-blue-300 text-white';
    } else if (cell.state === 'sunk') {
      cellClass += 'bg-red-800 text-white';
    } else if (isPlayerGrid && cell.hasShip) {
      cellClass += 'bg-gray-600 text-white';

    // Highlight current selected enemy coordinate
    const coordStr = getCoordinateString(row, col);
    const isTarget = !isPlayerGrid && selectedCoordinate && coordStr === selectedCoordinate.toUpperCase();
    if (isTarget && cell.state === 'empty') {
      cellClass += ' ring-2 ring-purple-500 bg-purple-50 ';
    } else if (isTarget) {
      cellClass += ' ring-2 ring-purple-500 ';
    }
    } else {
      cellClass += 'bg-blue-100 hover:bg-blue-200';
    }

    const coordinate = getCoordinateString(row, col);

    return (
      <div
        key={`${row}-${col}`}
        className={cellClass}
        onClick={() => !isPlayerGrid && gamePhase === 'playing' && setSelectedCoordinate(coordinate)}
        title={coordinate}
      >
        {cell.state === 'hit' && '💥'}
        {cell.state === 'miss' && '💦'}
        {cell.state === 'sunk' && '🚢'}
        {isPlayerGrid && cell.hasShip && !cell.isHit && '🚢'}
      </div>
    );
  };

  useEffect(() => {
    if (gamePhase === 'setup') {
      initializeGame();
    }
  }, [gameMode, gridSize, gamePhase]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-blue-600">🚢 schiffe versenken</h1>
        <button
          onClick={onBack}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          ← zurück
        </button>
            {/* Professional Mode Toggle */}
            <div className="col-span-full flex items-center gap-3 mb-2">
              <label className="font-bold text-gray-700">Professional Mode</label>
              <input type="checkbox" checked={professionalMode} onChange={(e) => setProfessionalMode(e.target.checked)} />
              {professionalMode && (
                <span className="text-xs text-gray-500">Advanced configuration enabled</span>
              )}
            </div>
      </div>

      {gamePhase === 'setup' && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">spieleinstellungen</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">spielmodus wählen:</label>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => setGameMode('practice')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    gameMode === 'practice'
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🎯</span>
                    <div>

	                <div role="button"
	                  onClick={() => setGameMode('teamChallenge')}
	                  className={`p-4 rounded-lg border-2 transition-all text-left ${
	                    gameMode === 'teamChallenge'
	                      ? 'border-rose-500 bg-rose-50 shadow-md'
	                      : 'border-gray-300 hover:border-rose-400 hover:bg-rose-50'
	                  }`}
	                >
	                  <div className="flex items-center space-x-3">
	                    <span className="text-2xl">🤝</span>
	                    <div>
	                      <div className="font-bold text-rose-700">team-herausforderung</div>
	                      <div className="text-sm text-rose-600">vorhersage der züge und gemeinsam gewinnen</div>
	                    </div>
	                  </div>
	                </div>

                      <div className="font-bold text-green-700">übungsmodus</div>
                      <div className="text-sm text-green-600">Koordinaten lernen ohne Druck</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setGameMode('vsComputer')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    gameMode === 'vsComputer'
                      ? 'border-orange-500 bg-orange-50 shadow-md'
                      : 'border-gray-300 hover:border-orange-400 hover:bg-orange-50'
                  }`}
                >
                  {professionalMode && (
                    <div className="mt-2 bg-white border rounded-lg p-3 text-sm">
                      <div className="font-bold mb-1">aktuelle schiffskonfiguration</div>
                      <div className="flex flex-wrap gap-2 items-center">
                        {proShipSummary.items.map((cfg, i) => (
                          <span key={i} className="px-2 py-1 bg-gray-100 rounded border">{cfg.count} × Länge {cfg.size}</span>
                        ))}
                        <span className="ml-auto font-bold">gesamt: {proShipSummary.total}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">größe ändern aktualisiert beide spielfelder sofort.</p>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🤖</span>
                    <div>
                      <div className="font-bold text-orange-700">gegen computer</div>
                      <div className="text-sm text-orange-600">strategisches spiel gegen ki</div>
                    </div>
                  </div>
              {professionalMode && (
                <div className="md:col-span-3 bg-amber-50 rounded-lg p-4">
                  <label className="block text-sm font-bold text-amber-700 mb-2">individuelle flotte konfigurieren:</label>
                  <div className="flex items-center gap-2 mb-2">
                    <button onClick={()=> setProIndividualShips(prev=>[...prev, 3])} className="px-2 py-1 text-xs bg-gray-200 rounded">+ schiff hinzufügen (länge 3)</button>
                    <button onClick={()=> setProIndividualShips([])} className="px-2 py-1 text-xs bg-gray-200 rounded">flotte leeren</button>
                    <button onClick={()=> setProIndividualShips([2,2,3,3,4,5])} className="px-2 py-1 text-xs bg-gray-200 rounded">standardflotte</button>
                  </div>
                  {proIndividualShips.length === 0 ? (
                    <p className="text-xs text-amber-700">keine individuellen schiffe hinzugefügt. nutzen sie „+ schiff hinzufügen“.</p>
                  ) : (
                    <div className="space-y-2">
                      {proIndividualShips.map((len, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">Schiff #{idx+1}</span>
                          <input type="number" min={2} max={8} value={len}
                            onChange={(e)=> setProIndividualShips(prev=>{
                              const n=[...prev]; n[idx]=Math.max(2, Math.min(8, parseInt(e.target.value)||2)); return n;})}
                            className="w-16 px-2 py-1 border rounded text-sm"/>
                          <button onClick={()=> setProIndividualShips(prev=> prev.filter((_,i)=>i!==idx))} className="text-xs text-red-600">entfernen</button>
                        </div>
                      ))}
                      <div className="text-xs text-gray-600">gesamt: {proIndividualShips.length} schiffe, zellen: {proIndividualShips.reduce((a,b)=>a+b,0)}</div>
                      <div className="text-xs font-bold {fleetValidationMsg ? 'text-red-600' : 'text-green-700'}">
                        {fleetValidationMsg || 'flotte sieht gut aus.'}
                      </div>
                    </div>
                  )}
                </div>
              )}
                </button>

                <button
                  onClick={() => setGameMode('twoPlayer')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    gameMode === 'twoPlayer'
                      ? 'border-purple-500 bg-purple-50 shadow-md'
                      : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                  }`}
                >
              {professionalMode && (
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <label className="block text-sm font-bold text-amber-700 mb-2">custom grid size:</label>
                  <input
                    type="number"
                    min={8}
                    max={26}
                    value={gridSize}
                    onChange={(e) => setGridSize(Math.max(8, Math.min(26, parseInt(e.target.value) || 8)))}
                    className="w-28 px-3 py-2 border border-amber-300 rounded-lg text-center font-bold"
                  />

                  <div className="mt-4">
                    <label className="block text-sm font-bold text-gray-700 mb-2">ships (length and count):</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {sessionShipConfig.map((cfg, idx) => (
                        <div key={idx} className="bg-white border rounded-lg p-3 space-y-2">
                          <div className="text-sm font-medium">Ship #{idx+1}</div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">length</span>
                            <input type="number" min={2} max={8} value={cfg.size} onChange={(e)=>{
                              const val = Math.max(2, Math.min(8, parseInt(e.target.value) || 2));
                              setSessionShipConfig(prev=>{
                                const next = [...prev];
                                next[idx] = { ...next[idx], size: val };
                                return next;
                              });
                            }} className="w-16 px-2 py-1 border rounded"/>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">count</span>
                            <input type="number" min={0} max={8} value={cfg.count} onChange={(e)=>{
                              const val = Math.max(0, Math.min(8, parseInt(e.target.value) || 0));
                              setSessionShipConfig(prev=>{
                                const next = [...prev];
                                next[idx] = { ...next[idx], count: val };
                                return next;
                              });
                            }} className="w-16 px-2 py-1 border rounded"/>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex gap-2">
                      <button onClick={()=> setSessionShipConfig(prev=>[...prev, { size: 3, count: 1 }])} className="px-2 py-1 text-xs bg-gray-200 rounded">+ add ship type</button>
                      <button onClick={()=> setSessionShipConfig([{ size: 2, count: 4 }, { size: 3, count: 3 }, { size: 4, count: 2 }, { size: 5, count: 1 }])} className="px-2 py-1 text-xs bg-gray-200 rounded">reset defaults</button>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-sm">prediction:</span>
                    <input
                      type="number"
                      min={1}
                      max={gridSize * gridSize}
                      value={proPrediction === '' ? '' : proPrediction}
                      onChange={(e)=> setProPrediction(e.target.value === '' ? '' : Math.max(1, Math.min(gridSize*gridSize, parseInt(e.target.value) || 1)))}
                      className="w-24 px-3 py-2 border border-amber-300 rounded-lg text-center font-bold"
                      placeholder="turns"
                    />
                    {proPrediction !== '' && (
                      <span className="text-xs text-gray-600">turn-by-turn countdown shown during play</span>
                    )}
                  </div>
                </div>
              )}
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">👥</span>
                    <div>
                      <div className="font-bold text-purple-700">zwei spieler</div>
                      <div className="text-sm text-purple-600">lokales multiplayer-spiel</div>
                    </div>
                  </div>
                </button>
              </div>
                  {/* Apply individual fleet to sessionShipConfig with validation */}
                  {professionalMode && (
                    <div className="mt-3">
                      <button
                        className="px-3 py-2 bg-amber-500 text-white rounded"
                        onClick={() => {
                          const msg = validateFleetFits(gridSize, proIndividualShips);
                          setFleetValidationMsg(msg);
                          if (!msg) {
                            // fold individual ships into size/count config
                            const counts: Record<number, number> = {};
                            proIndividualShips.forEach(s => { counts[s] = (counts[s]||0)+1; });
                            const next = Object.entries(counts).map(([size, count]) => ({ size: parseInt(size), count }));
                            setSessionShipConfig(next);
                          }
                        }}
                      >
                        flotte übernehmen
                      </button>
                      {fleetValidationMsg && (
                        <span className="ml-3 text-xs text-red-600">{fleetValidationMsg}</span>
                      )}
                    </div>
                  )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">spielfeldgröße:</label>
              <select
                value={gridSize}
                onChange={(e) => setGridSize(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                {GRID_SIZES.map(size => (
                  <option key={size.value} value={size.value}>{size.label}</option>
                ))}
              </select>

            {/* Team Challenge Controls */}
	            <div className="md:col-span-3 bg-rose-50 rounded-lg p-4">
	              <label className="block text-sm font-bold text-rose-700 mb-2">team-herausforderung:</label>
	              <div className="flex flex-col md:flex-row gap-4 items-center">
	                <div className="flex items-center gap-2">
	                  <span className="text-sm">wir werden alle schiffe in</span>
	                  <input
	                    type="number"
	                    min={1}
	                    max={gridSize * gridSize}
	                    value={prediction === '' ? '' : prediction}
	                    onChange={(e) => {
	                      const val = e.target.value === '' ? '' : Math.max(1, Math.min(gridSize*gridSize, parseInt(e.target.value) || 1));
	                      setPrediction(val as number | '');
	                    }}
	                    className="w-24 px-3 py-2 border border-rose-300 rounded-lg text-center font-bold"
	                    placeholder="züge"
	                  />
	                  <span className="text-sm">zügen versenken.</span>
	                </div>
	                <button
	                  onClick={() => {
	                    if (gameMode !== 'teamChallenge') setGameMode('teamChallenge');
	                    if (prediction === '' || typeof prediction !== 'number') {
	                      setGameMessage('bitte geben sie eine gültige vorhersage ein (mind. 1).');
	                      return;
	                    }
	                    setPredictionLimit(prediction);
	                    setShotsTaken(0);
	                    setTurnCount(0);
	                    setGamePhase('setup');
	                    initializeGame();
	                    setGamePhase('playing');
	                    setGameMessage('team-herausforderung gestartet!');
	                  }}
	                  className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-2 px-4 rounded-lg"
	                >
	                  neues spiel starten
	                </button>
	              </div>
	              <p className="text-xs text-rose-700 mt-2">vorhersagebereich: 1 bis {gridSize * gridSize}.</p>
	            </div>


            </div>

	            {/* per-session ship configuration */}
	            <div className="md:col-span-3 bg-gray-50 rounded-lg p-4">
	              <label className="block text-sm font-bold text-gray-700 mb-3">schiffskonfiguration (pro spiel):</label>

	            <div className="md:col-span-3 text-sm text-gray-600">
	              <p className="mt-2">hinweis: schiffe werden zufällig platziert. wählen sie die anzahl der</p>
	              <ul className="list-disc list-inside">
	                <li>destroyer: 2 felder</li>
            {professionalMode && proPrediction !== '' && (
              <div className="flex items-center justify-center gap-6 mb-4">
                <div className={`text-lg font-bold px-3 py-1 rounded-full ${turnCount+1 <= Math.floor(0.7*(proPrediction as number)) ? 'bg-green-100 text-green-700' : (turnCount+1 < (proPrediction as number) ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700')}`}>
                  zug {turnCount + 1} von {proPrediction} (pro)
                </div>
                <div className="text-sm text-gray-600">🛳️ verbleibende schiffe: {enemyShips.filter(s => !s.isSunk).length}</div>
              </div>
            )}
	                <li>cruiser: 3 felder</li>
	                <li>battleship: 4 felder</li>
	                <li>carrier: 5 felder</li>
	              </ul>
	            </div>

	              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
	                {[{label:'destroyer (2)', size:2},{label:'cruiser (3)', size:3},{label:'battleship (4)', size:4},{label:'carrier (5)', size:5}].map(({label,size}) => {
	                  const cfg = sessionShipConfig.find(c => c.size === size) || {size, count:0};
	                  return (
	                    <div key={size} className="bg-white border rounded-lg p-3 flex items-center justify-between">
	                      <span className="text-sm font-medium">{label}</span>
	                      <input
	                        type="number"
	                        min={0}
	                        max={8}
	                        value={cfg.count}
	                        onChange={(e) => {
	                          const val = Math.max(0, Math.min(8, parseInt(e.target.value) || 0));
	                          setSessionShipConfig(prev => {
	                            const next = [...prev];
	                            const idx = next.findIndex(c => c.size === size);
	                            if (idx >= 0) next[idx] = { size, count: val }; else next.push({ size, count: val });
	                            return next;
	                          });
	                        }}
	                        className="w-16 text-center border rounded-md p-1"
	                      />
	                    </div>
	                  );
	                })}
	              </div>
	              <p className="text-xs text-gray-500 mt-2">Passen Sie die Anzahl pro Schiffstyp an. Die Platzierung erfolgt zufällig.</p>
	            </div>


            <div className="flex items-end">
              <button
                onClick={() => setGamePhase('placement')}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                spiel starten
              </button>
            </div>
          </div>

          {/* Detailed German Instructions */}
          <div className="mt-8 space-y-6">
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-blue-800 mb-4">📚 Wie man Koordinaten liest</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-blue-700 mb-2">Koordinaten-Format:</h4>
                  <ul className="text-blue-600 space-y-1">
                    <li>• <strong>Buchstabe + Zahl:</strong> A1, B3, C5, etc.</li>
                    <li>• <strong>Reihen:</strong> A, B, C, D... (von oben nach unten)</li>
                    <li>• <strong>Spalten:</strong> 1, 2, 3, 4... (von links nach rechts)</li>
                    <li>• <strong>Beispiele:</strong> A5 = Reihe A, Spalte 5</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-blue-700 mb-2">Englische Aussprache:</h4>
                  <ul className="text-blue-600 space-y-1">
                    <li>• <strong>A1:</strong> "A one" [eɪ wʌn]</li>
                    <li>• <strong>B3:</strong> "B three" [biː θriː]</li>
                    <li>• <strong>C7:</strong> "C seven" [siː ˈsevən]</li>
                    <li>• <strong>D10:</strong> "D ten" [diː ten]</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-bold text-green-800 mb-2">🎯 übungsmodus</h4>
                <ul className="text-green-700 text-sm space-y-1">
                  <li>• perfekt zum lernen der koordinaten</li>
                  <li>• schiffe sind bereits platziert</li>

	            {gameMode === 'teamChallenge' && predictionLimit != null && (
	              <div className="flex items-center justify-center gap-6 mb-4">
	                <div className={`text-lg font-bold px-3 py-1 rounded-full ${turnCount+1 <= Math.floor(0.7*predictionLimit) ? 'bg-green-100 text-green-700' : (turnCount+1 < predictionLimit ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700')}`}>
	                  zug {turnCount + 1} von {predictionLimit} (vorhergesagt)
	                </div>
	                <div className="text-sm text-gray-600">🛳️ verbleibende schiffe: {enemyShips.filter(s => !s.isSunk).length}</div>
	              </div>
	            )}

                  <li>• konzentrieren sie sich auf die aussprache</li>
                  <li>• keine zeitbegrenzung</li>
                </ul>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">

	            {gameMode === 'teamChallenge' && predictionLimit != null && (
	              <div className="flex items-center justify-center gap-6 mb-4">
	                <div className={`text-lg font-bold px-3 py-1 rounded-full ${turnCount+1 <= Math.floor(0.7*predictionLimit) ? 'bg-green-100 text-green-700' : (turnCount+1 < predictionLimit ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700')}`}>
	                  zug {turnCount + 1} von {predictionLimit} (vorhergesagt)
	                </div>
	                <div className="text-sm text-gray-600">🛳️ verbleibende schiffe: {enemyShips.filter(s => !s.isSunk).length}</div>
	              </div>
	            )}

                <h4 className="font-bold text-orange-800 mb-2">🤖 gegen computer</h4>
                <ul className="text-orange-700 text-sm space-y-1">
                  <li>• spielen sie gegen die ki</li>
                  <li>• computer schießt zurück</li>
                  <li>• strategisches denken erforderlich</li>
                  <li>• verschiedene schwierigkeitsgrade</li>
                </ul>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-bold text-purple-800 mb-2">👥 zwei spieler</h4>
                <ul className="text-purple-700 text-sm space-y-1">
                  <li>• lokales multiplayer-spiel</li>
                  <li>• bildschirm wegdrehen zwischen zügen!</li>
                  <li>• abwechselnd schiffe platzieren</li>
                  <li>• perfekt für klassenzimmer</li>
                </ul>
              </div>
            </div>

	      {gamePhase === 'gameOver' && gameMode === 'teamChallenge' && predictionLimit != null && (
	        <div className="bg-rose-50 rounded-lg shadow-md p-6 text-center mb-4">
	          <h3 className="text-xl font-bold text-rose-700 mb-2">team-ergebnis</h3>
	          <p className="text-rose-800">tatsächliche züge: {turnCount}</p>
	          <p className="text-rose-800">vorhersage: {predictionLimit}</p>
	          <p className="text-rose-800">versenkte schiffe: {enemyShips.filter(s => s.isSunk).length} / {enemyShips.length}</p>
	        </div>
	      )}


            <div className="bg-yellow-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-yellow-800 mb-4">💬 Nützliche Englische Sätze</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-yellow-700 mb-2">Koordinaten ansagen:</h4>
                  <ul className="text-yellow-600 space-y-1">
                    <li>• "I choose A5" - Ich wähle A5</li>
                    <li>• "My target is B3" - Mein Ziel ist B3</li>
                    <li>• "I shoot at C7" - Ich schieße auf C7</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-yellow-700 mb-2">Reaktionen:</h4>
                  <ul className="text-yellow-600 space-y-1">
                    <li>• "Hit!" - Treffer!</li>
                    <li>• "Miss!" - Verfehlt!</li>
                    <li>• "You sunk my ship!" - Du hast mein Schiff versenkt!</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {gamePhase === 'playing' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">zug {turnCount + 1}</h2>
              <div className="text-sm text-gray-600">
                modus: {gameMode === 'practice' ? 'übung' : gameMode === 'vsComputer' ? 'gegen computer' : 'zwei spieler'}
              </div>
            </div>


	          {gameMode === 'teamChallenge' && predictionLimit != null && (
	            <div className="flex items-center justify-center gap-4 mb-4">
	              <div className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold">treffer: {stats.hits}</div>
	              <div className="px-3 py-1 rounded-full bg-sky-100 text-sky-700 font-bold">fehlversuche: {stats.misses}</div>
	            </div>
	          )}

            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-blue-800 font-medium">{gameMessage}</p>
            </div>

	            {gameMode === 'teamChallenge' && (
	              <button onClick={resetTeamChallenge} className="ml-2 bg-rose-200 hover:bg-rose-300 text-rose-800 font-bold py-2 px-4 rounded-lg">
	                team-herausforderung zurücksetzen
	              </button>
	            )}


            <div className="flex items-center space-x-4 mb-6">
              <input
                type="text"
                value={selectedCoordinate}
                onChange={(e) => setSelectedCoordinate(e.target.value.toUpperCase())}
                placeholder="z.B. A5, B3, C7..."
                className="px-3 py-2 border border-gray-300 rounded-lg text-lg font-mono"
                onKeyPress={(e) => e.key === 'Enter' && handleCoordinateSubmit()}
              />
              <button
                onClick={handleCoordinateSubmit}
                disabled={!selectedCoordinate}
                className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-bold py-2 px-6 rounded-lg transition-colors"
              >
                🎯 Schießen!

            {professionalMode && hitLog.length > 0 && (
              <div className="bg-white border rounded-lg p-3 text-sm w-full">
                <div className="font-bold mb-2">Treffer-Protokoll</div>
                <ul className="max-h-32 overflow-auto list-disc pl-5 space-y-1">
                  {hitLog.slice().reverse().map((h, idx) => (
                    <li key={idx}>
                      Zug {h.turn}: {h.coord} – {h.shipId ? `Schiff #${h.shipId} (Länge ${h.size})` : '—'} {h.sunk ? 'versenkt' : 'getroffen'}
                    </li>
                  ))}
                </ul>
              </div>
            )}


              {professionalMode && (
                <div className="flex items-center justify-center gap-3 mb-4">
                  {proShipSummary.items.map((cfg, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 rounded border text-xs">{cfg.count} × Länge {cfg.size}</span>
                  ))}
                  <span className="px-2 py-1 bg-gray-200 rounded text-xs font-bold">gesamt: {proShipSummary.total}</span>
                  {typeof proPrediction === 'number' && (
                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">vorhersage: {proPrediction}</span>
                  )}
                </div>
              )}

              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-bold mb-3 text-center">Feindliches Gewässer</h3>
              <div className="flex justify-center">
                <div className="inline-block">
                  {/* Column numbers header */}
                  <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: `32px repeat(${gridSize}, 32px)` }}>
                    <div></div> {/* Empty corner */}
                    {Array.from({ length: gridSize }, (_, i) => (
                      <div key={i} className="w-8 h-6 flex items-center justify-center text-sm font-bold text-blue-600">
                        {i + 1}
                      </div>
                    ))}
                  </div>

                  {/* Grid with row labels */}
                  <div className="grid gap-1" style={{ gridTemplateColumns: `32px repeat(${gridSize}, 32px)` }}>
                    {enemyGrid.map((row, rowIndex) => (
                      <React.Fragment key={rowIndex}>
                        {/* Row label */}
                        <div className="w-8 h-8 flex items-center justify-center text-sm font-bold text-blue-600">
                          {String.fromCharCode(65 + rowIndex)}
                        </div>
                        {/* Row cells */}
                        {row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex, false))}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {gameMode !== 'practice' && (
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-lg font-bold mb-3 text-center">Ihre Flotte</h3>
                <div className="flex justify-center">
                  <div className="inline-block">
                    {/* Column numbers header */}
                    <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: `32px repeat(${gridSize}, 32px)` }}>
                      <div></div> {/* Empty corner */}
                      {Array.from({ length: gridSize }, (_, i) => (
                        <div key={i} className="w-8 h-6 flex items-center justify-center text-sm font-bold text-blue-600">
                          {i + 1}
                        </div>
                      ))}
                    </div>

                    {/* Grid with row labels */}
                    <div className="grid gap-1" style={{ gridTemplateColumns: `32px repeat(${gridSize}, 32px)` }}>
                      {playerGrid.map((row, rowIndex) => (
                        <React.Fragment key={rowIndex}>
                          {/* Row label */}
                          <div className="w-8 h-8 flex items-center justify-center text-sm font-bold text-blue-600">
                            {String.fromCharCode(65 + rowIndex)}
                          </div>
                          {/* Row cells */}
                          {row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex, true))}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {gamePhase === 'gameOver' && (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-2xl font-bold text-green-600 mb-4">🎉 Spiel Beendet!</h2>
          <p className="text-lg mb-6">{gameMessage}</p>
          <div className="space-x-4">
            <button
              onClick={() => setGamePhase('setup')}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              neues spiel
            </button>
            <button
              onClick={onBack}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              zurück zum menü
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Module4_Battleships;
