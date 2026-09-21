"use client";

import ParallaxLayer from "../../ParallaxLayer/ParallaxLayer";

import styles from "./HeatVisual.module.css";

type HeatVisualProps = {
  progress?: number;
  velocity?: number;
};

export default function HeatVisual({
  progress = 0.5,
  velocity = 0,
}: HeatVisualProps) {
  return (
    <div
      className={styles.visual}
      aria-hidden="true"
    >
      {/* Background heat glow */}
      <ParallaxLayer
        progress={progress}
        velocity={velocity}
        depth={0.18}
        x={-16}
        y={-10}
      >
        <div className={styles.heatGlow} />
      </ParallaxLayer>

      {/* Back heat rings */}
      <ParallaxLayer
        progress={progress}
        velocity={velocity}
        depth={0.35}
        x={10}
        y={-8}
      >
        <div className={styles.rings}>
          <span />
          <span />
          <span />
        </div>
      </ParallaxLayer>

      {/* Main flame */}
      <ParallaxLayer
        progress={progress}
        velocity={velocity}
        depth={1}
        x={0}
        y={0}
      >
        <div className={styles.flame}>
          <div className={styles.flameOuter} />
          <div className={styles.flameMiddle} />
          <div className={styles.flameInner} />
          <div className={styles.flameCore} />
        </div>
      </ParallaxLayer>

      {/* Foreground embers */}
      <ParallaxLayer
        progress={progress}
        velocity={velocity}
        depth={1.35}
        x={18}
        y={-22}
      >
        <div className={styles.embers}>
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </ParallaxLayer>

      {/* Scene label */}
      <div className={styles.label}>
        <span>FLAME</span>
        <span>02</span>
      </div>
    </div>
  );
}