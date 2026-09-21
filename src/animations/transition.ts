import type {
  EasingFunction,
} from "@/lib/easing";

export type TransitionRange = {
  exit: {
    start: number;
    end: number;
  };

  gap: {
    start: number;
    end: number;
  };

  enter: {
    start: number;
    end: number;
  };
};

export type SceneTransition = {
  from: string;
  to: string;

  range: TransitionRange;

  exitEasing: EasingFunction;
  enterEasing: EasingFunction;
};

export type TransitionAnimationState = {
  outgoingOpacity: number;
  incomingOpacity: number;

  outgoingY: number;
  incomingY: number;

  outgoingX: number;
  incomingX: number;

  outgoingScale: number;
  incomingScale: number;

  outgoingRotation: number;
  incomingRotation: number;

  outgoingBlur: number;
  incomingBlur: number;

  gapOpacity: number;

  lightBurst: number;
};

function clamp(
  value: number
): number {
  return Math.min(
    Math.max(value, 0),
    1
  );
}

function normalize(
  value: number,
  start: number,
  end: number
): number {
  if (
    !Number.isFinite(value) ||
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    end <= start
  ) {
    return 0;
  }

  return clamp(
    (value - start) /
      (end - start)
  );
}

export function getTransitionAnimation(
  progress: number,
  transition: SceneTransition
): TransitionAnimationState {
  const {
    exit,
    gap,
    enter,
  } = transition.range;

  /*
  |--------------------------------------------------------------------------
  | BEFORE
  |--------------------------------------------------------------------------
  */

  if (
    progress <
    exit.start
  ) {
    return {
      outgoingOpacity: 1,
      incomingOpacity: 0,

      outgoingY: 0,
      incomingY: 70,

      outgoingX: 0,
      incomingX: 0,

      outgoingScale: 1,
      incomingScale: 0.94,

      outgoingRotation: 0,
      incomingRotation: 0,

      outgoingBlur: 0,
      incomingBlur: 16,

      gapOpacity: 0,

      lightBurst: 0,
    };
  }

  /*
  |--------------------------------------------------------------------------
  | EXIT
  |--------------------------------------------------------------------------
  */

  if (
    progress >= exit.start &&
    progress <
      exit.end
  ) {
    const raw =
      normalize(
        progress,
        exit.start,
        exit.end
      );

    const eased =
      transition.exitEasing(
        raw
      );

    /*
     * Accelerating exit.
     *
     * The product doesn't simply
     * fade away. It moves through
     * depth while slightly rotating.
     */

    return {
      outgoingOpacity:
        1 - eased,

      incomingOpacity: 0,

      outgoingY:
        -120 * eased,

      incomingY: 80,

      outgoingX:
        -22 * eased,

      incomingX: 0,

      outgoingScale:
        1 -
        0.13 * eased,

      incomingScale:
        0.92,

      outgoingRotation:
        -2.5 * eased,

      incomingRotation:
        0,

      outgoingBlur:
        5 * eased,

      incomingBlur:
        18,

      gapOpacity:
        eased * 0.9,

      lightBurst:
        eased *
        (1 - eased) *
        4,
    };
  }

  /*
  |--------------------------------------------------------------------------
  | GAP
  |--------------------------------------------------------------------------
  */

  if (
    progress >= gap.start &&
    progress <
      gap.end
  ) {
    const raw =
      normalize(
        progress,
        gap.start,
        gap.end
      );

    /*
     * Keep the middle mostly dark,
     * but introduce a small light
     * pulse around the center.
     */

    const center =
      Math.sin(
        raw * Math.PI
      );

    return {
      outgoingOpacity: 0,
      incomingOpacity: 0,

      outgoingY: -120,
      incomingY: 75,

      outgoingX: -22,
      incomingX: 0,

      outgoingScale: 0.87,
      incomingScale: 0.92,

      outgoingRotation: -2.5,
      incomingRotation: 0,

      outgoingBlur: 10,
      incomingBlur: 20,

      gapOpacity:
        0.72 +
        center * 0.28,

      lightBurst:
        center,
    };
  }

  /*
  |--------------------------------------------------------------------------
  | ENTER
  |--------------------------------------------------------------------------
  */

  if (
    progress >= enter.start &&
    progress <=
      enter.end
  ) {
    const raw =
      normalize(
        progress,
        enter.start,
        enter.end
      );

    const eased =
      transition.enterEasing(
        raw
      );

    const inverse =
      1 - eased;

    return {
      outgoingOpacity: 0,

      incomingOpacity:
        eased,

      outgoingY: -120,

      incomingY:
        75 * inverse,

      outgoingX: -22,

      incomingX:
        18 * inverse,

      outgoingScale: 0.87,

      incomingScale:
        0.91 +
        0.09 * eased,

      outgoingRotation: -2.5,

      incomingRotation:
        2.2 * inverse,

      outgoingBlur: 10,

      incomingBlur:
        14 * inverse,

      gapOpacity:
        1 -
        eased,

      lightBurst:
        inverse * 0.8,
    };
  }

  /*
  |--------------------------------------------------------------------------
  | AFTER
  |--------------------------------------------------------------------------
  */

  return {
    outgoingOpacity: 0,

    incomingOpacity: 1,

    outgoingY: -120,

    incomingY: 0,

    outgoingX: -22,

    incomingX: 0,

    outgoingScale: 0.87,

    incomingScale: 1,

    outgoingRotation: -2.5,

    incomingRotation: 0,

    outgoingBlur: 0,

    incomingBlur: 0,

    gapOpacity: 0,

    lightBurst: 0,
  };
}