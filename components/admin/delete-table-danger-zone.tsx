"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useTableStore } from "@/store/table-store";

type DeleteTableDangerZoneProps = Readonly<{
    tableId: string;
    tableName: string;
}>;

export function DeleteTableDangerZone({ tableId, tableName }: DeleteTableDangerZoneProps) {
    const router = useRouter();
    const { deleteTable, isLoading } = useTableStore();
    const [isOpen, setIsOpen] = useState(false);
    const [confirmation, setConfirmation] = useState("");
    const [error, setError] = useState<string | null>(null);

    const canDelete = confirmation === tableName;

    const handleOpenChange = (open: boolean) => {
        if (open) {
            setConfirmation("");
            setError(null);
        }

        setIsOpen(open);
    };

    const handleDelete = async () => {
        if (!canDelete || isLoading) return;

        setError(null);
        const result = await deleteTable(tableId);

        if (!result.success) {
            setError(result.error || "Impossible de supprimer la table.");
            return;
        }

        setIsOpen(false);
        router.push("/tables");
        router.refresh();
    };

    return (
        <section className="border-destructive/20 bg-destructive/5 rounded-xl border p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <h3 className="text-destructive flex items-center gap-2 text-sm font-bold">
                        <AlertTriangle size={16} />
                        Zone dangereuse
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        Supprime définitivement la table et ses données liées. Cette action ne peut
                        pas être annulée.
                    </p>
                </div>

                <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                    <DialogTrigger asChild>
                        <Button variant="destructive" className="w-full sm:w-auto">
                            <Trash2 />
                            Supprimer la table
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Supprimer la table</DialogTitle>
                            <DialogDescription>
                                Cette action supprimera la table, ses sessions, invitations,
                                messages, notes et journaux liés. Une session live doit être
                                clôturée ou annulée avant suppression.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-3">
                            <div className="bg-destructive/10 text-destructive border-destructive/20 rounded-lg border p-3 text-sm font-medium">
                                Pour confirmer, saisissez exactement :{" "}
                                <span className="font-bold">{tableName}</span>
                            </div>
                            <Input
                                value={confirmation}
                                onChange={(event) => {
                                    setConfirmation(event.target.value);
                                    setError(null);
                                }}
                                placeholder={tableName}
                                autoComplete="off"
                            />
                            {error && (
                                <p className="text-destructive text-sm font-medium">{error}</p>
                            )}
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                                disabled={isLoading}
                            >
                                Annuler
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={!canDelete || isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin" />
                                        Suppression...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 />
                                        Supprimer définitivement
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </section>
    );
}
