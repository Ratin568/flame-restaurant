"use client";

import type { FlameScene } from "@/data/flameStory";

import styles from "./StoryBackground.module.css";

type StoryBackgroundProps = {
  scene: FlameScene | null;
  progress: number;
};

function clamp(
  value: number
) {
  return Math.min(
    Math.max(value, 0),
    1
  );
}

export default function StoryBackground({
  scene,
  progress,
}: StoryBackgroundProps) {
  const sceneType =
    scene?.visual ??
    "burger";

  const p =
    clamp(progress);

  const pulse =
    0.5 +
    Math.sin(
      p * Math.PI * 8
    ) *
      0.5;

  const depth =
    p * 100;

  return (
    <div
      className={
        styles.background
      }
      data-scene={
        sceneType
      }
      style={{
        ["--progress" as string]:
          p,

        ["--pulse" as string]:
          pulse,

        ["--depth" as string]:
          `${depth}px`,
      }}
      aria-hidden="true"
    >
      <div
        className={
          styles.aurora
        }
      />

      <div
        className={
          styles.gradient
        }
      />

      <div
        className={
          styles.core
        }
      />

      <div
        className={
          styles.grid
        }
      />

      <div
        className={
          styles.noise
        }
      />

      <div
        className={
          styles.vignette
        }
      />

      <div
        className={
          styles.edgeGlow
        }
      />
    </div>
  );
}