import { Container } from "@/components/layout/container";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col">
            {/* Very minimal public header */}
            <header className="py-8">
                <Container className="flex justify-center">
                    <Link
                        href="/"
                        className="font-heading text-primary text-3xl font-bold tracking-tighter"
                    >
                        {siteConfig.name}
                    </Link>
                </Container>
            </header>

            <main id="main" className="flex flex-1 flex-col justify-center">
                {children}
            </main>

            {/* Minimal footer */}
            <footer className="py-8">
                <Container>
                    <p className="text-muted-foreground text-center text-xs tracking-widest uppercase">
                        Hub de session JDR
                    </p>
                </Container>
            </footer>
        </div>
    );
}
