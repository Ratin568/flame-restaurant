'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

type Button3DVariant = 'primary' | 'secondary';
type Button3DSize = 'sm' | 'md' | 'lg';

export interface Button3DProps {
  children: React.ReactNode;
  variant?: Button3DVariant;
  size?: Button3DSize;
  disabled?: boolean;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  ariaLabel?: string;
}

const variantStyles: Record<
  Button3DVariant,
  {
    base: string;
    hover: string;
    shadow: string;
    hoverShadow: string;
    pressedShadow: string;
  }
> = {
  primary: {
    base: 'bg-[#f4f0e8] text-[#090909] border-[#f4f0e8]',
    hover: 'hover:bg-white',
    shadow: '0 6px 0 0 #aaa7a1',
    hoverShadow: '0 8px 0 0 #aaa7a1',
    pressedShadow: '0 2px 0 0 #aaa7a1',
  },

  secondary: {
    base: 'bg-[#090909] text-[#f4f0e8] border-[#f4f0e8]',
    hover: 'hover:bg-[#151515]',
    shadow: '0 6px 0 0 #444444',
    hoverShadow: '0 8px 0 0 #444444',
    pressedShadow: '0 2px 0 0 #444444',
  },
};

const sizeStyles: Record<Button3DSize, string> = {
  sm: 'min-h-10 px-4 text-xs sm:px-5',
  md: 'min-h-[52px] px-6 text-sm sm:px-7',
  lg: 'min-h-[58px] px-7 text-sm sm:px-9 sm:text-base',
};

export default function Button3D({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  onClick,
  ariaLabel,
}: Button3DProps) {
  const [isPressed, setIsPressed] = useState(false);

  const styles = variantStyles[variant];

  return (
    <motion.button
      type="button"
      disabled={disabled}
      aria-label={ariaLabel}
      className={[
        styles.base,
        styles.hover,
        sizeStyles[size],
        'relative',
        'inline-flex',
        'items-center',
        'justify-center',
        'gap-3',
        'border',
        'rounded-[10px]',
        'font-[var(--font-inter)]',
        'font-bold',
        'tracking-[-0.025em]',
        'leading-none',
        'select-none',
        'transition-colors',
        'duration-200',
        'focus:outline-none',
        'focus-visible:ring-2',
        'focus-visible:ring-[#f4f0e8]',
        'focus-visible:ring-offset-2',
        'focus-visible:ring-offset-[#090909]',
        disabled
          ? 'cursor-not-allowed opacity-50'
          : 'cursor-pointer',
        className,
      ].join(' ')}
      initial={{
        y: 0,
        boxShadow: styles.shadow,
      }}
      whileHover={
        disabled
          ? undefined
          : {
              y: -2,
              boxShadow: styles.hoverShadow,
              transition: {
                duration: 0.12,
                ease: 'easeOut',
              },
            }
      }
      whileTap={
        disabled
          ? undefined
          : {
              y: 4,
              scale: 0.985,
              boxShadow: styles.pressedShadow,
              transition: {
                duration: 0.08,
                ease: 'easeOut',
              },
            }
      }
      animate={{
        y: isPressed && !disabled ? 4 : 0,
        boxShadow:
          isPressed && !disabled
            ? styles.pressedShadow
            : styles.shadow,
      }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25,
      }}
      onMouseDown={() => {
        if (!disabled) {
          setIsPressed(true);
        }
      }}
      onMouseUp={() => {
        setIsPressed(false);
      }}
      onMouseLeave={() => {
        setIsPressed(false);
      }}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}