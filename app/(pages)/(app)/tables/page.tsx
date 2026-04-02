import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Mes Tables",
};

export default function TablesPage() {
    return (
        <section className="space-y-6 py-8">
            <h1 className="text-3xl font-bold">Mes Tables</h1>
            <p className="text-muted-foreground text-lg">
                Liste de vos tables de jeu et campagnes en cours.
            </p>
            <div className="bg-muted/50 rounded-xl border border-dashed p-12 text-center">
                <p className="text-primary/60 text-sm font-medium tracking-widest uppercase">
                    Grille des tables
                </p>
            </div>
        </section>
    );
}
