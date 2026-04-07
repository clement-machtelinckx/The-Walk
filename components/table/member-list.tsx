"use client";

import { useState } from "react";
import { TableMemberDTO } from "@/lib/services/memberships/membership-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserMinus, Loader2 } from "lucide-react";
import { RoleBadge } from "@/components/special/role-badge";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useTableStore } from "@/store/table-store";

interface MemberListProps {
    tableId: string;
    members: TableMemberDTO[];
    myRole: string;
}

export function MemberList({ tableId, members, myRole }: MemberListProps) {
    const { user } = useAuth();
    const router = useRouter();
    const { removeMember } = useTableStore();
    const [removingId, setRemovingId] = useState<string | null>(null);

    const handleRemoveMember = async (memberId: string) => {
        if (!confirm("Êtes-vous sûr de vouloir retirer ce membre ?")) return;

        setRemovingId(memberId);
        const result = await removeMember(tableId, memberId);

        if (result.success) {
            router.refresh();
        } else {
            alert(result.error || "Une erreur est survenue.");
        }
        setRemovingId(null);
    };

    return (
        <Card className="bg-card/50">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                    <Users size={18} className="text-primary" />
                    Membres ({members.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {members.map((member) => {
                        const initials = member.profile.display_name
                            ? member.profile.display_name.substring(0, 2).toUpperCase()
                            : member.profile.email.substring(0, 2).toUpperCase();

                        const isMe = user?.id === member.userId;
                        const canBeRemoved = myRole === "gm" && !isMe && member.role !== "gm";

                        return (
                            <div
                                key={member.userId}
                                className="hover:bg-muted/50 flex items-center justify-between gap-3 rounded-lg p-2 transition-colors"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="bg-primary/10 text-primary border-primary/20 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold">
                                        {initials}
                                    </div>
                                    <div className="flex min-w-0 flex-col">
                                        <span className="truncate text-sm leading-none font-medium">
                                            {member.profile.display_name || "Utilisateur"}
                                            {isMe && " (Vous)"}
                                        </span>
                                        <span className="text-muted-foreground line-clamp-1 text-[10px]">
                                            {member.profile.email}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <RoleBadge role={member.role} size="sm" showIcon={false} />
                                    {canBeRemoved && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-muted-foreground hover:text-destructive h-7 w-7"
                                            onClick={() => handleRemoveMember(member.userId)}
                                            disabled={removingId === member.userId}
                                        >
                                            {removingId === member.userId ? (
                                                <Loader2 size={14} className="animate-spin" />
                                            ) : (
                                                <UserMinus size={14} />
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
