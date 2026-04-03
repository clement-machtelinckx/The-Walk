import { requireAuth } from "@/lib/auth/server";

export default async function TableLiveSessionPage({
    params,
}: {
    params: Promise<{ tableId: string; sessionId: string }>;
}) {
    await requireAuth();
    const { tableId, sessionId } = await params;

    return (
        <section className="space-y-6 py-8">
            <h1 className="text-primary/80 text-3xl font-bold tracking-tight italic">
                Session LIVE - Table: {tableId}
            </h1>
            <p className="text-muted-foreground text-lg">
                Identifiant de la session : {sessionId}. Outils de suivi en temps réel.
            </p>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="bg-muted/50 rounded-xl border border-dashed p-6 text-center lg:col-span-2">
                    <p className="text-primary/60 text-sm font-medium tracking-widest uppercase">
                        Notes de session
                    </p>
                </div>
                <div className="bg-muted/50 rounded-xl border border-dashed p-6 text-center">
                    <p className="text-primary/60 text-sm font-medium tracking-widest uppercase">
                        Suivi Combat
                    </p>
                </div>
                <div className="bg-muted/50 rounded-xl border border-dashed p-6 text-center">
                    <p className="text-primary/60 text-sm font-medium tracking-widest uppercase">
                        Lancer de dés
                    </p>
                </div>
            </div>
        </section>
    );
}
