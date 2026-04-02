export default async function TableDetailPage({
    params,
}: {
    params: Promise<{ tableId: string }>;
}) {
    const { tableId } = await params;

    return (
        <section className="space-y-6 py-8">
            <h1 className="text-primary/80 text-3xl font-bold tracking-tight italic">
                Table: {tableId}
            </h1>
            <p className="text-muted-foreground text-lg">
                Vue d&apos;ensemble de la table, des personnages et des prochaines sessions.
            </p>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="bg-muted/50 rounded-xl border border-dashed p-8 text-center md:col-span-2">
                    <p className="text-primary/60 text-sm font-medium tracking-widest uppercase">
                        Flux de la table / Sessions passées
                    </p>
                </div>
                <div className="bg-muted/50 rounded-xl border border-dashed p-8 text-center">
                    <p className="text-primary/60 text-sm font-medium tracking-widest uppercase">
                        Liste des joueurs
                    </p>
                </div>
            </div>
        </section>
    );
}
