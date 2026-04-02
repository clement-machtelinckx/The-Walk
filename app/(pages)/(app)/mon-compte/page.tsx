import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Mon Compte",
};

export default function ProfilePage() {
    return (
        <section className="space-y-6 py-8">
            <h1 className="text-3xl font-bold">Mon Compte</h1>
            <p className="text-muted-foreground text-lg">
                Gestion de votre profil utilisateur et de vos préférences.
            </p>
            <div className="bg-muted/50 rounded-xl border border-dashed p-12 text-center">
                <p className="text-primary/60 text-sm font-medium tracking-widest uppercase">
                    Détails du compte
                </p>
            </div>
        </section>
    );
}
