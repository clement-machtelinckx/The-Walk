import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { LoginForm } from "@/components/auth/login-form";
import { redirectIfAuthenticated } from "@/lib/auth/server";

export const metadata: Metadata = {
    title: "Connexion",
    description: "Connectez-vous à The-Walk",
};

export default function LoginPage() {
    // Server-side guard: if already logged in, redirect to /tables
    redirectIfAuthenticated("/tables");

    return (
        <Container>
            <section className="mx-auto max-w-md space-y-8 py-12">
                <div className="space-y-2 text-center">
                    <h1 className="text-4xl font-bold tracking-tight">Bienvenue</h1>
                    <p className="text-muted-foreground">
                        Identifiez-vous pour gérer vos tables de jeu.
                    </p>
                </div>

                <LoginForm />

                <p className="text-muted-foreground px-8 text-center text-sm">
                    En vous connectant, vous acceptez nos conditions d&apos;utilisation.
                </p>
            </section>
        </Container>
    );
}
