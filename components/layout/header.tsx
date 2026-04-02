import Link from "next/link";
import { Container } from "./container";
import { MenuBurger } from "./menuBurger";
import { siteConfig } from "@/config/site";

export function Header() {
    return (
        <header className="bg-background/80 sticky top-0 z-50 border-b backdrop-blur">
            <a
                href="#main"
                className="focus:bg-primary focus:text-primary-foreground sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:rounded focus:px-4 focus:py-2"
            >
                Aller au contenu principal
            </a>
            <Container>
                <div className="flex h-16 items-center justify-between">
                    <Link href="/" className="text-xl font-semibold tracking-tight">
                        {siteConfig.name}
                    </Link>

                    <nav
                        aria-label="Navigation principale"
                        className="hidden items-center gap-6 md:flex"
                    >
                        <Link
                            href="/"
                            className="text-muted-foreground hover:text-foreground text-base transition-colors"
                        >
                            Accueil
                        </Link>
                    </nav>

                    <div className="flex items-center gap-2">
                        {/* Mobile burger */}
                        <MenuBurger />
                    </div>
                </div>
            </Container>
        </header>
    );
}
