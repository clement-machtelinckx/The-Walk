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
                src: "/favicon.ico",
                sizes: "any",
                type: "image/x-icon",
            },
        ],
    };
}
