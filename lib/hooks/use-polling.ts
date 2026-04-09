"use client";

import { useEffect, useRef, useCallback } from "react";

interface UsePollingOptions {
    interval?: number;
    enabled?: boolean;
    pauseOnHidden?: boolean;
    immediate?: boolean;
}

/**
 * usePolling: A hook to execute a fetch function at a regular interval.
 * - interval: frequency in milliseconds (default 10000)
 * - enabled: boolean to start/stop polling (default true)
 * - pauseOnHidden: boolean to stop polling if tab is hidden (default true)
 * - immediate: boolean to execute the fetch function immediately on mount (default true)
 */
export function usePolling(
    fetchFn: () => void | Promise<void>,
    options: UsePollingOptions = {}
) {
    const {
        interval = 10000,
        enabled = true,
        pauseOnHidden = true,
        immediate = true,
    } = options;

    const fetchRef = useRef(fetchFn);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Update the ref if the fetch function changes (though ideally it's memoized)
    useEffect(() => {
        fetchRef.current = fetchFn;
    }, [fetchFn]);

    const executeFetch = useCallback(async () => {
        if (!enabled) return;
        
        // Pause if hidden and option is set
        if (pauseOnHidden && typeof document !== "undefined" && document.hidden) {
            return;
        }

        try {
            await fetchRef.current();
        } catch (error) {
            console.error("[usePolling] Fetch error:", error);
        }
    }, [enabled, pauseOnHidden]);

    const startPolling = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        
        timerRef.current = setInterval(executeFetch, interval);
    }, [executeFetch, interval]);

    const stopPolling = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    // Effect for the main loop
    useEffect(() => {
        if (enabled) {
            if (immediate) {
                executeFetch();
            }
            startPolling();
        } else {
            stopPolling();
        }

        return () => stopPolling();
    }, [enabled, interval, immediate, executeFetch, startPolling, stopPolling]);

    // Visibility change listener
    useEffect(() => {
        if (!pauseOnHidden) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                stopPolling();
            } else if (enabled) {
                // When coming back, fetch immediately and restart interval
                executeFetch();
                startPolling();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [pauseOnHidden, enabled, executeFetch, startPolling, stopPolling]);

    return {
        refresh: executeFetch,
        stop: stopPolling,
        start: startPolling,
    };
}
