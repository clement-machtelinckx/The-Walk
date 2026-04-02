import type { Metadata } from "next";
import { PageShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
    title: "Mes Tables",
};

export default function TablesPage() {
    return (
        <PageShell
            title="Mes Tables"
            description="Gérez vos tables de jeu et vos campagnes en cours."
        >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Tables List Placeholder */}
                {[1, 2, 3].map((i) => (
                    <div key={i} className="app-card flex flex-col gap-4 p-6">
                        <div className="flex items-start justify-between">
                            <h3 className="text-xl font-bold">Campagne #{i}</h3>
                            <span className="badge badge-secondary">En cours</span>
                        </div>
                        <p className="text-muted-foreground line-clamp-2 text-sm">
                            Une campagne épique dans un monde de fantasy. Préparez-vous à
                            l&apos;aventure !
                        </p>
                        <div className="text-muted-foreground mt-auto flex items-center justify-between border-t pt-4 text-xs">
                            <span>4 Joueurs</span>
                            <span>Prochaine session: Samedi</span>
                        </div>
                    </div>
                ))}

                {/* Create Table CTA */}
                <button className="empty-state hover:bg-muted/10 group transition-colors">
                    <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full transition-transform group-hover:scale-110">
                        +
                    </div>
                    <span className="mt-4 font-semibold">Créer une nouvelle table</span>
                </button>
            </div>
        </PageShell>
    );
}
