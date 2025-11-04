import { useState, useEffect } from "react";

/**
 * Debounces a value by delaying updates until after a specified delay
 * Useful for limiting API calls during user input
 *
 * @param value - The value to debounce
 * @param delayMs - Delay in milliseconds before updating
 * @returns The debounced value
 */
export function useDebounced<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
