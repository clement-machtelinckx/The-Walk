import { requireAuth } from "@/lib/auth/server";
import { TableService } from "@/lib/services/tables/table-service";
import { PageShell } from "@/components/layout/app-shell";
import { TableCard } from "@/components/table/table-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/special/empty-state";

export const metadata = {
    title: "Mes Tables",
    description: "Gérez vos tables de jeu de rôle et vos sessions.",
};

export default async function TablesPage() {
    const user = await requireAuth();
    const tables = await TableService.listUserTables(user.id);

    return (
        <PageShell
            title="Mes Tables"
            description="Toutes vos campagnes et tables de jeu actives."
            actions={
                <Button asChild size="sm">
                    <Link href="/tables/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Nouvelle Table
                    </Link>
                </Button>
            }
        >
            {tables.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 py-4 md:grid-cols-2 lg:grid-cols-3">
                    {tables.map((table) => (
                        <TableCard key={table.id} table={table} />
                    ))}
                </div>
            ) : (
                <EmptyState
                    title="Aucune table pour le moment"
                    description="Vous n'avez rejoint aucune table. Commencez par en créer une ou attendez une invitation !"
                >
                    <Button asChild>
                        <Link href="/tables/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Créer ma première table
                        </Link>
                    </Button>
                </EmptyState>
            )}
        </PageShell>
    );
}
