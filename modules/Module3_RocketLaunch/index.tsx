import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useSessionVocabulary } from '../../contexts/SessionVocabularyContext';
import { useGameFilters } from '../../contexts/GameFiltersContext';
import ModuleContainer from '../../components/ModuleContainer';
import { ALPHABET, ROCKET_PARTS, MAX_MISTAKES, MIN_MISTAKES } from '../../constants';
import { isGuessableLetter, isWordSolved } from '../../utils/wordGuess';

function RocketScene({ mistakes, limit, won, style }: { mistakes: number; limit: number; won: boolean; style: "space" | "lines" }) {
  const launched = mistakes >= limit;
  const stage = Math.ceil(mistakes / limit * 5);
  if (style === 'lines') return (
    <div className={`rocket-scene rocket-line-scene ${launched ? 'rocket-launched' : ''} ${won ? 'rocket-saved' : ''}`}>
      <svg viewBox="0 0 100 120" role="img" aria-label={`Linienrakete: ${mistakes} von ${limit} Fehlversuchen`}>
        <path d="M15 103H85" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/>
        <g className="rocket-vehicle">
          {ROCKET_PARTS.slice(0, Math.ceil(mistakes / limit * ROCKET_PARTS.length)).map((part, index) => <path className="rocket-part" key={index} d={part} stroke="#334155" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>)}
        </g>
      </svg>
      <p>{won ? 'Wort erraten! ✨' : launched ? 'Lift-off! 🚀' : `${mistakes} / ${limit} Fehlversuche`}</p>
    </div>
  );
  return (
    <div className={`rocket-scene ${launched ? 'rocket-launched' : ''} ${won ? 'rocket-saved' : ''}`}>
      <svg viewBox="0 0 320 350" role="img" aria-label={won ? 'Rakete gestoppt – Wort erraten' : launched ? 'Die Rakete startet' : `Raketenbau: ${mistakes} von ${limit} Fehlversuchen`}>
        <defs>
          <linearGradient id="rocket-body" x2="1" y2="1"><stop stopColor="#fff"/><stop offset="1" stopColor="#9db9df"/></linearGradient>
          <linearGradient id="rocket-fire" x2="0" y2="1"><stop stopColor="#fff8b0"/><stop offset=".45" stopColor="#fbbf24"/><stop offset="1" stopColor="#f97316"/></linearGradient>
        </defs>
        <g fill="#e0f2fe" opacity=".75">
          {[[28,30],[78,74],[260,44],[285,138],[40,178],[242,228],[114,22],[206,91],[58,263]].map(([x,y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="2"/>)}
        </g>
        <circle cx="260" cy="83" r="27" fill="#a5b4fc"/>
        <ellipse cx="260" cy="83" rx="41" ry="9" fill="none" stroke="#c4b5fd" strokeWidth="5" transform="rotate(-25 260 83)"/>
        <path d="M0 321Q90 270 170 315T320 300V350H0Z" fill="#334766"/>
        <ellipse cx="160" cy="306" rx="75" ry="12" fill="#14253e"/>
        <path d="M103 298H217" stroke="#94a3b8" strokeWidth="7" strokeLinecap="round"/>
        <g className="rocket-vehicle">
          <g opacity=".15" fill="none" stroke="#dbeafe" strokeWidth="2" strokeDasharray="5 5">
            <path d="M160 65Q120 104 127 220L112 265H142L160 242L178 265H208L193 220Q200 104 160 65Z"/>
          </g>
          {stage >= 1 && <path className="rocket-part" d="M136 220H184L190 247H130Z" fill="#64748b" stroke="#cbd5e1" strokeWidth="3"/>}
          {stage >= 2 && <path className="rocket-part" d="M128 184L102 252L128 240L144 216M192 184L218 252L192 240L176 216" fill="#fb7185" stroke="#fecdd3" strokeWidth="3"/>}
          {stage >= 3 && <path className="rocket-part" d="M160 70Q121 112 128 217Q160 235 192 217Q199 112 160 70Z" fill="url(#rocket-body)"/>}
          {stage >= 4 && <path className="rocket-part" d="M160 65Q138 89 132 117Q160 128 188 117Q182 89 160 65Z" fill="#fb7185"/>}
          {stage >= 5 && <g className="rocket-part"><circle cx="160" cy="157" r="22" fill="#64748b"/><circle cx="160" cy="157" r="16" fill="#38bdf8"/><path d="M151 150L160 142" stroke="white" strokeWidth="5" strokeLinecap="round"/></g>}
          {launched && <path className="rocket-flame" d="M140 246Q128 277 160 303Q192 277 180 246L170 257L160 244L150 257Z" fill="url(#rocket-fire)"/>}
        </g>
        {won && <g className="rocket-celebration" fill="#fde68a"><path d="M160 90L170 116L199 118L177 137L184 166L160 151L136 166L143 137L121 118L150 116Z"/>{[60,100,220,260].map((x,i)=><circle key={x} cx={x} cy={170+i%2*40} r="6"/>)}</g>}
      </svg>
      <p>{won ? 'Mission geschafft! ✨' : launched ? 'Lift-off! 🚀' : mistakes === 0 ? 'Die Startrampe ist bereit.' : 'Jeder Fehlversuch baut die Rakete weiter.'}</p>
    </div>
  );
}

export default function Module3RocketLaunch() {
  const { sessionVocabulary } = useSessionVocabulary();
  const { gameFilters } = useGameFilters();
  const [secretWord, setSecretWord] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [limit, setLimit] = useState(MAX_MISTAKES);
  const [bankSize, setBankSize] = useState(5);
  const [wordBank, setWordBank] = useState<string[]>([]);
  const [minLength, setMinLength] = useState(1);
  const [round, setRound] = useState(0);
  const [visualStyle, setVisualStyle] = useState<'space' | 'lines'>('space');
  const availableWords = useMemo(() => [...new Set(sessionVocabulary.filter(w =>
    (gameFilters.category === 'all' || w.category === gameFilters.category) &&
    (gameFilters.maxWordLength == null || w.word.length <= gameFilters.maxWordLength) &&
    (gameFilters.vocabSource === 'all' || (gameFilters.vocabSource === 'alphabet' ? w.predefined === true : w.predefined !== true)) &&
    w.word.trim().length >= minLength && [...w.word].some(isGuessableLetter)
  ).map(w => w.word.trim().toUpperCase()))], [sessionVocabulary, gameFilters, minLength]);
  const mistakes = guesses.filter(letter => !secretWord.includes(letter)).length;
  const won = isWordSolved(secretWord, guesses);
  const lost = !won && mistakes >= limit;
  const finished = won || lost;
  const lastGuess = guesses.at(-1);
  const bankMax = Math.max(1, Math.min(10, availableWords.length));

  const startNewGame = useCallback(() => {
    setSecretWord(previous => {
      const alternatives = availableWords.filter(word => word !== previous);
      const pool = alternatives.length ? alternatives : availableWords;
      return pool[Math.floor(Math.random() * pool.length)] ?? '';
    });
    setGuesses([]);
    setWordBank([]);
    setRound(value => value + 1);
  }, [availableWords]);

  useEffect(() => { startNewGame(); }, [startNewGame]);

  const guess = (letter: string) => {
    if (finished || !secretWord) return;
    setGuesses(previous => previous.includes(letter) ? previous : [...previous, letter]);
  };
  const showVowels = () => {
    if (finished) return;
    setGuesses(previous => [...new Set([...previous, ...['A','E','I','O','U'].filter(letter => secretWord.includes(letter))])]);
  };
  const showWordBank = () => {
    const pool = availableWords.filter(word => word !== secretWord);
    const options = [secretWord];
    while (options.length < Math.min(bankSize, bankMax) && pool.length) {
      options.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    }
    // Insert the answer among the alternatives, never always in the first slot.
    const answer = options.shift()!;
    options.splice(Math.floor(Math.random() * (options.length + 1)), 0, answer);
    setWordBank(options);
  };

  return (
    <ModuleContainer title="Guess the Word 🚀">
      <div className="word-mission">
        <p className="mission-instructions" lang="de">Erratet das englische Wort Buchstabe für Buchstabe. Jeder falsche Buchstabe baut die Rakete weiter. Findet das Wort, bevor sie startet! Leerzeichen und Sonderzeichen sind schon sichtbar.</p>
        <div className="mission-style" role="group" aria-label="Raketenansicht">
          <button aria-pressed={visualStyle === 'space'} onClick={() => setVisualStyle('space')}>🪐 Weltraum</button>
          <button aria-pressed={visualStyle === 'lines'} onClick={() => setVisualStyle('lines')}>✏️ Linienzeichnung</button>
        </div>
        <details className="mission-settings">
          <summary>Einstellungen · {availableWords.length} Wörter · {limit} Fehlversuche</summary>
          <div>
            <label>Mindestlänge: {minLength}<input aria-label="Mindestlänge" type="range" min="1" max="10" value={minLength} onChange={e => setMinLength(Number(e.target.value))}/></label>
            <label>Wörter in der Hilfe: {Math.min(bankSize, bankMax)}<input aria-label="Wörter in der Hilfe" type="range" min="1" max={bankMax} value={Math.min(bankSize, bankMax)} onChange={e => setBankSize(Number(e.target.value))}/></label>
            <label>Erlaubte Fehlversuche: {limit}<input aria-label="Erlaubte Fehlversuche" type="range" min={MIN_MISTAKES} max={MAX_MISTAKES} value={limit} onChange={e => { setLimit(Number(e.target.value)); startNewGame(); }}/></label>
          </div>
          <p>Wortfilter und Fehlversuchslimit starten eine neue Runde.</p>
        </details>
        {!availableWords.length ? <p className="mission-empty" role="status">Keine passenden Wörter. Verringert die Mindestlänge oder passt die Wortfilter an.</p> : secretWord && <>
          <div className="mission-layout">
            <RocketScene key={round} mistakes={mistakes} limit={limit} won={won} style={visualStyle}/>
            <div className="mission-console">
              <div className="mission-heading"><span>MISSION {String(round).padStart(2, '0')}</span><button onClick={startNewGame}>Neues Wort ↻</button></div>
              <div className="mission-word" aria-label="Gesuchtes Wort">
                {[...secretWord].map((letter,index) => {
                  const visible = !isGuessableLetter(letter) || guesses.includes(letter) || lost;
                  return <span key={`${round}-${index}-${visible}`} className={`mission-letter ${visible && isGuessableLetter(letter) ? 'letter-revealed' : ''} ${lost && !guesses.includes(letter) ? 'letter-answer' : ''}`} aria-label={visible ? letter === ' ' ? 'Leerzeichen' : letter.toLowerCase() : 'Unbekannter Buchstabe'}>{visible ? letter === ' ' ? '·' : letter.toLowerCase() : '_'}</span>;
                })}
              </div>
              <div className="mission-fuel" aria-label={`${limit - mistakes} Fehlversuche übrig`}><span style={{width:`${Math.max(0, 1 - mistakes / limit) * 100}%`}}/></div>
              <p className="mission-feedback" role="status" key={`${round}-${guesses.join('')}`}>
                {won ? 'Great job! Ihr habt das Wort erraten. ✨' : lost ? `Die Rakete ist gestartet. Das Wort war: ${secretWord.toLowerCase()}.` : lastGuess ? secretWord.includes(lastGuess) ? `Yes! „${lastGuess.toLowerCase()}“ ist dabei!` : `„${lastGuess.toLowerCase()}“ ist nicht dabei. Noch ${limit - mistakes} Fehlversuche.` : `Sagt einen Buchstaben auf Englisch. ${limit} Fehlversuche sind erlaubt.`}
              </p>
              <div className="mission-keyboard">
                {ALPHABET.map(letter => {
                  const used = guesses.includes(letter);
                  return <button key={letter} onClick={() => guess(letter)} disabled={used || finished} className={used ? secretWord.includes(letter) ? 'key-correct' : 'key-wrong' : ''} aria-label={`${letter}${used ? secretWord.includes(letter) ? ', richtig' : ', falsch' : ''}`}>{letter}{used && <small aria-hidden="true">{secretWord.includes(letter) ? '✓' : '×'}</small>}</button>;
                })}
              </div>
              <div className="mission-actions">
                <button onClick={showVowels} disabled={finished}>💡 Vokale zeigen</button>
                <button onClick={showWordBank} disabled={finished}>📚 Wörterhilfe</button>
                {finished && <button className="mission-again" onClick={startNewGame}>Noch einmal spielen →</button>}
              </div>
              {!!wordBank.length && <ul className="mission-bank">{wordBank.map(word => <li key={word}>{word.toLowerCase()}</li>)}</ul>}
            </div>
          </div>
        </>}
      </div>
    </ModuleContainer>
  );
}
