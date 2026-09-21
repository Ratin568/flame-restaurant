"use client";

import ParallaxLayer from "../../ParallaxLayer/ParallaxLayer";

import styles from "./CtaVisual.module.css";

type CtaVisualProps = {
  progress?: number;
  velocity?: number;
};

export default function CtaVisual({
  progress = 0.5,
  velocity = 0,
}: CtaVisualProps) {
  return (
    <div
      className={styles.visual}
      aria-hidden="true"
    >
      {/* Ambient background light */}
      <ParallaxLayer
        progress={progress}
        velocity={velocity}
        depth={0.18}
        x={-16}
        y={-10}
      >
        <div
          className={styles.ambientGlow}
        />
      </ParallaxLayer>

      {/* Background rings */}
      <ParallaxLayer
        progress={progress}
        velocity={velocity}
        depth={0.42}
        x={12}
        y={-8}
      >
        <div className={styles.rings}>
          <span />
          <span />
          <span />
        </div>
      </ParallaxLayer>

      {/* Foreground particles */}
      <ParallaxLayer
        progress={progress}
        velocity={velocity}
        depth={1.35}
        x={18}
        y={-22}
      >
        <div className={styles.particles}>
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
      </ParallaxLayer>

      {/* Main CTA */}
      <ParallaxLayer
        progress={progress}
        velocity={velocity}
        depth={0.9}
        x={0}
        y={0}
      >
        <div className={styles.cta}>
          <div className={styles.innerRing} />

          <div className={styles.content}>
            <span
              className={styles.eyebrow}
            >
              THE LAST BITE
            </span>

            <strong>
              FLAME
            </strong>

            <span
              className={styles.action}
            >
              ORDER NOW

              <span
                className={styles.arrow}
              >
                →
              </span>
            </span>
          </div>
        </div>
      </ParallaxLayer>

      {/* Label */}
      <ParallaxLayer
        progress={progress}
        velocity={velocity}
        depth={0.55}
        x={8}
        y={14}
      >
        <div className={styles.label}>
          <span>04</span>
          <span>END / FLAME</span>
        </div>
      </ParallaxLayer>
    </div>
  );
}