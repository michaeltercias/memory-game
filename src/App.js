import React, { useEffect, useRef, useState, useCallback } from "react";
import styles from "./App.module.scss";
import Card from "./Card";
import MatchModal from "./MatchModal";
import WinModal from "./WinModal";

// Emoji pool for up to 8x8
const emojiPool = [
  "🍎","⚓","🍺","🐱","🐉","🌞","🎲","🍔",
  "🚗","🎵","🌈","🔥","🍕","🐠","🌍","🎁",
  "🍩","⚡","🌹","🐶","📚","✈️","🏀","🍇",
  "🛸","💡","🥦","🎧","🚀","🦋","🏝","📀"
];

export default function App() {
  const [difficulty, setDifficulty] = useState("medium");
  const [cards, setCards] = useState([]);
  const [choiceOne, setChoiceOne] = useState(null);
  const [choiceTwo, setChoiceTwo] = useState(null);
  const [disabled, setDisabled] = useState(false);

  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  const [statusMessage, setStatusMessage] = useState("");
  const [bestScores, setBestScores] = useState(() => {
    const stored = localStorage.getItem("bestScores");
    return stored ? JSON.parse(stored) : {};
  });

  const [showWinModal, setShowWinModal] = useState(false);
  const [foundEmoji, setFoundEmoji] = useState(null);

  const restartBtnRef = useRef(null);
  const matchTimerRef = useRef(null);
  const nonMatchTimerRef = useRef(null);
  const intervalRef = useRef(null);

  const gridSize =
    difficulty === "easy" ? 2 :
    difficulty === "medium" ? 4 :
    difficulty === "hard" ? 6 : 8;
  const numPairs = (gridSize * gridSize) / 2;

  // Build / shuffle board
  const buildBoard = useCallback(() => {
    const shuffledPool = [...emojiPool].sort(() => Math.random() - 0.5);
    const emojis = shuffledPool.slice(0, numPairs);

    const shuffled = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map(emoji => ({ emoji, id: Math.random().toString(36).slice(2), matched: false }));

    clearTimeout(matchTimerRef.current);
    clearTimeout(nonMatchTimerRef.current);
    clearInterval(intervalRef.current);

    setCards(shuffled);
    setChoiceOne(null);
    setChoiceTwo(null);
    setMoves(0);
    setTime(0);
    setTimerActive(false);
    setDisabled(false);
    setStatusMessage("New game started");
    setShowWinModal(false);
    setFoundEmoji(null);

    // focus restart button for accessibility
    setTimeout(() => {
      if (restartBtnRef.current) restartBtnRef.current.focus();
    }, 0);
  }, [numPairs]);

  useEffect(() => {
    buildBoard();
  }, [buildBoard]);

  const handleChoice = (card) => {
    if (!timerActive) setTimerActive(true);
    if (disabled) return;
    if (choiceOne && card.id === choiceOne.id) return;
    choiceOne ? setChoiceTwo(card) : setChoiceOne(card);
  };

  // Compare choices
  useEffect(() => {
    if (!choiceOne || !choiceTwo) return;

    if (choiceOne.emoji === choiceTwo.emoji) {
      // match
      setCards(prev => prev.map(c => c.emoji === choiceOne.emoji ? { ...c, matched: true } : c));
      setMoves(m => m + 1);
      setFoundEmoji(choiceOne.emoji);

      setChoiceOne(null);
      setChoiceTwo(null);

      matchTimerRef.current = setTimeout(() => setFoundEmoji(null), 1400);
    } else {
      // not a match
      setDisabled(true);
      nonMatchTimerRef.current = setTimeout(() => {
        setChoiceOne(null);
        setChoiceTwo(null);
        setMoves(m => m + 1);
        setDisabled(false);
      }, 700);
    }
  }, [choiceOne, choiceTwo]);

  // Timer
  useEffect(() => {
    if (timerActive) {
      intervalRef.current = setInterval(() => setTime(t => t + 1), 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [timerActive]);

  // Update best score
  const updateBestScore = useCallback(() => {
    const prev = bestScores[difficulty];
    const current = { moves, time };
    let isBetter = false;
    if (!prev) isBetter = true;
    else if (current.moves < prev.moves) isBetter = true;
    else if (current.moves === prev.moves && current.time < prev.time) isBetter = true;

    if (isBetter) {
      const newScores = { ...bestScores, [difficulty]: current };
      setBestScores(newScores);
      localStorage.setItem("bestScores", JSON.stringify(newScores));
      setStatusMessage("🎯 New best score!");
    }
  }, [bestScores, difficulty, moves, time]);

  // Win detection
  useEffect(() => {
    if (cards.length > 0 && cards.every(c => c.matched)) {
      setTimerActive(false);
      setStatusMessage(`You won in ${moves} moves and ${time} seconds! 🎉`);
      updateBestScore();
      setShowWinModal(true);
    }
  }, [cards, moves, time, updateBestScore]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  useEffect(() => {
    return () => {
      clearTimeout(matchTimerRef.current);
      clearTimeout(nonMatchTimerRef.current);
      clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>Emoji Memory</h1>

        <div className={styles.controls}>
          <label className={styles.selectLabel}>
            Difficulty
            <select
              aria-label="Select difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className={styles.select}
            >
              <option value="easy">Easy — 2×2</option>
              <option value="medium">Medium — 4×4</option>
              <option value="hard">Hard — 6×6</option>
              <option value="expert">Expert — 8×8</option>
            </select>
          </label>

          <button
            ref={restartBtnRef}
            className={styles.btn}
            onClick={buildBoard}
            aria-label="Restart game"
          >
            Restart
          </button>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>⏱ {formatTime(time)}</div>
          <div className={styles.stat}>🔁 Moves: {moves}</div>
          <div className={styles.stat}>
            🏆 Best:{" "}
            {bestScores[difficulty]
              ? `${bestScores[difficulty].moves} moves, ${formatTime(bestScores[difficulty].time)}`
              : "—"}
          </div>
        </div>
      </header>

      {/* Match popup at top, non-blocking */}
      <MatchModal emoji={foundEmoji} />

      <main className={styles.boardWrapper}>
        <section
          className={styles.board}
          style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
        >
          {cards.map(card => (
            <Card
              key={card.id}
              card={card}
              handleChoice={handleChoice}
              flipped={card === choiceOne || card === choiceTwo || card.matched}
              disabled={disabled}
            />
          ))}
        </section>
      </main>

      {/* Win modal */}
      {showWinModal && (
        <WinModal
          time={formatTime(time)}
          moves={moves}
          best={bestScores[difficulty] ? `${bestScores[difficulty].moves} moves, ${formatTime(bestScores[difficulty].time)}` : "—"}
          onRestart={buildBoard}
          onClose={() => setShowWinModal(false)}
        />
      )}

      <div className={styles.srOnly} role="status" aria-live="polite">
        {statusMessage}
      </div>
    </div>
  );
}
