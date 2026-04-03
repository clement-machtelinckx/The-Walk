import { requireAuth } from "@/lib/auth/server";

export default async function TableAdminPage({ params }: { params: Promise<{ tableId: string }> }) {
    await requireAuth();
    const { tableId } = await params;

    return (
        <section className="space-y-6 py-8">
            <h1 className="text-primary/80 text-3xl font-bold tracking-tight italic">
                Administration de la table: {tableId}
            </h1>
            <p className="text-muted-foreground text-lg">
                Gestion des joueurs, des paramètres de la table et des sessions passées.
            </p>
            <div className="bg-muted/50 rounded-xl border border-dashed p-12 text-center">
                <p className="text-primary/60 text-sm font-medium tracking-widest uppercase">
                    Outils de gestion (Master de la table)
                </p>
            </div>
        </section>
    );
}
