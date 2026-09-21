"use client";

import { useRef } from "react";

import { storyTransitions } from "@/animations/storyTransitions";

import useElementScrollProgress from "@/hooks/useElementScrollProgress";
import useCameraMotion from "@/hooks/useCameraMotion";

import {
  getActiveScene,
  getSceneProgress,
} from "@/lib/scene";

import { getActiveTransition } from "@/lib/transition";

import SceneLayer from "../SceneLayer/SceneLayer";
import TransitionLayer from "../TransitionLayer/TransitionLayer";
import StoryBackground from "../StoryBackground/StoryBackground";
import StoryNavigation from "../StoryNavigation/StoryNavigation";

import styles from "./StoryExperience.module.css";

export default function StoryExperience({ scenes }: { scenes: import("@/data/flameStory").FlameScene[] }) {
  const containerRef =
    useRef<HTMLDivElement>(null);

  const {
    progress,
    velocity,
  } =
    useElementScrollProgress(
      containerRef
    );

  const camera =
    useCameraMotion(
      progress,
      velocity
    );

  const activeTransition =
    getActiveTransition(
      progress,
      storyTransitions,
      scenes
    );

  const activeScene =
    getActiveScene(
      progress,
      scenes
    );

  const localProgress =
    activeScene
      ? getSceneProgress(
          progress,
          activeScene
        )
      : 0;

  const backgroundScene =
    activeTransition?.to ??
    activeScene;

  const velocityAbs =
    Math.abs(velocity);

  return (
    <section
      ref={containerRef}
      className={styles.experience}
    >
      <StoryNavigation
        scenes={scenes}
        progress={progress}
      />

      <div
        className={styles.sticky}
      >
        <div
          className={styles.world}
          style={{
            transform: `
              translate3d(
                ${camera.x}px,
                ${camera.y}px,
                0
              )
              scale(
                ${camera.scale}
              )
              rotate(
                ${camera.rotation}deg
              )
            `,
          }}
        >
          <StoryBackground
            scene={
              backgroundScene
            }
            progress={
              progress
            }
          />

          <div
            className={styles.scanline}
            style={{
              opacity:
                velocityAbs * 0.35,
            }}
          />

          <div
            className={styles.flash}
            style={{
              opacity:
                velocityAbs * 0.12,
            }}
          />

          {activeTransition ? (
            <TransitionLayer
              progress={progress}
              transition={
                activeTransition.transition
              }
              from={
                activeTransition.from
              }
              to={
                activeTransition.to
              }
              velocity={
                velocity
              }
            />
          ) : activeScene ? (
            <SceneLayer
              scene={activeScene}
              localProgress={
                localProgress
              }
              velocity={
                velocity
              }
            />
          ) : null}
        </div>
      </div>

      <div
        className={styles.progressDebug}
      >
        
      </div>
    </section>
  );
}