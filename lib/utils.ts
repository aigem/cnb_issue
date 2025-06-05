import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Function to compare two arrays (elements must be primitives for === comparison)
// For labels (strings), this works well. Order matters here.
// If order doesn't matter, sort copies of arrays before comparing.
export function arraysEqual<T>(a: T[], b: T[]): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

// Specific function for comparing label arrays where order does not matter.
export function labelArrayHasChanged(newLabels: string[], oldLabels: string[]): boolean {
  if (newLabels.length !== oldLabels.length) return true;

  const sortedNew = [...newLabels].sort();
  const sortedOld = [...oldLabels].sort();

  for (let i = 0; i < sortedNew.length; i++) {
    if (sortedNew[i] !== sortedOld[i]) return true;
  }
  return false;
}


// Debounce function
export function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };

  return debounced as (...args: Parameters<F>) => void;
}
