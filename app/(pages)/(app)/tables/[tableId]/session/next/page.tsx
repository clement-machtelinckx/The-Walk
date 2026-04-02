export default async function TableNextSessionPage({
    params,
}: {
    params: Promise<{ tableId: string }>;
}) {
    const { tableId } = await params;

    return (
        <section className="space-y-6 py-8">
            <h1 className="text-primary/80 text-3xl font-bold tracking-tight italic">
                Prochaine Session - Table: {tableId}
            </h1>
            <p className="text-muted-foreground text-lg">
                Organisation de la prochaine rencontre, date, lieu et notes de préparation.
            </p>
            <div className="bg-muted/50 rounded-xl border border-dashed p-12 text-center">
                <p className="text-primary/60 text-sm font-medium tracking-widest uppercase">
                    Sondages / Préparation
                </p>
            </div>
        </section>
    );
}
