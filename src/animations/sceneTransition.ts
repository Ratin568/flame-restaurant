import {
  easeInOutQuad,
} from "@/lib/easing";

import { getLocalProgress } from "@/lib/scroll";

export type SceneTransitionState = {
  opacity: number;
  scale: number;
};

export function getSceneTransition(
  progress: number,
  sceneStart: number,
  sceneEnd: number
): SceneTransitionState {
  const localProgress = getLocalProgress(
    progress,
    sceneStart,
    sceneEnd
  );

  const transitionSize = 0.2;

  const enterProgress = Math.min(
    localProgress / transitionSize,
    1
  );

  const exitProgress = Math.min(
    (1 - localProgress) / transitionSize,
    1
  );

  const opacity = Math.min(
    easeInOutQuad(enterProgress),
    easeInOutQuad(exitProgress)
  );

  const scale =
    0.95 + opacity * 0.05;

  return {
    opacity,
    scale,
  };
}