'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';

import Button3D from '@/components/ui/button-3d';

interface NotFoundGlitchProps {
  homeHref: string;
  homeLabel: string;
  browseHref: string;
  browseLabel: string;
  title: string;
  description: string;
}

function ScrambleText({
  text,
  active,
}: {
  text: string;
  active: boolean;
}) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (!active) {
      return;
    }

    let frame = 0;
    const totalFrames = Math.max(12, text.length * 3);

    const interval = window.setInterval(() => {
      frame += 1;

      const progress = frame / totalFrames;

      if (progress >= 1) {
        setDisplay(text);
        window.clearInterval(interval);
        return;
      }

      const next = text
        .split('')
        .map((char, index) => {
          if (char === ' ') return ' ';

          const revealPoint = index / Math.max(text.length, 1);

          if (progress > revealPoint + 0.18) {
            return char;
          }

          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');

      setDisplay(next);
    }, 45);

    return () => {
      window.clearInterval(interval);
    };
  }, [active, text]);

  return (
    <span aria-hidden="true">
      {active ? display : text}
    </span>
  );
}

export function NotFoundGlitch({
  homeHref,
  homeLabel,
  browseHref,
  browseLabel,
  title,
  description,
}: NotFoundGlitchProps) {
  const shouldReduceMotion = useReducedMotion();
  const [glitching, setGlitching] = useState(false);

  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, index) => ({
        id: index,
        left: `${(index * 37) % 100}%`,
        top: `${(index * 61) % 100}%`,
        delay: (index % 6) * 0.35,
        duration: 4 + (index % 5),
      })),
    [],
  );

  useEffect(() => {
    if (shouldReduceMotion) {
      return;
    }

    const initialTimeout = window.setTimeout(() => {
      setGlitching(true);
    }, 700);

    const interval = window.setInterval(() => {
      setGlitching(true);

      window.setTimeout(() => {
        setGlitching(false);
      }, 280);
    }, 5200);

    return () => {
      window.clearTimeout(initialTimeout);
      window.clearInterval(interval);
    };
  }, [shouldReduceMotion]);

  const isGlitching = shouldReduceMotion ? false : glitching;

  return (
    <section className="relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-[#090909] px-6 py-20 text-[#f4f0e8]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute left-1/2 top-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.025] blur-[120px]" />

        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(244,240,232,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(244,240,232,0.8)_1px,transparent_1px)] [background-size:80px_80px]" />

        {particles.map((particle) => (
          <motion.span
            key={particle.id}
            className="absolute h-px w-px rounded-full bg-[#f4f0e8]"
            style={{
              left: particle.left,
              top: particle.top,
            }}
            initial={{
              opacity: 0,
              scale: 0,
            }}
            animate={
              shouldReduceMotion
                ? {
                    opacity: 0,
                    scale: 0,
                  }
                : {
                    opacity: [0, 0.35, 0],
                    scale: [0.5, 1.5, 0.5],
                    y: [0, -18, 0],
                  }
            }
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center text-center">
        <motion.div
          initial={
            shouldReduceMotion
              ? undefined
              : {
                  opacity: 0,
                  y: 20,
                }
          }
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
            ease: 'easeOut',
          }}
          className="flex flex-col items-center"
        >
          <div className="relative select-none">
            <motion.div
              aria-hidden="true"
              className="absolute inset-0 text-[clamp(7rem,25vw,18rem)] font-black leading-[0.75] tracking-[-0.08em] text-white/[0.025] blur-sm"
              animate={
                shouldReduceMotion
                  ? undefined
                  : {
                      x: isGlitching ? [-2, 2, -1, 0] : 0,
                    }
              }
              transition={{
                duration: 0.16,
                ease: 'linear',
              }}
            >
              404
            </motion.div>

            <motion.h1
              className="relative text-[clamp(7rem,25vw,18rem)] font-black leading-[0.75] tracking-[-0.08em] text-[#f4f0e8]"
              animate={
                shouldReduceMotion
                  ? undefined
                  : {
                      x: isGlitching ? [0, -3, 3, -1, 0] : 0,
                    }
              }
              transition={{
                duration: 0.18,
                ease: 'linear',
              }}
            >
              404
            </motion.h1>

            {!shouldReduceMotion && (
              <>
                <motion.div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-0 right-0 top-[46%] h-px bg-[#f4f0e8]/20"
                  animate={{
                    opacity: isGlitching ? [0, 1, 0] : 0,
                    scaleX: isGlitching ? [0.2, 1, 0.35] : 0.2,
                  }}
                  transition={{
                    duration: 0.16,
                  }}
                />

                <motion.div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-[#f4f0e8]/10"
                  animate={{
                    opacity: isGlitching ? [0, 1, 0] : 0,
                  }}
                  transition={{
                    duration: 0.12,
                  }}
                />
              </>
            )}
          </div>

          <motion.div
            className="mt-12 max-w-xl"
            initial={
              shouldReduceMotion
                ? undefined
                : {
                    opacity: 0,
                    y: 12,
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
              delay: 0.2,
              ease: 'easeOut',
            }}
          >
            <h2 className="text-balance text-2xl font-bold tracking-[-0.035em] sm:text-3xl">
              <ScrambleText text={title} active={isGlitching} />
            </h2>

            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#f4f0e8]/55 sm:text-base">
              {description}
            </p>
          </motion.div>

          <motion.div
            className="mt-10 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row"
            initial={
              shouldReduceMotion
                ? undefined
                : {
                    opacity: 0,
                    y: 12,
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
              delay: 0.35,
              ease: 'easeOut',
            }}
          >
            <a href={homeHref} className="w-full sm:w-auto">
              <Button3D
                variant="primary"
                size="md"
                className="w-full sm:min-w-[150px]"
              >
                {homeLabel}
              </Button3D>
            </a>

            <a href={browseHref} className="w-full sm:w-auto">
              <Button3D
                variant="secondary"
                size="md"
                className="w-full sm:min-w-[150px]"
              >
                {browseLabel}
              </Button3D>
            </a>
          </motion.div>
        </motion.div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#090909] to-transparent"
      />
    </section>
  );
}