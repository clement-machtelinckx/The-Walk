import type { Metadata } from "next";
import { Container } from "@/components/layout/container";

export const metadata: Metadata = {
    title: "Connexion",
    description: "Connectez-vous à The-Walk",
};

export default function LoginPage() {
    return (
        <Container>
            <section className="mx-auto max-w-md space-y-8 py-12">
                <div className="space-y-2 text-center">
                    <h1 className="text-4xl font-bold tracking-tight">Bienvenue</h1>
                    <p className="text-muted-foreground">
                        Identifiez-vous pour gérer vos tables de jeu.
                    </p>
                </div>

                <div className="app-card overflow-hidden">
                    <div className="space-y-6 p-8">
                        {/* Placeholder pour le formulaire de connexion */}
                        <div className="space-y-4">
                            <div className="border-input bg-background text-muted-foreground h-10 w-full rounded-md border px-3 py-2 text-sm">
                                Email
                            </div>
                            <div className="border-input bg-background text-muted-foreground h-10 w-full rounded-md border px-3 py-2 text-sm">
                                Mot de passe
                            </div>
                            <button className="bg-primary text-primary-foreground h-10 w-full rounded-md px-4 py-2 font-semibold">
                                Se connecter
                            </button>
                        </div>

                        <div className="text-muted-foreground/60 relative text-center text-xs uppercase">
                            <span className="bg-card px-2">Ou continuer avec</span>
                            <div className="border-border absolute inset-x-0 top-1/2 -z-10 border-t" />
                        </div>

                        <button className="border-border bg-background text-foreground hover:bg-muted flex h-10 w-full items-center justify-center rounded-md border px-4 py-2 font-medium transition-colors">
                            Supabase / SSO
                        </button>
                    </div>
                </div>

                <p className="text-muted-foreground px-8 text-center text-sm">
                    En vous connectant, vous acceptez nos conditions d&apos;utilisation.
                </p>
            </section>
        </Container>
    );
}
