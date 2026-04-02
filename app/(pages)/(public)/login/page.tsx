import type { Metadata } from "next";
import { Container } from "@/components/layout/container";

export const metadata: Metadata = {
    title: "Connexion",
    description: "Connectez-vous à The-Walk",
};

export default function LoginPage() {
    return (
        <Container>
            <section className="flex flex-col items-center justify-center py-12 text-center md:py-24">
                <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Connexion</h1>
                <p className="text-muted-foreground mt-6 max-w-md text-lg">
                    Ceci est le placeholder technique pour la page de connexion.
                </p>
                <div className="bg-muted/50 mt-10 rounded-xl border border-dashed p-12">
                    <p className="text-primary/60 text-sm font-medium uppercase">
                        Formulaire d&apos;authentification (Supabase)
                    </p>
                </div>
            </section>
        </Container>
    );
}
