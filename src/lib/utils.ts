import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind classes conditionally without conflicts.
 * Example: cn('text-white p-4', isVip && 'bg-amber-500')
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}