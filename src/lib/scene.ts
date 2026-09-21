import type { FlameScene } from "@/data/flameStory";

import { getLocalProgress } from "./scroll";

export function getActiveScene(
  progress: number,
  scenes: FlameScene[]
): FlameScene | null {
  if (
    !Number.isFinite(progress) ||
    scenes.length === 0
  ) {
    return null;
  }

  return (
    scenes.find(
      (scene, index) => {
        const isLast =
          index === scenes.length - 1;

        return (
          progress >= scene.start &&
          (
            progress < scene.end ||
            (
              isLast &&
              progress <= scene.end
            )
          )
        );
      }
    ) ?? null
  );
}

export function getSceneProgress(
  progress: number,
  scene: FlameScene
): number {
  return getLocalProgress(
    progress,
    scene.start,
    scene.end
  );
}