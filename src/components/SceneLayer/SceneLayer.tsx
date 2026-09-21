"use client";

import type {
  FlameScene,
} from "@/data/flameStory";

import StoryScene from "../StoryScene/StoryScene";

type SceneLayerProps = {
  scene: FlameScene;
  localProgress: number;
  velocity?: number;
};

export default function SceneLayer({
  scene,
  localProgress,
  velocity = 0,
}: SceneLayerProps) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
      }}
    >
      <StoryScene
        scene={scene}
        localProgress={
          localProgress
        }
        velocity={
          velocity
        }
      />
    </div>
  );
}