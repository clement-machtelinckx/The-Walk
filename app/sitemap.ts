// app/sitemap.ts
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const base = "https://protecaudio.fr";
    return [
        { url: `${base}/`, lastModified: new Date() },
        { url: `${base}/garantie`, lastModified: new Date() },
        { url: `${base}/protection`, lastModified: new Date() },
        { url: `${base}/contact`, lastModified: new Date() },
        { url: `${base}/contact/form`, lastModified: new Date() },
        { url: `${base}/appeler-agence`, lastModified: new Date() },
    ];
}