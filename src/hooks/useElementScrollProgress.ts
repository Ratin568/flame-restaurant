"use client";

import {
  RefObject,
  useEffect,
  useRef,
  useState,
} from "react";

type ScrollState = {
  progress: number;
  velocity: number;
};

export default function useElementScrollProgress(
  ref: RefObject<HTMLElement | null>
) {
  const [state, setState] =
    useState<ScrollState>({
      progress: 0,
      velocity: 0,
    });

  const lastProgress =
    useRef(0);

  const velocity =
    useRef(0);

  const frame =
    useRef<number | null>(null);

  const update =
    () => {
      frame.current = null;

      const element =
        ref.current;

      if (!element) {
        return;
      }

      const rect =
        element.getBoundingClientRect();

      const scrollableDistance =
        element.offsetHeight -
        window.innerHeight;

      if (
        scrollableDistance <= 0
      ) {
        setState({
          progress: 0,
          velocity: 0,
        });

        return;
      }

      const travelled =
        -rect.top;

      const progress =
        Math.min(
          Math.max(
            travelled /
              scrollableDistance,
            0
          ),
          1
        );

      /*
       * Measure velocity from progress
       * instead of raw scroll pixels.
       *
       * This keeps velocity in the exact
       * same coordinate system as the
       * animation itself.
       */
      const delta =
        progress -
        lastProgress.current;

      /*
       * Strong smoothing prevents tiny
       * browser scroll fluctuations from
       * reaching the visual layer.
       */
      const targetVelocity =
        Math.max(
          -1,
          Math.min(
            1,
            delta * 18
          )
        );

      velocity.current =
        velocity.current * 0.88 +
        targetVelocity * 0.12;

      /*
       * Kill extremely small values.
       * This is important because otherwise
       * the transform can constantly move
       * by fractions of a pixel.
       */
      if (
        Math.abs(
          velocity.current
        ) < 0.008
      ) {
        velocity.current = 0;
      }

      lastProgress.current =
        progress;

      setState({
        progress,
        velocity:
          velocity.current,
      });
    };

  useEffect(() => {
    const requestUpdate =
      () => {
        if (
          frame.current !== null
        ) {
          return;
        }

        frame.current =
          requestAnimationFrame(
            update
          );
      };

    update();

    window.addEventListener(
      "scroll",
      requestUpdate,
      {
        passive: true,
      }
    );

    window.addEventListener(
      "resize",
      requestUpdate
    );

    return () => {
      window.removeEventListener(
        "scroll",
        requestUpdate
      );

      window.removeEventListener(
        "resize",
        requestUpdate
      );

      if (
        frame.current !== null
      ) {
        cancelAnimationFrame(
          frame.current
        );
      }
    };
  }, [ref]);

  return state;
}