import type { FlameScene } from "@/data/flameStory";
import { clamp, easeOutCubic, lerp } from "@/lib/motion";

export type SceneMotion = {
  text: {
    x: number;
    y: number;
    rotation: number;
    scale: number;
    opacity: number;
    blur: number;
  };
  visual: {
    x: number;
    y: number;
    scale: number;
    rotation: number;
    opacity: number;
    blur: number;
  };
  depth: number;
  intensity: number;
};

function smoothstep(value: number) {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
}

function remap(
  value: number,
  start: number,
  end: number
) {
  if (end <= start) return 0;

  return clamp(
    (value - start) / (end - start)
  );
}

export function getSceneMotion(
  scene: FlameScene,
  progress: number,
  velocity = 0
): SceneMotion {
  const p = clamp(progress);
  const v = clamp(velocity, -1, 1);

  /*
   * The scene is treated like a camera shot.
   *
   * 0.00 → 0.16  enter
   * 0.16 → 0.72  hero
   * 0.72 → 1.00  leave
   */

  const enter = easeOutCubic(
    remap(p, 0, 0.22)
  );

  const exit = smoothstep(
    remap(p, 0.68, 1)
  );

  const visible =
    enter * (1 - exit);

  const velocityAbs = Math.abs(v);

  const baseText = {
    x:
      lerp(-140, 0, enter) +
      v * 24,

    y:
      lerp(110, 0, enter) -
      exit * 100 +
      v * 12,

    rotation:
      lerp(-7, 0, enter) -
      exit * 4 +
      v * 1.2,

    scale:
      lerp(0.82, 1, enter) -
      exit * 0.08,

    opacity: visible,

    blur:
      (1 - enter) * 14 +
      exit * 12 +
      velocityAbs * 2,
  };

  const baseVisual = {
    x:
      lerp(180, 0, enter) +
      v * -32,

    y:
      lerp(90, 0, enter) -
      exit * 140 -
      v * 18,

    scale:
      lerp(0.48, 1, enter) +
      velocityAbs * 0.035 -
      exit * 0.14,

    rotation:
      lerp(12, 0, enter) +
      exit * 7 -
      v * 2,

    opacity: visible,

    blur:
      (1 - enter) * 18 +
      exit * 8 +
      velocityAbs * 1.5,
  };

  switch (scene.visual) {
    case "burger":
      return {
        text: {
          ...baseText,
          x:
            baseText.x -
            Math.sin(p * Math.PI) * 18,
        },

        visual: {
          ...baseVisual,

          x:
            baseVisual.x +
            Math.sin(p * Math.PI * 1.4) * 20,

          scale:
            baseVisual.scale *
            (1 +
              smoothstep(
                remap(p, 0.18, 0.62)
              ) *
                0.18),

          rotation:
            baseVisual.rotation -
            Math.sin(p * Math.PI * 2) * 1.8,
        },

        depth:
          1 +
          smoothstep(
            remap(p, 0.15, 0.65)
          ) *
            0.35,

        intensity:
          0.6 +
          smoothstep(
            remap(p, 0.1, 0.55)
          ) *
            0.4,
      };

    case "heat":
      return {
        text: {
          ...baseText,
          x:
            baseText.x +
            Math.sin(p * Math.PI * 2) * 30,

          y:
            baseText.y -
            smoothstep(
              remap(p, 0.15, 0.7)
            ) *
              25,
        },

        visual: {
          ...baseVisual,

          x:
            baseVisual.x -
            Math.sin(p * Math.PI * 1.5) * 35,

          scale:
            baseVisual.scale *
            (1 +
              smoothstep(
                remap(p, 0.2, 0.8)
              ) *
                0.22),

          rotation:
            baseVisual.rotation +
            Math.sin(p * Math.PI * 2.5) * 3,
        },

        depth: 1.35,

        intensity:
          0.8 +
          smoothstep(
            remap(p, 0.1, 0.7)
          ) *
            0.8,
      };

    case "menu":
      return {
        text: {
          ...baseText,

          x:
            baseText.x -
            smoothstep(
              remap(p, 0.15, 0.75)
            ) *
              35,

          y:
            baseText.y +
            Math.sin(p * Math.PI * 2) * 12,
        },

        visual: {
          ...baseVisual,

          x:
            baseVisual.x +
            smoothstep(
              remap(p, 0.1, 0.8)
            ) *
              30,

          scale:
            baseVisual.scale *
            (1 +
              smoothstep(
                remap(p, 0.25, 0.8)
              ) *
                0.08),
        },

        depth: 1.1,

        intensity:
          0.65 +
          smoothstep(
            remap(p, 0.1, 0.8)
          ) *
            0.35,
      };

    case "cta":
      return {
        text: {
          ...baseText,

          x:
            baseText.x +
            Math.sin(p * Math.PI) * 20,

          y:
            baseText.y -
            smoothstep(
              remap(p, 0.15, 0.7)
            ) *
              40,

          scale:
            baseText.scale +
            smoothstep(
              remap(p, 0.15, 0.8)
            ) *
              0.08,
        },

        visual: {
          ...baseVisual,

          x:
            baseVisual.x,

          y:
            baseVisual.y,

          scale:
            baseVisual.scale *
            (1 +
              smoothstep(
                remap(p, 0.1, 0.75)
              ) *
                0.3),

          rotation:
            baseVisual.rotation -
            Math.sin(p * Math.PI * 2) * 2,
        },

        depth: 1.5,

        intensity:
          0.7 +
          smoothstep(
            remap(p, 0.15, 0.8)
          ) *
            0.3,
      };

    default:
      return {
        text: baseText,
        visual: baseVisual,
        depth: 1,
        intensity: 1,
      };
  }
}