import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
    const base = siteConfig.url;
    const lastModified = new Date();

    return [
        {
            url: `${base}/`,
            lastModified,
            changeFrequency: "monthly",
            priority: 1.0,
        },
    ];
}
