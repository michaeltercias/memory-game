import React, { useEffect, useRef, useCallback } from "react";
import styles from "./WinModal.module.scss";

export default function WinModal({ time, moves, best, onRestart, onClose }) {
  const modalRef = useRef(null);
  const firstBtnRef = useRef(null);

  // Focus modal on mount
  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.focus();
    }
  }, []);

  // Handle ESC key to close
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
      if (e.key === "Tab") {
        // Focus trap
        const focusableEls = modalRef.current.querySelectorAll(
          "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
        );
        const firstEl = focusableEls[0];
        const lastEl = focusableEls[focusableEls.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            e.preventDefault();
            lastEl.focus();
          }
        } else {
          if (document.activeElement === lastEl) {
            e.preventDefault();
            firstEl.focus();
          }
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div
        className={styles.modal}
        ref={modalRef}
        tabIndex={-1}
        aria-labelledby="win-title"
      >
        <h2 id="win-title" className={styles.title}>
          🎉 You Win!
        </h2>
        <p className={styles.record}>⏱ Time: {time}</p>
        <p className={styles.record}>🔁 Moves: {moves}</p>
        <p className={styles.record}>🏆 Best: {best}</p>

        <button
          ref={firstBtnRef}
          className={styles.btn}
          onClick={() => {
            onRestart();
            onClose();
          }}
        >
          Restart Game
        </button>
      </div>
    </div>
  );
}
