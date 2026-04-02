import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Poppins, Quicksand } from "next/font/google";
import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
    display: "swap",
});

const quicksand = Quicksand({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
    display: "swap",
    variable: "--font-quicksand",
});

export const metadata: Metadata = {
    title: {
        default: siteConfig.name,
        template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    metadataBase: new URL(siteConfig.url),
    openGraph: {
        type: "website",
        locale: siteConfig.locale,
        siteName: siteConfig.name,
        title: siteConfig.name,
        description: siteConfig.description,
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html
            lang="fr"
            className={`${poppins.className} ${quicksand.variable}`}
            suppressHydrationWarning
        >
            <body className="bg-background text-foreground flex min-h-dvh flex-col antialiased">
                <Header />
                <main id="main" className="flex-1">
                    {children}
                </main>
                <Footer />
            </body>
        </html>
    );
}
