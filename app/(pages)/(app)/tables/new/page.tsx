import { requireAuth } from "@/lib/auth/server";
import { PageShell } from "@/components/layout/app-shell";
import { CreateTableForm } from "@/components/table/create-table-form";

export const metadata = {
    title: "Nouvelle Table",
    description: "Créez une nouvelle table de jeu pour vos campagnes.",
};

export default async function NewTablePage() {
    // Server-side auth guard
    await requireAuth();

    return (
        <PageShell
            title="Nouvelle Table"
            description="Organisez une nouvelle campagne et invitez vos joueurs."
        >
            <div className="py-4">
                <CreateTableForm />
            </div>
        </PageShell>
    );
}
