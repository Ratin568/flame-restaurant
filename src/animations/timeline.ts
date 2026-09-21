import type { EasingFunction } from "@/lib/easing";
import {
  easeInOutQuad,
  easeInQuad,
  easeOutQuad,
} from "@/lib/easing";

export type AnimationRange = {
  start: number;
  end: number;
  easing: EasingFunction;
};

export type ScrollBoxTimeline = {
  move: AnimationRange;
  rotate: AnimationRange;
  scale: AnimationRange;
  fade: AnimationRange;
};

export const scrollBoxTimeline: ScrollBoxTimeline = {
  move: {
    start: 0,
    end: 0.25,
    easing: easeInOutQuad,
  },

  rotate: {
    start: 0.25,
    end: 0.5,
    easing: easeOutQuad,
  },

  scale: {
    start: 0.5,
    end: 0.75,
    easing: easeInQuad,
  },

  fade: {
    start: 0.75,
    end: 1,
    easing: easeOutQuad,
  },
};