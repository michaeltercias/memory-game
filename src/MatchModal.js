import React from "react";
import styles from "./MatchModal.module.scss";

export default function MatchModal({ emoji }) {
  if (!emoji) return null;

  return (
    <div className={styles.modalContainer} aria-live="polite">
      <div className={styles.modal}>
        <p>You found {emoji}!</p>
      </div>
    </div>
  );
}