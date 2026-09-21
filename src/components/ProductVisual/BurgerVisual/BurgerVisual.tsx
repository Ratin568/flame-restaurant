"use client";

import ParallaxLayer from "../../ParallaxLayer/ParallaxLayer";

import styles from "./BurgerVisual.module.css";

type BurgerVisualProps = {
  progress?: number;
  velocity?: number;
};

function clamp(
  value: number,
  min = 0,
  max = 1
) {
  return Math.min(
    Math.max(value, min),
    max
  );
}

function easeOutCubic(
  value: number
) {
  const t = clamp(value);

  return 1 - Math.pow(1 - t, 3);
}

export default function BurgerVisual({
  progress = 0.5,
  velocity = 0,
}: BurgerVisualProps) {
  const p = clamp(progress);

  /*
   * Main reveal.
   *
   * The burger is already mostly visible
   * when the scene starts, then settles into
   * its final hero position.
   */
  const reveal = easeOutCubic(
    clamp(p / 0.34)
  );

  /*
   * Cinematic floating motion.
   */
  const float =
    Math.sin(p * Math.PI * 2.4) * 5;

  const floatRotate =
    Math.sin(p * Math.PI * 1.8) * 0.7;

  const v = clamp(
    velocity,
    -0.65,
    0.65
  );

  /*
   * Slight camera response.
   */
  const cameraX = v * -7;
  const cameraY = v * 4;

  /*
   * Entrance position.
   */
  const entranceY =
    55 * (1 - reveal);

  const entranceScale =
    0.88 + reveal * 0.12;

  /*
   * Individual ingredient separation.
   * Much smaller than before — this is not
   * supposed to look like the burger exploding.
   */
  const topBunY =
    -18 * (1 - reveal);

  const lettuceY =
    -9 * (1 - reveal);

  const cheeseY =
    -6 * (1 - reveal);

  const pattyY =
    8 * (1 - reveal);

  const sauceY =
    5 * (1 - reveal);

  const bottomBunY =
    14 * (1 - reveal);

  return (
    <div
      className={styles.visual}
      aria-hidden="true"
    >
      {/* =====================================
          DEEP ATMOSPHERE
          ===================================== */}

      <ParallaxLayer
        progress={progress}
        velocity={velocity}
        depth={0.12}
        x={-22}
        y={-16}
      >
        <div
          className={
            styles.ambientGlow
          }
        />
      </ParallaxLayer>

      <ParallaxLayer
        progress={progress}
        velocity={velocity}
        depth={0.25}
        x={18}
        y={-12}
      >
        <div
          className={
            styles.secondaryGlow
          }
        />
      </ParallaxLayer>

      {/* =====================================
          LARGE CINEMATIC HALO
          ===================================== */}

      <ParallaxLayer
        progress={progress}
        velocity={velocity}
        depth={0.3}
        x={-8}
        y={4}
      >
        <div
          className={styles.heroHalo}
          style={{
            opacity:
              0.45 +
              reveal * 0.55,
            transform: `
              scale(
                ${0.88 + reveal * 0.12}
              )
            `,
          }}
        />
      </ParallaxLayer>

      {/* =====================================
          BACKGROUND ORBITS
          ===================================== */}

      <ParallaxLayer
        progress={progress}
        velocity={velocity}
        depth={0.42}
        x={-18}
        y={8}
      >
        <div
          className={`${styles.orbit} ${styles.orbitOne}`}
        />

        <div
          className={`${styles.orbit} ${styles.orbitTwo}`}
        />

        <div
          className={`${styles.orbit} ${styles.orbitThree}`}
        />
      </ParallaxLayer>

      {/* =====================================
          SMOKE
          ===================================== */}

      <ParallaxLayer
        progress={progress}
        velocity={velocity}
        depth={0.58}
        x={-6}
        y={-24}
      >
        <div className={styles.smoke}>
          <span />
          <span />
          <span />
        </div>
      </ParallaxLayer>

      {/* =====================================
          BACKGROUND EMBERS
          ===================================== */}

      <ParallaxLayer
        progress={progress}
        velocity={velocity}
        depth={0.85}
        x={16}
        y={-20}
      >
        <div
          className={styles.particles}
        >
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </ParallaxLayer>

      {/* =====================================
          MAIN BURGER
          ===================================== */}

      <ParallaxLayer
        progress={progress}
        velocity={velocity}
        depth={1}
        x={0}
        y={0}
      >
        <div
          className={styles.heroBurger}
          style={{
            transform: `
              translate3d(
                ${cameraX}px,
                ${entranceY + float + cameraY}px,
                0
              )
              scale(
                ${entranceScale}
              )
              rotate(
                ${-4 + floatRotate}deg
              )
            `,
          }}
        >
          {/* Top bun */}
          <div
            className={styles.topBun}
            style={{
              transform: `
                translate3d(
                  0,
                  ${topBunY}px,
                  0
                )
              `,
            }}
          >
            <div
              className={
                styles.bunHighlight
              }
            />

            <div
              className={
                styles.sesameLayer
              }
            >
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>

          {/* Lettuce */}
          <div
            className={styles.lettuce}
            style={{
              transform: `
                translate3d(
                  0,
                  ${lettuceY}px,
                  0
                )
              `,
            }}
          />

          {/* Cheese */}
          <div
            className={styles.cheese}
            style={{
              transform: `
                translate3d(
                  0,
                  ${cheeseY}px,
                  0
                )
              `,
            }}
          />

          {/* Patty */}
          <div
            className={styles.patty}
            style={{
              transform: `
                translate3d(
                  0,
                  ${pattyY}px,
                  0
                )
              `,
            }}
          >
            <div
              className={
                styles.pattyHighlight
              }
            />
          </div>

          {/* Sauce */}
          <div
            className={styles.sauce}
            style={{
              transform: `
                translate3d(
                  0,
                  ${sauceY}px,
                  0
                )
              `,
            }}
          />

          {/* Bottom bun */}
          <div
            className={styles.bottomBun}
            style={{
              transform: `
                translate3d(
                  0,
                  ${bottomBunY}px,
                  0
                )
              `,
            }}
          />
        </div>
      </ParallaxLayer>

      {/* =====================================
          FOREGROUND HEAT
          ===================================== */}

      <ParallaxLayer
        progress={progress}
        velocity={velocity}
        depth={1.4}
        x={20}
        y={-18}
      >
        <div
          className={
            styles.foregroundEmbers
          }
        >
          <i />
          <i />
          <i />
          <i />
        </div>
      </ParallaxLayer>

      {/* =====================================
          GROUND
          ===================================== */}

      <ParallaxLayer
        progress={progress}
        velocity={velocity}
        depth={0.7}
        x={-8}
        y={16}
      >
        <div
          className={
            styles.groundShadow
          }
          style={{
            transform: `
              translateZ(-50px)
              scaleX(
                ${0.82 + reveal * 0.18}
              )
            `,
            opacity:
              0.25 +
              reveal * 0.25,
          }}
        />
      </ParallaxLayer>

      {/* =====================================
          LABEL
          ===================================== */}

      <div className={styles.label}>
        <span>FLAME</span>
        <span>01</span>
      </div>
    </div>
  );
}