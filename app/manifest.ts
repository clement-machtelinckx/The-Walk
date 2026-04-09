import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "The-Walk — JDR Manager",
        short_name: "The-Walk",
        description: "Application métier privée pour la gestion de sessions de jeu de rôle.",
        start_url: "/tables",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#1e4d3a", // Forest Green primary
        icons: [
            {
                src: "/favicon.ico",
                sizes: "any",
                type: "image/x-icon",
            },
        ],
    };
}
