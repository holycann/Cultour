/**
 * Debounce function to limit the rate of function calls
 * @param func Function to debounce
 * @param delay Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<F extends (...args: any[]) => any>(
  func: F,
  delay: number
): F & { cancel: () => void } {
  let timeoutId: NodeJS.Timeout | null = null;

  const debouncedFunc = (...args: Parameters<F>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, delay);
  };

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return Object.assign(debouncedFunc as F, { cancel }) as F & {
    cancel: () => void;
  };
}
