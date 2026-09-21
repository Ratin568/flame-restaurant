"use client";

import { useEffect, useRef, useState } from "react";

export default function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  const targetProgress = useRef(0);
  const currentProgress = useRef(0);

  useEffect(() => {
    let animationFrame: number;

    const updateTarget = () => {
      const maxScroll =
        document.documentElement.scrollHeight -
        window.innerHeight;

      if (maxScroll <= 0) {
        targetProgress.current = 0;
        return;
      }

      const rawProgress =
        window.scrollY / maxScroll;

      targetProgress.current = Math.min(
        Math.max(rawProgress, 0),
        1
      );
    };

    const animate = () => {
      const current =
        currentProgress.current;

      const target =
        targetProgress.current;

      /*
       * سرعت نزدیک شدن به هدف
       *
       * عدد کمتر = نرم‌تر و کندتر
       * عدد بیشتر = سریع‌تر و responsive‌تر
       */
      const smoothing = 0.08;

      const next =
        current +
        (target - current) * smoothing;

      currentProgress.current = next;

      setProgress(next);

      animationFrame =
        requestAnimationFrame(animate);
    };

    updateTarget();

    window.addEventListener(
      "scroll",
      updateTarget,
      { passive: true }
    );

    animationFrame =
      requestAnimationFrame(animate);

    return () => {
      window.removeEventListener(
        "scroll",
        updateTarget
      );

      cancelAnimationFrame(
        animationFrame
      );
    };
  }, []);

  return progress;
}