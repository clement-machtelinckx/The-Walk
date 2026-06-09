import { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: `${siteConfig.name} — Hub de session JDR`,
        short_name: siteConfig.name,
        description: siteConfig.description,
        start_url: "/tables",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#1e4d3a",
        icons: [
            {
                src: "/icon-192x192.png",
                sizes: "192x192",
                type: "image/png",
            },
            {
                src: "/icon-512x512.png",
                sizes: "512x512",
                type: "image/png",
            },
        ],
    };
}
