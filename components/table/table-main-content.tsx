"use client";

import { useState } from "react";
import { NextSessionSummary } from "@/components/table/next-session-summary";
import { TableDiscussionBlock } from "@/components/session/table-discussion-block";
import type { Session } from "@/types/session";
import type { TableRole } from "@/types/table";

type TableMainContentProps = Readonly<{
    tableId: string;
    nextSession: Session | null;
    activeSession: Session | null;
    myRole: TableRole;
}>;

export function TableMainContent({
    tableId,
    nextSession: initialNextSession,
    activeSession,
    myRole,
}: TableMainContentProps) {
    const [nextSession, setNextSession] = useState(initialNextSession);
    const contextSession = activeSession ?? nextSession;

    return (
        <div className="space-y-6">
            <NextSessionSummary
                tableId={tableId}
                session={nextSession}
                activeSession={activeSession}
                myRole={myRole}
                onSessionChange={setNextSession}
            />

            <TableDiscussionBlock
                tableId={tableId}
                sessionId={contextSession?.id}
                context={activeSession ? "live" : "table"}
            />
        </div>
    );
}
