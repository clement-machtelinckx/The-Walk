"use client";

import { useState } from "react";
import { TableRole } from "@/types/table";
import { Button } from "@/components/ui/button";
import { Settings, Calendar, Play, LogOut, Loader2 } from "lucide-react";
import Link from "next/link";
import { RoleBadge } from "@/components/special/role-badge";
import { useRouter } from "next/navigation";

interface TableHeaderProps {
    tableId: string;
    name: string;
    description: string | null;
    myRole: TableRole;
}

export function TableHeader({ tableId, name, description, myRole }: TableHeaderProps) {
    const router = useRouter();
    const [isLeaving, setIsLeaving] = useState(false);

    const handleLeaveTable = async () => {
        const confirmMessage =
            myRole === "gm"
                ? "Êtes-vous sûr de vouloir quitter cette table ? En tant que MJ, assurez-vous qu'il reste un autre MJ actif."
                : "Êtes-vous sûr de vouloir quitter cette table ?";

        if (!confirm(confirmMessage)) return;

        setIsLeaving(true);
        try {
            const res = await fetch(`/api/tables/${tableId}/leave`, {
                method: "POST",
            });

            const data = await res.json();

            if (res.ok) {
                router.push("/tables");
                router.refresh();
            } else {
                alert(data.error || "Une erreur est survenue.");
            }
        } catch (err) {
            alert("Erreur réseau.");
        } finally {
            setIsLeaving(false);
        }
    };

    return (
        <div className="space-y-4 border-b pb-4">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-primary/80 text-3xl font-bold tracking-tight italic">
                            {name}
                        </h1>
                        <RoleBadge role={myRole} />
                    </div>
                    {description && (
                        <p className="text-muted-foreground max-w-2xl text-lg">{description}</p>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {myRole === "gm" && (
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/tables/${tableId}/admin`}>
                                <Settings className="mr-2 h-4 w-4" />
                                Gestion
                            </Link>
                        </Button>
                    )}
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/tables/${tableId}/session/next`}>
                            <Calendar className="mr-2 h-4 w-4" />
                            Sessions
                        </Link>
                    </Button>
                    <Button size="sm" asChild>
                        <Link href={`/tables/${tableId}/session/live/latest`}>
                            <Play className="mr-2 h-4 w-4 fill-current" />
                            LIVE
                        </Link>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={handleLeaveTable}
                        disabled={isLeaving}
                    >
                        {isLeaving ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <LogOut className="mr-2 h-4 w-4" />
                        )}
                        Quitter
                    </Button>
                </div>
            </div>
        </div>
    );
}
