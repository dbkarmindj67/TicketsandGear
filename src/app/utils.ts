// utils.ts
let timerId: number | undefined; // Explicitly declare the type of timerId

// Explicitly declare the types for parameters 'func' and 'delay'
export function throttle(func: () => void, delay: number): void {
  if (timerId !== undefined) {
    return;
  }

  timerId = window.setTimeout(() => { // Use 'window.setTimeout' to correctly type 'timerId'
    func();
    timerId = undefined; // Reset timerId to undefined after execution
  }, delay);
}
