import {
  clamp,
  lerp,
} from "@/lib/motion";

export type CameraMotion = {
  x: number;
  y: number;
  scale: number;
  rotation: number;
};

export function getCameraMotion(
  progress: number,
  velocity = 0
): CameraMotion {
  const p =
    clamp(progress);

  const v =
    clamp(
      velocity,
      -0.65,
      0.65
    );

  /*
   * Very subtle cinematic drift
   * across the complete story.
   */
  const cameraX =
    lerp(
      -6,
      6,
      p
    );

  const cameraY =
    lerp(
      5,
      -5,
      p
    );

  /*
   * Main inertia response.
   *
   * Fast downward scrolling pushes
   * the camera upward.
   *
   * Fast upward scrolling pushes
   * it downward.
   */
  const velocityX =
    v * 24;

  const velocityY =
    -v * 34;

  /*
   * Camera slightly pulls back
   * while moving quickly.
   */
  const velocityScale =
    Math.abs(v) * 0.035;

  /*
   * Tiny rotational response.
   */
  const velocityRotation =
    -v * 0.8;

  return {
    x:
      cameraX +
      velocityX,

    y:
      cameraY +
      velocityY,

    scale:
      1 +
      velocityScale,

    rotation:
      velocityRotation,
  };
}