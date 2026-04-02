import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
    title: "Tableau de bord",
    description: siteConfig.description,
};

export default function HomePage() {
    return (
        <Container>
            <section className="flex min-h-[60vh] flex-col items-center justify-center py-12 text-center md:py-24">
                <h1 className="text-4xl font-bold tracking-tight md:text-6xl">{siteConfig.name}</h1>
                <p className="text-muted-foreground mt-6 max-w-2xl text-lg md:text-xl">
                    {siteConfig.description}
                </p>
                <div className="mt-10">
                    <p className="text-primary/60 text-sm font-medium tracking-wide uppercase">
                        Application en cours de développement
                    </p>
                </div>
            </section>
        </Container>
    );
}
