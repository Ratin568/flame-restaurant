"use client";

import type {
  CSSProperties,
  ReactNode,
} from "react";

import {
  getParallaxLayerMotion,
} from "@/animations/parallax";

import styles from "./ParallaxLayer.module.css";

type ParallaxLayerProps = {
  children: ReactNode;

  progress?: number;
  velocity?: number;

  depth?: number;

  x?: number;
  y?: number;
};

export default function ParallaxLayer({
  children,
  progress = 0.5,
  velocity = 0,
  depth = 1,
  x = 20,
  y = 20,
}: ParallaxLayerProps) {
  const motion =
    getParallaxLayerMotion(
      progress,
      velocity,
      depth,
      x,
      y
    );

  const style = {
    "--x": `${motion.x}px`,
    "--y": `${motion.y}px`,
  } as CSSProperties;

  return (
    <div
      className={styles.layer}
      style={style}
    >
      {children}
    </div>
  );
}
