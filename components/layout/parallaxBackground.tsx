"use client";

import * as React from "react";
import Image from "next/image";
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

export function ParallaxBackground() {
    const reducedMotion = usePrefersReducedMotion();
    const [y, setY] = React.useState(0);

    React.useEffect(() => {
        if (reducedMotion) return;

        let raf = 0;
        const onScroll = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                setY(window.scrollY || 0);
            });
        };

        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("scroll", onScroll);
        };
    }, [reducedMotion]);

    const layer1 = reducedMotion ? 0 : y * 0.08;
    const layer2 = reducedMotion ? 0 : y * 0.12;
    const layer3 = reducedMotion ? 0 : y * 0.06;

    return (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
            {/* Top-right (grand motif) */}
            <div
                className={cn(
                    "absolute -right-16 -top-100 opacity-10 blur-[0.2px] will-change-transform",
                    "h-[1170px] w-[1530px] md:h-[1170px] md:w-[1530px]"
                )}
                style={{ transform: `translate3d(0, ${layer1}px, 0)` }}
            >
                <Image
                    src="/background/BG.jpg"
                    alt=""
                    fill
                    sizes="(min-width: 768px) 1020px, 780px"
                    className="object-contain"
                    priority={false}
                />
            </div>

            {/* Left-middle (motif partiel) */}
            <div
                className={cn(
                    "absolute -left-24 top-[35%] opacity-10 will-change-transform",
                    "h-[570px] w-[570px] md:h-[780px] md:w-[780px]"
                )}
                style={{ transform: `translate3d(0, ${layer2}px, 0)` }}
            >
                <Image
                    src="/background/BG2.jpg"
                    alt=""
                    fill
                    sizes="(min-width: 768px) 780px, 570px"
                    className="object-contain"
                />
            </div>

            {/* pas sur de celui la sa fait chargé */}

            {/* <div
                className={cn(
                    "absolute -right-10 bottom-[6%] opacity-30 will-change-transform",
                    "h-[360px] w-[360px] md:h-[510px] md:w-[510px]"
                )}
                style={{ transform: `translate3d(0, ${layer3}px, 0)` }}
            >
                <Image
                    src="/background/BG4.jpg"
                    alt=""
                    fill
                    sizes="(min-width: 768px) 510px, 360px"
                    className="object-contain"
                />
            </div> */}
        </div>
    );
}