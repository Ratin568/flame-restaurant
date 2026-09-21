"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

type VirtualScrollOptions = {
  smoothing?: number;
  wheelMultiplier?: number;
};

type VirtualScrollState = {
  position: number;
  progress: number;
  velocity: number;
};

export default function useVirtualScroll({
  smoothing = 0.08,
  wheelMultiplier = 1,
}: VirtualScrollOptions = {}): VirtualScrollState {
  const [state, setState] =
    useState<VirtualScrollState>({
      position: 0,
      progress: 0,
      velocity: 0,
    });

  const current = useRef(0);
  const target = useRef(0);
  const previous = useRef(0);

  useEffect(() => {
    let animationFrame: number;

    const getMaxScroll = () => {
      return Math.max(
        document.documentElement.scrollHeight -
          window.innerHeight,
        1
      );
    };

    const syncWithNativeScroll = () => {
      const maxScroll = getMaxScroll();

      current.current = Math.min(
        Math.max(window.scrollY, 0),
        maxScroll
      );

      target.current = current.current;
      previous.current = current.current;
    };

    const handleWheel = (event: WheelEvent) => {
      const maxScroll = getMaxScroll();

      target.current +=
        event.deltaY * wheelMultiplier;

      target.current = Math.min(
        Math.max(target.current, 0),
        maxScroll
      );
    };

    const animate = () => {
      const distance =
        target.current - current.current;

      current.current +=
        distance * smoothing;

      const velocity =
        current.current -
        previous.current;

      previous.current =
        current.current;

      const maxScroll = getMaxScroll();

      const progress =
        current.current / maxScroll;

      setState({
        position: current.current,
        progress: Math.min(
          Math.max(progress, 0),
          1
        ),
        velocity,
      });

      animationFrame =
        requestAnimationFrame(animate);
    };

    syncWithNativeScroll();

    window.addEventListener(
      "scroll",
      syncWithNativeScroll,
      { passive: true }
    );

    window.addEventListener(
      "wheel",
      handleWheel,
      { passive: true }
    );

    animationFrame =
      requestAnimationFrame(animate);

    return () => {
      window.removeEventListener(
        "scroll",
        syncWithNativeScroll
      );

      window.removeEventListener(
        "wheel",
        handleWheel
      );

      cancelAnimationFrame(
        animationFrame
      );
    };
  }, [smoothing, wheelMultiplier]);

  return state;
}