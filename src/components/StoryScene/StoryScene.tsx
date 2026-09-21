"use client";

import type { FlameScene } from "@/data/flameStory";

import { getSceneMotion } from "@/animations/sceneMotion";
import { getParallaxMotion } from "@/animations/parallax";

import SceneText from "../SceneText/SceneText";
import ProductVisual from "../ProductVisual/ProductVisual";

import styles from "./StoryScene.module.css";

type StorySceneProps = {
  scene: FlameScene;
  localProgress: number;
  velocity?: number;
};

export default function StoryScene({
  scene,
  localProgress,
  velocity = 0,
}: StorySceneProps) {
  const motion = getSceneMotion(
    scene,
    localProgress,
    velocity
  );

  const parallax = getParallaxMotion(
    localProgress,
    velocity
  );

  const intensity =
    motion.intensity;

  return (
    <section
      className={styles.scene}
      data-scene={scene.visual}
      style={{
        ["--intensity" as string]:
          intensity,
      }}
    >
      <div className={styles.depthField}>
        <div className={styles.lightBeam} />
        <div className={styles.lightBeamTwo} />

        <div className={styles.noise} />

      <div className={`${styles.ring} ${styles.ringOne}`} />
      <div className={`${styles.ring} ${styles.ringTwo}`} />
      <div className={`${styles.ring} ${styles.ringThree}`} />
      </div>

      <div className={styles.content}>
        <div
          className={styles.textWrapper}
          style={{
            opacity:
              motion.text.opacity,

            filter:
              `blur(${motion.text.blur}px)`,

            transform: `
              translate3d(
                ${motion.text.x}px,
                ${motion.text.y}px,
                0
              )
              rotate(
                ${motion.text.rotation}deg
              )
              scale(
                ${motion.text.scale}
              )
            `,
          }}
        >
          <div className={styles.textGhost}>
            {scene.title}
          </div>

          <SceneText
            chapter={scene.chapter}
            title={scene.title}
            description={scene.description}
          />
        </div>

        <div
          className={styles.visualWrapper}
          style={{
            opacity:
              motion.visual.opacity,

            filter:
              `blur(${motion.visual.blur}px)`,

            transform: `
              translate3d(
                ${
                  motion.visual.x +
                  parallax.x
                }px,
                ${
                  motion.visual.y +
                  parallax.y
                }px,
                0
              )
              scale(
                ${
                  motion.visual.scale *
                  parallax.scale
                }
              )
              rotate(
                ${
                  motion.visual.rotation +
                  parallax.rotation
                }deg
              )
              translateZ(
                ${motion.depth * 80}px
              )
            `,
          }}
        >
          <div className={styles.visualGlow} />

          <ProductVisual
            type={scene.visual}
            progress={localProgress}
            velocity={velocity}
          />
        </div>
      </div>

      <div className={styles.edgeText}>
        <span>FLAME</span>
        <span>EST. 2026</span>
      </div>
    </section>
  );
}