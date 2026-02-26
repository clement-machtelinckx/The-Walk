"use client";

import dynamic from "next/dynamic";

const ParallaxBackground = dynamic(
    () =>
        import("./parallaxBackground").then((m) => m.ParallaxBackground),
    { ssr: false }
);

export function ParallaxBackgroundClient() {
    return (
        <div className="hidden md:block">
            <ParallaxBackground />
        </div>
    );
}