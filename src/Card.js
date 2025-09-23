import React from "react";
import styles from "./Card.module.scss";
import classNames from "classnames";

export default function Card({ card, handleChoice, flipped, disabled }) {
  const handleClick = () => {
    if (!disabled) {
      handleChoice(card);
    }
  };

  return (
    <button
      className={classNames(styles.card, { [styles.flipped]: flipped })}
      onClick={handleClick}
      disabled={disabled || card.matched}
      aria-pressed={flipped}
    >
      <div className={styles.cardInner}>
        <div className={classNames(styles.cardFace, styles.front)}>
          {card.emoji}
        </div>
        <div className={classNames(styles.cardFace, styles.back)}>
          <span className={styles.backMark}>?</span>
        </div>
      </div>
    </button>
  );
}