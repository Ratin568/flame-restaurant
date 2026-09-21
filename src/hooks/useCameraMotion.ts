"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  getCameraMotion,
  type CameraMotion,
} from "@/animations/camera";

const INITIAL_MOTION: CameraMotion = {
  x: 0,
  y: 0,
  scale: 1,
  rotation: 0,
};

export default function useCameraMotion(
  progress: number,
  velocity: number
) {
  const targetVelocity =
    useRef(0);

  const currentVelocity =
    useRef(0);

  const frame =
    useRef<number | null>(null);

  const [motion, setMotion] =
    useState<CameraMotion>(
      INITIAL_MOTION
    );

  useEffect(() => {
    targetVelocity.current =
      velocity;

    if (frame.current !== null) {
      return;
    }

    const animate = () => {
      /*
       * Smoothly approach the current
       * scroll velocity.
       */
      currentVelocity.current +=
        (
          targetVelocity.current -
          currentVelocity.current
        ) * 0.12;

      /*
       * Once the user stops scrolling,
       * slowly decay the remaining momentum.
       */
      if (
        Math.abs(
          targetVelocity.current
        ) < 0.001
      ) {
        currentVelocity.current *=
          0.91;
      }

      const nextMotion =
        getCameraMotion(
          progress,
          currentVelocity.current
        );

      setMotion(
        nextMotion
      );

      const shouldContinue =
        Math.abs(
          currentVelocity.current
        ) > 0.001 ||
        Math.abs(
          targetVelocity.current
        ) > 0.001;

      if (shouldContinue) {
        frame.current =
          requestAnimationFrame(
            animate
          );
      } else {
        frame.current = null;

        currentVelocity.current =
          0;

        setMotion(
          getCameraMotion(
            progress,
            0
          )
        );
      }
    };

    frame.current =
      requestAnimationFrame(
        animate
      );

    return () => {
      if (
        frame.current !== null
      ) {
        cancelAnimationFrame(
          frame.current
        );

        frame.current = null;
      }
    };
  }, [velocity, progress]);

  return motion;
}