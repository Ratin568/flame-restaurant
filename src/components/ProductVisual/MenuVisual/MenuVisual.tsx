"use client";

import ParallaxLayer from "../../ParallaxLayer/ParallaxLayer";

import styles from "./MenuVisual.module.css";

type MenuVisualProps = {
  progress?: number;
  velocity?: number;
};

const items = [
  {
    number: "01",
    name: "BURGER",
    description: "SMOKED BEEF",
    type: "burger",
  },
  {
    number: "02",
    name: "FRIES",
    description: "SEA SALT",
    type: "fries",
  },
  {
    number: "03",
    name: "SHAKE",
    description: "VANILLA",
    type: "shake",
  },
] as const;

export default function MenuVisual({
  progress = 0.5,
  velocity = 0,
}: MenuVisualProps) {
  return (
    <div
      className={styles.visual}
      aria-hidden="true"
    >
      {/* Menu header */}
      <ParallaxLayer
        progress={progress}
        velocity={velocity}
        depth={0.35}
        x={-8}
        y={-10}
      >
        <div className={styles.header}>
          <span>FLAME MENU</span>
          <span>03 / 03</span>
        </div>
      </ParallaxLayer>

      {/* Main menu */}
      <ParallaxLayer
        progress={progress}
        velocity={velocity}
        depth={0.75}
        x={0}
        y={0}
      >
        <div className={styles.menu}>
          {items.map((item) => (
            <div
              key={item.number}
              className={styles.item}
            >
              <div className={styles.number}>
                {item.number}
              </div>

              <div
                className={`${styles.product} ${styles[item.type]}`}
              >
                {item.type === "burger" && (
                  <div className={styles.miniBurger}>
                    <div
                      className={styles.miniBun}
                    />
                    <div
                      className={styles.miniCheese}
                    />
                    <div
                      className={styles.miniPatty}
                    />
                    <div
                      className={styles.miniBottom}
                    />
                  </div>
                )}

                {item.type === "fries" && (
                  <div className={styles.fries}>
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                )}

                {item.type === "shake" && (
                  <div className={styles.shake}>
                    <div
                      className={
                        styles.shakeCream
                      }
                    />
                    <div
                      className={
                        styles.shakeCup
                      }
                    />
                    <div
                      className={
                        styles.shakeStraw
                      }
                    />
                  </div>
                )}
              </div>

              <div className={styles.info}>
                <strong>
                  {item.name}
                </strong>

                <span>
                  {item.description}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ParallaxLayer>

      {/* Foreground details */}
      <ParallaxLayer
        progress={progress}
        velocity={velocity}
        depth={1.25}
        x={14}
        y={-18}
      >
        <div
          className={styles.footer}
        >
          <span>
            SCROLL TO EXPLORE
          </span>

          <span
            className={styles.line}
          />

          <span>
            FLAME / 2026
          </span>
        </div>
      </ParallaxLayer>
    </div>
  );
}