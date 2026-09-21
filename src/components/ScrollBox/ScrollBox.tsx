"use client";

import { getScrollBoxAnimation } from "@/animations/scrollBox";
import useScrollProgress from "@/hooks/useScrollProgress";
import useViewportSize from "@/hooks/useViewportSize";

export default function ScrollBox() {
  const progress = useScrollProgress();

  const { width: viewportWidth } = useViewportSize();

  const boxWidth = 100;

  const animation = getScrollBoxAnimation(
    progress,
    viewportWidth,
    boxWidth
  );

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: 0,

        width: `${boxWidth}px`,
        height: `${boxWidth}px`,

        background: "red",

        transform: `
          translate3d(${animation.x}px, -50%, 0)
          rotate(${animation.rotation}deg)
          scale(${animation.scale})
        `,

        opacity: animation.opacity,

        zIndex: 1000,
      }}
    />
  );
}