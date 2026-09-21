export type EasingFunction = (t: number) => number;

/**
 * Linear
 */
export const linear: EasingFunction = (t) => {
  return t;
};

/**
 * Quadratic ease-in
 */
export const easeInQuad: EasingFunction = (t) => {
  return t * t;
};

/**
 * Quadratic ease-out
 */
export const easeOutQuad: EasingFunction = (t) => {
  return t * (2 - t);
};

/**
 * Quadratic ease-in-out
 */
export const easeInOutQuad: EasingFunction = (t) => {
  return t < 0.5
    ? 2 * t * t
    : 1 - Math.pow(-2 * t + 2, 2) / 2;
};

/**
 * Cubic ease-in
 */
export const easeInCubic: EasingFunction = (t) => {
  return t * t * t;
};

/**
 * Cubic ease-out
 */
export const easeOutCubic: EasingFunction = (t) => {
  return 1 - Math.pow(1 - t, 3);
};

/**
 * Cubic ease-in-out
 */
export const easeInOutCubic: EasingFunction = (t) => {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
};