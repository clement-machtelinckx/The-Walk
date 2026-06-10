import { Container } from "@/components/layout/container";
import { PublicAccessActions } from "@/components/layout/public-access-actions";
import { Github, Heart } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/config/site";

type PublicLayoutProps = Readonly<{
    children: React.ReactNode;
}>;

export default function PublicLayout({ children }: PublicLayoutProps) {
    const currentYear = new Date().getFullYear();

    return (
        <div className="flex min-h-dvh flex-col">
            <header className="bg-background/95 sticky top-0 z-40 border-b py-3 backdrop-blur">
                <Container className="flex items-center justify-between gap-3">
                    <Link
                        href="/"
                        className="font-heading text-primary text-2xl font-bold tracking-tighter"
                    >
                        {siteConfig.name}
                    </Link>
                    <nav aria-label="Navigation publique" className="flex items-center gap-1">
                        <Link
                            href="/about"
                            className="text-muted-foreground hover:text-foreground hidden rounded-md px-2 py-2 text-sm font-medium transition-colors sm:block"
                        >
                            À propos
                        </Link>
                        <Link
                            href="/faq"
                            className="text-muted-foreground hover:text-foreground hidden rounded-md px-2 py-2 text-sm font-medium transition-colors sm:block"
                        >
                            FAQ
                        </Link>
                        <PublicAccessActions compact />
                    </nav>
                </Container>
            </header>

            <main id="main" className="flex flex-1 flex-col">
                {children}
            </main>

            <footer className="border-t py-8">
                <Container className="space-y-7">
                    <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
                        <p className="text-muted-foreground text-xs tracking-widest uppercase">
                            Hub de session JDR pour tables organisées
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                            <Link href="/about" className="text-muted-foreground hover:text-foreground">
                                À propos
                            </Link>
                            <Link href="/faq" className="text-muted-foreground hover:text-foreground">
                                FAQ
                            </Link>
                            <Link href="/tables" className="text-primary font-semibold">
                                Ouvrir l’app
                            </Link>
                        </div>
                    </div>

                    <div className="text-muted-foreground flex flex-col items-center gap-2 border-t pt-5 text-center text-xs">
                        <p className="flex items-center gap-1.5">
                            Made with
                            <Heart
                                aria-label="amour"
                                className="text-primary h-3.5 w-3.5 fill-current"
                            />
                            by Yazii
                            <a
                                href="https://github.com/clement-machtelinckx"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Profil GitHub de Yazii"
                                className="hover:text-foreground rounded-sm p-1 transition-colors"
                            >
                                <Github className="h-4 w-4" />
                            </a>
                        </p>
                        <p>© {currentYear} {siteConfig.name}. Tous droits réservés.</p>
                    </div>
                </Container>
            </footer>
        </div>
    );
}
