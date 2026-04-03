import { TableMemberDTO } from "@/lib/services/memberships/membership-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { RoleBadge } from "@/components/special/role-badge";

interface MemberListProps {
    members: TableMemberDTO[];
}

export function MemberList({ members }: MemberListProps) {
    return (
        <Card className="bg-card/50 h-full">
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

                        return (
                            <div
                                key={member.userId}
                                className="hover:bg-muted/50 flex items-center justify-between gap-3 rounded-lg p-2 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 text-primary border-primary/20 flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold">
                                        {initials}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm leading-none font-medium">
                                            {member.profile.display_name || "Utilisateur"}
                                        </span>
                                        <span className="text-muted-foreground line-clamp-1 text-xs">
                                            {member.profile.email}
                                        </span>
                                    </div>
                                </div>
                                <RoleBadge role={member.role} size="sm" showIcon={false} />
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
