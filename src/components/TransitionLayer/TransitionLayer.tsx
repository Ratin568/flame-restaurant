"use client";

import type { FlameScene } from "@/data/flameStory";

import {
  getTransitionAnimation,
  type SceneTransition,
} from "@/animations/transition";

import StoryScene from "../StoryScene/StoryScene";

type TransitionLayerProps = {
  progress: number;
  transition: SceneTransition;
  from: FlameScene;
  to: FlameScene;
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

function easeInCubic(value: number) {
  const t = clamp(value);
  return t * t * t;
}

export default function TransitionLayer({
  progress,
  transition,
  from,
  to,
  velocity = 0,
}: TransitionLayerProps) {
  const animation =
    getTransitionAnimation(
      progress,
      transition
    );

  const range =
    transition.range;

  const exitProgress = clamp(
    (progress - range.exit.start) /
      (range.exit.end - range.exit.start)
  );

  const gapProgress = clamp(
    (progress - range.gap.start) /
      (range.gap.end - range.gap.start)
  );

  const enterProgress = clamp(
    (progress - range.enter.start) /
      (range.enter.end - range.enter.start)
  );

  const velocityAbs =
    Math.abs(
      clamp(velocity, -1, 1)
    );

  const impact =
    Math.max(
      exitProgress,
      enterProgress
    );

  const distortion =
    velocityAbs * 18 +
    impact * 8;

  const outgoingRotation =
    animation.outgoingY * 0.012;

  const incomingRotation =
    -animation.incomingY * 0.012;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 50,
        pointerEvents: "none",
        perspective: "1800px",
        overflow: "hidden",
      }}
    >
      {/* OUTGOING */}
      <div
        style={{
          position: "absolute",
          inset: 0,

          opacity:
            animation.outgoingOpacity,

          transform: `
            translate3d(
              ${animation.outgoingX}px,
              ${animation.outgoingY}px,
              0
            )
            rotate(
              ${animation.outgoingRotation}deg
            )
            scale(
              ${animation.outgoingScale}
            )
          `,

          filter: `
            blur(
              ${
                animation.outgoingBlur +
                distortion * 0.12
              }px
            )
          `,

          transformOrigin:
            "center center",

          willChange:
            "transform, opacity, filter",

          pointerEvents:
            "none",
        }}
      >
        <StoryScene
          scene={from}
          localProgress={1}
          velocity={velocity}
        />
      </div>

      {/* CINEMATIC WIPE */}
      <div
        style={{
          position: "absolute",
          inset: "-20%",

          zIndex: 30,

          pointerEvents:
            "none",

          opacity:
            easeInCubic(
              gapProgress
            ) *
            0.95,

          background: `
            radial-gradient(
              ellipse at center,
              rgba(255, 90, 20, 0.18),
              rgba(0, 0, 0, 0.92) 55%,
              #000 78%
            )
          `,

          transform: `
            scale(
              ${1 + gapProgress * 0.12}
            )
          `,

          filter:
            `blur(${gapProgress * 12}px)`,

          willChange:
            "opacity, transform, filter",
        }}
      />

      {/* LIGHT IMPACT */}
      <div
        style={{
          position: "absolute",
          inset: "-30%",

          zIndex: 35,

          pointerEvents:
            "none",

          opacity:
            velocityAbs *
              0.18 +
            impact * 0.08,

          background: `
            radial-gradient(
              circle at 50% 50%,
              rgba(255, 185, 100, 0.45),
              rgba(255, 70, 10, 0.12) 22%,
              transparent 58%
            )
          `,

          mixBlendMode:
            "screen",

          filter:
            `blur(${20 + velocityAbs * 20}px)`,
        }}
      />

      {/* INCOMING */}
      <div
        style={{
          position: "absolute",
          inset: 0,

          zIndex: 40,

          opacity:
            animation.incomingOpacity,

          transform: `
            translate3d(
              ${animation.incomingX}px,
              ${animation.incomingY}px,
              0
            )
            rotate(
              ${animation.incomingRotation}deg
            )
            scale(
              ${animation.incomingScale}
            )
          `,

          filter: `
            blur(
              ${
                animation.incomingBlur +
                distortion * 0.08
              }px
            )
          `,

          transformOrigin:
            "center center",

          willChange:
            "transform, opacity, filter",

          pointerEvents:
            "none",
        }}
      >
        <StoryScene
          scene={to}
          localProgress={0}
          velocity={velocity}
        />
      </div>

      {/* FINAL BLACK GAP */}
      <div
        style={{
          position: "absolute",
          inset: 0,

          zIndex: 60,

          background:
            "rgba(0,0,0,0.82)",

          opacity:
            animation.gapOpacity *
            0.35,

          pointerEvents:
            "none",
        }}
      />
    </div>
  );
}