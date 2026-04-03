import { requireAuth, requireTableRole } from "@/lib/auth/server";
import { PageShell } from "@/components/layout/app-shell";
import { InvitationManager } from "@/components/admin/invitation-manager";
import { TableRepository } from "@/lib/repositories/table-repository";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function TableAdminPage({ params }: { params: Promise<{ tableId: string }> }) {
    await requireAuth();
    const { tableId } = await params;

    // Ensure user is GM
    await requireTableRole(tableId, "gm");

    const table = await TableRepository.getById(tableId);

    return (
        <PageShell
            title={`Administration : ${table.name}`}
            description="Gérez les joueurs, les invitations et les paramètres de votre table."
            actions={
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/tables/${tableId}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Retour à la table
                    </Link>
                </Button>
            }
        >
            <div className="py-4">
                <InvitationManager tableId={tableId} />
            </div>
        </PageShell>
    );
}
