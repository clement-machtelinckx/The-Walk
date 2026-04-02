import Link from "next/link";
import { Container } from "@/components/layout/container";
import { siteConfig } from "@/config/site";

export function Footer() {
    return (
        <footer className="border-t bg-zinc-900 text-white">
            <Container>
                <div className="py-12 text-center md:text-left">
                    <h3 className="text-xl font-bold">{siteConfig.name}</h3>
                    <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
                        {siteConfig.description}
                    </p>
                </div>

                <div className="border-t border-white/10 py-6">
                    <div className="flex flex-col gap-3 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
                        <p>
                            © {new Date().getFullYear()} {siteConfig.name}. Tous droits réservés.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <Link
                                href="/"
                                className="underline underline-offset-4 hover:text-white"
                            >
                                Accueil
                            </Link>
                        </div>
                    </div>
                </div>
            </Container>
        </footer>
    );
}
