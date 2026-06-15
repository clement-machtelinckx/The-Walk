"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { formatFullDate } from "@/lib/utils/date";
import type { Session } from "@/types/session";
import { Calendar, FileText } from "lucide-react";

const statusLabels = {
    scheduled: "Planifiée",
    active: "En cours",
    completed: "Terminée",
    cancelled: "Annulée",
};

type SessionDetailsSheetProps = Readonly<{
    session: Session;
}>;

export function SessionDetailsSheet({ session }: SessionDetailsSheetProps) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                    <FileText />
                    Détails
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[94vw] overflow-y-auto sm:max-w-md">
                <SheetHeader className="border-b pr-12">
                    <div className="flex items-center gap-2">
                        <Badge variant={session.status === "active" ? "success" : "outline"}>
                            {statusLabels[session.status]}
                        </Badge>
                    </div>
                    <SheetTitle className="text-xl">{session.title}</SheetTitle>
                    <SheetDescription className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatFullDate(session.scheduled_at)}
                    </SheetDescription>
                </SheetHeader>
                <div className="space-y-2 px-4 pb-6">
                    <h3 className="text-sm font-semibold">Description</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                        {session.description || "Aucune description pour cette session."}
                    </p>
                </div>
            </SheetContent>
        </Sheet>
    );
}
