export type MotionTransform = {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
};

export function clamp(
  value: number,
  min = 0,
  max = 1
) {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(
    Math.max(value, min),
    max
  );
}

export function remap(
  value: number,
  fromStart: number,
  fromEnd: number,
  toStart: number,
  toEnd: number
) {
  if (fromEnd === fromStart) {
    return toStart;
  }

  const progress = clamp(
    (value - fromStart) /
      (fromEnd - fromStart)
  );

  return (
    toStart +
    (toEnd - toStart) *
      progress
  );
}

export function lerp(
  from: number,
  to: number,
  progress: number
) {
  return (
    from +
    (to - from) *
      clamp(progress)
  );
}

export function easeOutCubic(
  progress: number
) {
  const p = clamp(progress);

  return (
    1 -
    Math.pow(1 - p, 3)
  );
}