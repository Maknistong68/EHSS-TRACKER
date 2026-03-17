import { useRef, useCallback } from 'react';

/**
 * Returns a debounced version of the callback.
 * The callback is delayed by `delay` ms; if called again before the delay, the timer resets.
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => void>(
    callback: T,
    delay: number = 400
): T {
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    return useCallback(
        (...args: unknown[]) => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => callback(...args), delay);
        },
        [callback, delay]
    ) as T;
}
