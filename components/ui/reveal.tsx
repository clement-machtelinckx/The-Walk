"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function usePrefersReducedMotion() {
    const [reduced, setReduced] = React.useState(false);

    React.useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        const onChange = () => setReduced(mq.matches);
        onChange();
        mq.addEventListener?.("change", onChange);
        return () => mq.removeEventListener?.("change", onChange);
    }, []);

    return reduced;
}

type RevealProps = {
    children: React.ReactNode;
    className?: string;
    /** ms */
    delay?: number;
    /** ms */
    duration?: number;
    /** px */
    y?: number;
    once?: boolean;
};

export function Reveal({
    children,
    className,
    delay = 0,
    duration = 450,
    y = 14,
    once = true,
}: RevealProps) {
    const reduced = usePrefersReducedMotion();
    const ref = React.useRef<HTMLDivElement | null>(null);
    const [shown, setShown] = React.useState(false);

    React.useEffect(() => {
        if (reduced) {
            setShown(true);
            return;
        }
        const el = ref.current;
        if (!el) return;

        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShown(true);
                    if (once) io.disconnect();
                } else if (!once) {
                    setShown(false);
                }
            },
            { threshold: 0.15 }
        );

        io.observe(el);
        return () => io.disconnect();
    }, [once, reduced]);

    return (
        <div
            ref={ref}
            className={cn(className)}
            style={
                reduced
                    ? undefined
                    : {
                        transitionProperty: "opacity, transform",
                        transitionDuration: `${duration}ms`,
                        transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                        transitionDelay: `${delay}ms`,
                        opacity: shown ? 1 : 0,
                        transform: shown ? "translate3d(0,0,0) scale(1)" : `translate3d(0,${y}px,0) scale(0.98)`,
                        willChange: "opacity, transform",
                    }
            }
        >
            {children}
        </div>
    );
}