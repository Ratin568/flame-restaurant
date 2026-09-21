import {
  clamp,
  easeOutCubic,
  lerp,
} from "@/lib/motion";

export type ParallaxMotion = {
  x: number;
  y: number;
  scale: number;
  rotation: number;
};

export function getParallaxMotion(
  progress: number,
  velocity = 0
): ParallaxMotion {
  const p = clamp(progress);
  const v = clamp(velocity, -0.65, 0.65);

  const entrance = easeOutCubic(
    clamp(p / 0.28)
  );

  return {
    x: lerp(18, 0, entrance) + v * 8,
    y: lerp(24, 0, entrance) - v * 12,
    scale:
      lerp(0.94, 1, entrance) +
      Math.abs(v) * 0.012,
    rotation:
      lerp(1.5, 0, entrance) -
      v * 0.65,
  };
}

export function getParallaxLayerMotion(
  progress: number,
  velocity: number,
  depth: number,
  x: number,
  y: number
): {
  x: number;
  y: number;
} {
  const p = clamp(progress);
  const v = clamp(velocity, -0.65, 0.65);

  /*
   * Convert scene progress into a
   * centered camera position.
   *
   * -1 = beginning
   *  0 = center
   * +1 = end
   */
  const centered =
    (p - 0.5) * 2;

  /*
   * Scroll movement.
   *
   * Deeper layers move less.
   * Foreground layers move more.
   */
  const scrollX =
    centered * x * depth;

  const scrollY =
    centered * y * depth;

  /*
   * Velocity gives the layer a subtle
   * camera-follow effect while scrolling.
   */
  const velocityX =
    v * 14 * depth;

  const velocityY =
    -v * 18 * depth;

  return {
    x: scrollX + velocityX,
    y: scrollY + velocityY,
  };
}

