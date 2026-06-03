import { Container } from "@/components/layout/container";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col">
            <header className="bg-background/90 border-b py-4 backdrop-blur">
                <Container className="flex items-center justify-between gap-4">
                    <Link
                        href="/"
                        className="font-heading text-primary text-2xl font-bold tracking-tighter"
                    >
                        {siteConfig.name}
                    </Link>
                    <nav aria-label="Navigation publique" className="flex items-center gap-1">
                        <Link
                            href="/about"
                            className="text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors"
                        >
                            À propos
                        </Link>
                        <Link
                            href="/faq"
                            className="text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors"
                        >
                            FAQ
                        </Link>
                        <Link
                            href="/login"
                            className="text-primary hover:bg-primary/10 rounded-md px-3 py-2 text-sm font-bold transition-colors"
                        >
                            Connexion
                        </Link>
                    </nav>
                </Container>
            </header>

            <main id="main" className="flex flex-1 flex-col">
                {children}
            </main>

            <footer className="border-t py-8">
                <Container className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
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
                        <Link href="/register" className="text-primary font-semibold">
                            Créer un compte
                        </Link>
                    </div>
                </Container>
            </footer>
        </div>
    );
}
