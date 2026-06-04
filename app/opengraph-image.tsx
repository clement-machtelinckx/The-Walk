import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const size = {
    width: 1200,
    height: 630,
};

export const contentType = "image/png";

export default function Image() {
    return new ImageResponse(
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                background: "#1e4d3a",
                color: "#ffffff",
                padding: "72px",
                fontFamily: "Arial, sans-serif",
            }}
        >
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 4 }}>
                HUB DE SESSION JDR
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 86, fontWeight: 800, letterSpacing: -2 }}>
                    {siteConfig.name}
                </div>
                <div
                    style={{
                        marginTop: 24,
                        maxWidth: 760,
                        color: "rgba(255,255,255,0.82)",
                        fontSize: 34,
                        lineHeight: 1.25,
                    }}
                >
                    Organiser la table, préparer les sessions et garder les outils au même endroit.
                </div>
            </div>
            <div
                style={{
                    display: "flex",
                    gap: 18,
                    color: "rgba(255,255,255,0.88)",
                    fontSize: 28,
                }}
            >
                <span>Planning</span>
                <span>·</span>
                <span>Présence</span>
                <span>·</span>
                <span>Notes</span>
                <span>·</span>
                <span>Session</span>
            </div>
        </div>,
        size,
    );
}
