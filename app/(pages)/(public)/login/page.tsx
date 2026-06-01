import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { LoginForm } from "@/components/auth/login-form";
import { redirectIfAuthenticated } from "@/lib/auth/server";
import { getSafeNextPath } from "@/lib/auth/redirect";

export const metadata: Metadata = {
    title: "Connexion",
    description: "Connectez-vous à The-Walk",
};

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ next?: string }>;
}) {
    const { next } = await searchParams;
    const nextPath = getSafeNextPath(next);

    // Server-side guard: if already logged in, keep the intended destination when safe.
    await redirectIfAuthenticated(nextPath || "/tables");

    return (
        <Container>
            <section className="mx-auto max-w-md space-y-8 py-12">
                <div className="space-y-2 text-center">
                    <h1 className="text-4xl font-bold tracking-tight">Bienvenue</h1>
                    <p className="text-muted-foreground">
                        Identifiez-vous pour gérer vos tables de jeu.
                    </p>
                </div>

                <LoginForm nextPath={nextPath} />

                <p className="text-muted-foreground px-8 text-center text-sm">
                    En vous connectant, vous acceptez nos conditions d&apos;utilisation.
                </p>
            </section>
        </Container>
    );
}
