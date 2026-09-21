import { getLocalProgress } from "@/lib/scroll";
import { lerp } from "@/lib/animation";
import { scrollBoxTimeline } from "./timeline";

type ScrollBoxAnimation = {
  x: number;
  rotation: number;
  scale: number;
  opacity: number;
};

export function getScrollBoxAnimation(
  progress: number,
  viewportWidth: number,
  boxWidth: number
): ScrollBoxAnimation {
  // =========================
  // Chapter 1 — Move
  // =========================

  const moveProgress = getLocalProgress(
    progress,
    scrollBoxTimeline.move.start,
    scrollBoxTimeline.move.end
  );

  const easedMoveProgress =
    scrollBoxTimeline.move.easing(moveProgress);

  const maxX = Math.max(
    viewportWidth - boxWidth,
    0
  );

  const x = lerp(
    0,
    maxX,
    easedMoveProgress
  );


  // =========================
  // Chapter 2 — Rotate
  // =========================

  const rotateProgress = getLocalProgress(
    progress,
    scrollBoxTimeline.rotate.start,
    scrollBoxTimeline.rotate.end
  );

  const easedRotateProgress =
    scrollBoxTimeline.rotate.easing(
      rotateProgress
    );

  const rotation = lerp(
    0,
    360,
    easedRotateProgress
  );


  // =========================
  // Chapter 3 — Scale
  // =========================

  const scaleProgress = getLocalProgress(
    progress,
    scrollBoxTimeline.scale.start,
    scrollBoxTimeline.scale.end
  );

  const easedScaleProgress =
    scrollBoxTimeline.scale.easing(
      scaleProgress
    );

  const scale = lerp(
    1,
    3,
    easedScaleProgress
  );


  // =========================
  // Chapter 4 — Fade
  // =========================

  const fadeProgress = getLocalProgress(
    progress,
    scrollBoxTimeline.fade.start,
    scrollBoxTimeline.fade.end
  );

  const easedFadeProgress =
    scrollBoxTimeline.fade.easing(
      fadeProgress
    );

  const opacity = lerp(
    1,
    0,
    easedFadeProgress
  );


  return {
    x,
    rotation,
    scale,
    opacity,
  };
}