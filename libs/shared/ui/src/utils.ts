import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes and tailwind-merge for deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Variant helper for creating component variants
 */
export function createVariants<T extends Record<string, Record<string, string>>>(variants: T) {
  return variants;
}

/**
 * Size utilities for consistent component sizing
 */
export const sizeVariants = {
  sm: 'sm',
  base: 'base',
  lg: 'lg',
} as const;

export type Size = keyof typeof sizeVariants;

/**
 * Color utilities for consistent theming
 */
export const colorVariants = {
  primary: 'primary',
  secondary: 'secondary',
  accent: 'accent',
  gray: 'gray',
  success: 'success',
  warning: 'warning',
  error: 'error',
  info: 'info',
} as const;

export type Color = keyof typeof colorVariants;

/**
 * Get appropriate text color for a given background
 */
export function getTextColor(backgroundColor: string): string {
  // Simple contrast logic - in a real app you'd want more sophisticated color analysis
  const darkBackgrounds = ['700', '800', '900', '950'];
  const isDark = darkBackgrounds.some((shade) => backgroundColor.includes(shade));
  return isDark ? 'text-white' : 'text-gray-900';
}

/**
 * Focus ring utility for consistent focus states
 */
export const focusRing =
  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2';

/**
 * Transition utility for consistent animations
 */
export const transition = 'transition-colors duration-200 ease-in-out';
