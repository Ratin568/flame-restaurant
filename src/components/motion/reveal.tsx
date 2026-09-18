'use client';

import {motion, useReducedMotion} from 'motion/react';
import type {ReactNode} from 'react';

type RevealProps = {
  children: ReactNode;
  /** جهت ورود — پیش‌فرض: از پایین */
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  /** تاخیر بر حسب ثانیه — برای صف کردن عناصر */
  delay?: number;
  /** مدت انیمیشن */
  duration?: number;
  className?: string;
  /** یک‌بار در صفحه یا هر بار */
  once?: boolean;
};

const offsets = {
  up: {y: 32, x: 0},
  down: {y: -32, x: 0},
  left: {y: 0, x: 32},
  right: {y: 0, x: -32},
  none: {y: 0, x: 0},
};

/**
 * Reveal — ورود عناصر با اسکرول
 * حرکت فقط برای کسانی که prefers-reduced-motion ندارند (accessibility)
 */
export function Reveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  className,
  once = true,
}: RevealProps) {
  const reduceMotion = useReducedMotion();
  const offset = offsets[direction];

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{opacity: 0, ...offset}}
      whileInView={{opacity: 1, y: 0, x: 0}}
      viewport={{once, margin: '-64px'}}
      transition={{duration, delay, ease: [0.21, 0.47, 0.32, 0.98]}}
    >
      {children}
    </motion.div>
  );
}