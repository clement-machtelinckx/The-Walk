import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "./container";

export function Header() {
    return (
        <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
            <Container>
                <div className="flex h-16 items-center justify-between">
                    <Link href="/" className="font-semibold tracking-tight">
                        ProtecAudio
                    </Link>

                    <nav className="hidden items-center gap-6 md:flex">
                        <Link href="/garantie" className="text-sm text-muted-foreground hover:text-foreground">
                            Garanties audioprotheses
                        </Link>
                        <Link href="/protection" className="text-sm text-muted-foreground hover:text-foreground">
                            Protection de votre activité
                        </Link>
                        <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                            Contact
                        </Link>
                    </nav>

                    <div className="flex items-center gap-2">
                        <Button asChild>
                            <Link href="/contact">Demander un devis</Link>
                        </Button>
                    </div>
                </div>
            </Container>
        </header>
    );
}