export const siteName = "The-Walk";
export const domain = "the-walk.fr";
export const url = `https://${domain}`;
export const description = "Application métier pour la gestion de sessions de jeu de rôle (JDR).";
export const locale = "fr_FR";

export const siteConfig = {
    name: siteName,
    domain,
    url,
    description,
    locale,
    links: {
        crawl: process.env.THE_CRAWL_URL || "https://the-crawl.vercel.app/",
    },

};
