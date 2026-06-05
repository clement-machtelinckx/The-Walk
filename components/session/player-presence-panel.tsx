"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePolling } from "@/lib/hooks/use-polling";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useSessionStore } from "@/store/session-store";
import { useTableStore } from "@/store/table-store";
import type { PresenceStatus, ResponseStatus, RollCallMember } from "@/types/session";
import { Check, Clock, Loader2, MoreHorizontal, Users, X } from "lucide-react";
import { PresenceRollCallDialog } from "./presence-block";
import { PrivateConversationPanel } from "./private-conversation-panel";
import { AvatarCircle } from "@/components/ui/avatar-circle";

const PRESENCE_META: Record<
    PresenceStatus,
    {
        label: string;
        className: string;
        icon: typeof Check;
    }
> = {
    present: {
        label: "Présent",
        className: "border-green-500/20 bg-green-500/10 text-green-600",
        icon: Check,
    },
    late: {
        label: "Retard",
        className: "border-amber-500/20 bg-amber-500/10 text-amber-600",
        icon: Clock,
    },
    absent: {
        label: "Absent",
        className: "border-red-500/20 bg-red-500/10 text-red-600",
        icon: X,
    },
};

const RSVP_LABELS: Partial<Record<ResponseStatus, string>> = {
    going: "RSVP oui",
    maybe: "RSVP peut-être",
    declined: "RSVP non",
    pending: "RSVP en attente",
};

type PanelMember = RollCallMember & {
    role?: string;
    hasSessionPresence: boolean;
};

type PlayerAvatarProps = Readonly<{
    member: PanelMember;
}>;

function PlayerAvatar({ member }: PlayerAvatarProps) {
    return (
        <AvatarCircle
            avatarKey={member.avatar_key}
            name={member.display_name}
            size="lg"
            className="rounded-md"
        />
    );
}

function PresenceBadge({ status }: Readonly<{ status: PresenceStatus }>) {
    const meta = PRESENCE_META[status];
    const Icon = meta.icon;

    return (
        <Badge variant="outline" className={cn("gap-1 px-2 py-0 text-[10px]", meta.className)}>
            <Icon className="h-3 w-3" />
            {meta.label}
        </Badge>
    );
}

export function PlayerPresencePanel({
    tableId,
    sessionId,
    isGM,
}: Readonly<{
    tableId: string;
    sessionId?: string;
    isGM: boolean;
}>) {
    const { presenceData, fetchPresence, isLoadingPresence } = useSessionStore();
    const { membersByTable, loadingMembersByTable, fetchMembers } = useTableStore();
    const { user } = useAuthStore();
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    const data = sessionId ? presenceData[sessionId] : null;
    const rollCall = useMemo(() => data?.rollCall || [], [data?.rollCall]);
    const summary = data?.summary;
    const tableMembers = useMemo(() => membersByTable[tableId] || [], [membersByTable, tableId]);
    const isLoadingMembers = loadingMembersByTable[tableId] || false;

    useEffect(() => {
        fetchMembers(tableId);
    }, [fetchMembers, tableId]);

    const fetchFn = useCallback(() => {
        if (!sessionId) return Promise.resolve();
        return fetchPresence(sessionId).then(() => undefined);
    }, [sessionId, fetchPresence]);
    usePolling(fetchFn, { interval: 20000, enabled: Boolean(sessionId) });

    const players = useMemo<PanelMember[]>(() => {
        const presenceByUser = new Map(rollCall.map((member) => [member.user_id, member]));

        if (tableMembers.length === 0) {
            return rollCall.map((member) => ({ ...member, hasSessionPresence: true }));
        }

        return tableMembers.map((member) => {
            const presence = presenceByUser.get(member.userId);

            return {
                user_id: member.userId,
                display_name:
                    presence?.display_name ||
                    member.profile.display_name ||
                    member.profile.email ||
                    "Utilisateur",
                avatar_url: presence?.avatar_url || member.profile.avatar_url,
                avatar_key: presence?.avatar_key || member.profile.avatar_key,
                status: presence?.status || "absent",
                rsvp_status: presence?.rsvp_status,
                role: member.role,
                hasSessionPresence: Boolean(presence),
            };
        });
    }, [rollCall, tableMembers]);

    const selectedMember = useMemo(
        () =>
            players.find((member) => member.user_id === selectedUserId) ||
            players.find((member) => member.user_id !== user?.id) ||
            players[0],
        [players, selectedUserId, user?.id],
    );

    if ((isLoadingMembers && players.length === 0) || (isLoadingPresence && players.length === 0)) {
        return (
            <div className="flex justify-center py-10">
                <Loader2 className="text-primary/50 h-6 w-6 animate-spin" />
            </div>
        );
    }

    if (players.length === 0) {
        return (
            <div className="bg-muted/30 rounded-md border border-dashed p-4 text-sm">
                <p className="font-semibold">Aucun joueur à afficher.</p>
                <p className="text-muted-foreground mt-1 text-xs">
                    Les membres de la table apparaîtront ici.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {summary && (
                <div className="bg-muted/30 rounded-md border p-3">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-xs font-bold tracking-wide uppercase">Présence</p>
                            <p className="text-muted-foreground text-[11px]">
                                {summary.total} joueur{summary.total > 1 ? "s" : ""} dans le live
                            </p>
                        </div>
                        {isGM && sessionId && (
                            <PresenceRollCallDialog
                                sessionId={sessionId}
                                trigger={
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-primary/20 h-8 gap-1.5 text-xs"
                                    >
                                        <Users className="h-3.5 w-3.5" />
                                        Appel
                                    </Button>
                                }
                            />
                        )}
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                        <div className="bg-background/60 rounded-md border p-2">
                            <p className="text-lg leading-none font-black text-green-600">
                                {summary.present}
                            </p>
                            <p className="text-muted-foreground mt-1 text-[10px] font-semibold uppercase">
                                Présents
                            </p>
                        </div>
                        <div className="bg-background/60 rounded-md border p-2">
                            <p className="text-lg leading-none font-black text-amber-600">
                                {summary.late}
                            </p>
                            <p className="text-muted-foreground mt-1 text-[10px] font-semibold uppercase">
                                Retards
                            </p>
                        </div>
                        <div className="bg-background/60 rounded-md border p-2">
                            <p className="text-lg leading-none font-black text-red-600">
                                {summary.absent}
                            </p>
                            <p className="text-muted-foreground mt-1 text-[10px] font-semibold uppercase">
                                Absents
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {!sessionId && (
                <div className="bg-muted/30 rounded-md border border-dashed p-3">
                    <p className="text-xs font-bold tracking-wide uppercase">Présence live</p>
                    <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
                        La liste ci-dessous vient de la table. Les statuts de présence et
                        l&apos;appel MJ seront disponibles quand une session sera associée au
                        drawer.
                    </p>
                </div>
            )}

            <div className="space-y-2">
                {players.map((member) => {
                    const isSelected = member.user_id === selectedMember?.user_id;

                    return (
                        <button
                            key={member.user_id}
                            type="button"
                            className={cn(
                                "hover:bg-muted/50 flex w-full items-center gap-3 rounded-md border p-3 text-left transition-colors",
                                isSelected && "border-primary/40 bg-primary/5",
                            )}
                            onClick={() => setSelectedUserId(member.user_id)}
                        >
                            <PlayerAvatar member={member} />
                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-bold">
                                    {member.display_name || "Anonyme"}
                                </span>
                                <span className="text-muted-foreground mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
                                    {member.hasSessionPresence ? (
                                        <PresenceBadge status={member.status} />
                                    ) : (
                                        <span>
                                            {member.role === "gm"
                                                ? "MJ"
                                                : member.role === "observer"
                                                  ? "Observateur"
                                                  : "Joueur"}
                                        </span>
                                    )}
                                    {member.rsvp_status && (
                                        <span>{RSVP_LABELS[member.rsvp_status]}</span>
                                    )}
                                </span>
                            </span>
                            <MoreHorizontal className="text-muted-foreground h-4 w-4 shrink-0" />
                        </button>
                    );
                })}
            </div>

            {selectedMember && (
                <div className="bg-muted/20 rounded-md border p-3">
                    <div className="flex items-center gap-3">
                        <PlayerAvatar member={selectedMember} />
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold">
                                {selectedMember.display_name || "Anonyme"}
                            </p>
                            <p className="text-muted-foreground text-[11px]">
                                {sessionId
                                    ? "Cible prête pour les futures actions privées."
                                    : "Membre de table prêt pour les futures actions privées."}
                            </p>
                        </div>
                    </div>
                    <div className="mt-3">
                        <PrivateConversationPanel
                            tableId={tableId}
                            sessionId={sessionId}
                            recipientUserId={selectedMember.user_id}
                            recipientName={selectedMember.display_name || "Anonyme"}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
