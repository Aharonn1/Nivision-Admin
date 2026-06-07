// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * פונקציה למיזוג קלאסים של Tailwind בצורה חכמה
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// שורת קסם כדי לוודא ש-TypeScript מזהה את הקובץ כמודול
export {};