/**
 * Debounce function type declaration
 */
export declare function debounce<F extends (...args: any[]) => any>(
  func: F,
  delay: number
): F & { cancel: () => void };
