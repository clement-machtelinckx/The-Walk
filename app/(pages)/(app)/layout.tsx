import { Container } from "@/components/layout/container";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col">
            {/* Navigation Applicative Placeholder */}
            <header className="bg-background/80 sticky top-0 z-50 border-b backdrop-blur">
                <Container>
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-8">
                            <Link href="/" className="text-xl font-bold tracking-tight">
                                {siteConfig.name}
                            </Link>
                            <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
                                <Link
                                    href="/tables"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Mes Tables
                                </Link>
                                <Link
                                    href="/mon-compte"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Mon Compte
                                </Link>
                            </nav>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold">
                                JD
                            </div>
                        </div>
                    </div>
                </Container>
            </header>

            <main className="flex-1">
                <Container className="py-8">{children}</Container>
            </main>

            <Footer />
        </div>
    );
}
