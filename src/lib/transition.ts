import type {
  FlameScene,
} from "@/data/flameStory";

import type {
  SceneTransition,
} from "@/animations/transition";

export type ActiveTransition = {
  transition: SceneTransition;
  from: FlameScene;
  to: FlameScene;
};

export function getActiveTransition(
  progress: number,
  transitions: SceneTransition[],
  scenes: FlameScene[]
): ActiveTransition | null {
  for (const transition of transitions) {
    const start =
      transition.range.exit.start;

    const end =
      transition.range.enter.end;

    if (
      progress >= start &&
      progress <= end
    ) {
      const from =
        scenes.find(
          (scene) =>
            scene.id ===
            transition.from
        );

      const to =
        scenes.find(
          (scene) =>
            scene.id ===
            transition.to
        );

      if (!from || !to) {
        return null;
      }

      return {
        transition,
        from,
        to,
      };
    }
  }

  return null;
}