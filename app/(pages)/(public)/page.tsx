import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { siteConfig } from "@/config/site";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Tableau de bord",
    description: siteConfig.description,
};

export default function HomePage() {
    return (
        <Container>
            <section className="flex flex-col items-center justify-center py-12 text-center md:py-24">
                <div className="space-y-6">
                    <h1 className="text-5xl font-bold tracking-tighter md:text-7xl">
                        {siteConfig.name}
                    </h1>
                    <p className="text-muted-foreground mx-auto max-w-2xl text-xl leading-relaxed md:text-2xl">
                        {siteConfig.description}
                    </p>
                </div>

                <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row">
                    <Link
                        href="/login"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 flex h-12 items-center justify-center rounded-full px-8 text-lg font-bold transition-colors"
                    >
                        Accéder à l&apos;application
                    </Link>
                    <Link
                        href={siteConfig.links.crawl}
                        target="_blank"
                        className="border-border text-foreground hover:bg-muted flex h-12 items-center justify-center rounded-full border px-8 text-lg font-semibold transition-colors"
                    >
                        Consulter The Crawl
                    </Link>
                </div>

                <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
                    {[
                        { title: "Privé", desc: "Un espace dédié pour votre table." },
                        { title: "Mobile", desc: "Pensé pour une utilisation en session." },
                        { title: "Connecté", desc: "Lien direct vers la documentation." },
                    ].map((feature) => (
                        <div key={feature.title} className="space-y-2">
                            <h3 className="text-primary/60 text-lg font-bold tracking-widest uppercase">
                                {feature.title}
                            </h3>
                            <p className="text-muted-foreground">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>
        </Container>
    );
}
