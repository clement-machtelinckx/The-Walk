export const siteName = "The-Walk";
export const domain = "the-walk.fr";
export const url = `https://${domain}`;
export const description =
    "The-Walk aide les tables de jeu de rôle à organiser leurs sessions, suivre les présences et jouer avec des outils de groupe simples.";
export const locale = "fr_FR";

export const siteConfig = {
    name: siteName,
    domain,
    url,
    description,
    locale,
    ogImage: "/opengraph-image",
    links: {
        crawl: process.env.THE_CRAWL_URL || "https://the-crawl.vercel.app/",
    },
};
