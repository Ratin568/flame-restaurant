"use client";

import {motion} from "framer-motion";

type FloatingPathsProps = {
  position: number;
};

function FloatingPaths({position}: FloatingPathsProps) {
  const paths = Array.from({length: 24}, (_, i) => {
    const offset = i * 5 * position;
    const vertical = i * 6;

    return {
      id: i,
      d: `M-${380 - offset} -${189 + vertical}C-${
        380 - offset
      } -${189 + vertical} -${312 - offset} ${216 - vertical} ${
        152 - offset
      } ${343 - vertical}C${616 - offset} ${470 - vertical} ${
        684 - offset
      } ${875 - vertical} ${684 - offset} ${875 - vertical}`,
      width: 0.5 + i * 0.025,
    };
  });

  return (
    <div className="pointer-events-none absolute inset-0">
      <svg
        className="h-full w-full text-slate-950 dark:text-white"
        viewBox="0 0 696 316"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeLinecap="round"
            initial={{
              opacity: 0.12,
            }}
            animate={{
              opacity: [0.08, 0.2, 0.08],
              x: position * 18,
            }}
            transition={{
              opacity: {
                duration: 7 + (path.id % 5),
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
              },
              x: {
                duration: 18 + (path.id % 6),
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
              },
            }}
          />
        ))}
      </svg>
    </div>
  );
}

export function BackgroundPaths() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-white dark:bg-neutral-950">
      <FloatingPaths position={1} />
      <FloatingPaths position={-1} />

      {/* Very subtle center glow */}
      <div
        className="
          absolute inset-0
          bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.7),transparent_45%)]
          dark:bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.045),transparent_45%)]
        "
      />

      {/* Soft edge fade */}
      <div
        className="
          absolute inset-0
          bg-gradient-to-b
          from-white/20
          via-transparent
          to-white/30
          dark:from-neutral-950/20
          dark:via-transparent
          dark:to-neutral-950/40
        "
      />
    </div>
  );
}