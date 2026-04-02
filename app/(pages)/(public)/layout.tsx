import { Container } from "@/components/layout/container";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Minimal Header for public pages */}
            <header className="border-b py-6">
                <Container className="flex items-center justify-between">
                    <Link href="/" className="text-xl font-bold tracking-tight">
                        {siteConfig.name}
                    </Link>
                    <nav className="text-sm font-medium">
                        <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                            Connexion
                        </Link>
                    </nav>
                </Container>
            </header>

            <main id="main" className="flex-1">
                {children}
            </main>

            {/* Minimal Footer for public pages */}
            <footer className="border-t py-8 mt-auto">
                <Container>
                    <p className="text-sm text-center text-muted-foreground">
                        © {new Date().getFullYear()} {siteConfig.name}
                    </p>
                </Container>
            </footer>
        </div>
    );
}
