"use client";

import type { ReactNode } from "react";

import styles from "./VisualAtmosphere.module.css";

type VisualAtmosphereProps = {
  type:
    | "burger"
    | "heat"
    | "menu"
    | "cta";

  children: ReactNode;
};

export default function VisualAtmosphere({
  type,
  children,
}: VisualAtmosphereProps) {
  return (
    <div
      className={styles.atmosphere}
      data-type={type}
    >
      <div className={styles.vignette} />

      <div className={styles.ambient} />

      <div className={styles.grid} />

      <div className={styles.rings}>
        <span />
        <span />
        <span />
      </div>

      <div className={styles.particles}>
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>

      <div className={styles.visual}>
        {children}
      </div>

      <div className={styles.grain} />
    </div>
  );
}