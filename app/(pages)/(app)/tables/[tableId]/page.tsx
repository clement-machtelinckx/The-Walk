import { requireAuth } from "@/lib/auth/server";
import { TableService } from "@/lib/services/tables/table-service";
import { MembershipService } from "@/lib/services/memberships/membership-service";
import { PageShell } from "@/components/layout/app-shell";
import { TableHeader } from "@/components/table/table-header";
import { MemberList } from "@/components/table/member-list";
import { NextSessionSummary } from "@/components/table/next-session-summary";
import { SessionHistory } from "@/components/table/session-history";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { formatShortDate } from "@/lib/utils/date";

export async function generateMetadata({ params }: { params: Promise<{ tableId: string }> }) {
    const { tableId } = await params;
    return {
        title: `Table ${tableId}`,
    };
}

export default async function TableDetailPage({
    params,
}: {
    params: Promise<{ tableId: string }>;
}) {
    const user = await requireAuth();
    const { tableId } = await params;

    const details = await TableService.getTableDetails(user.id, tableId);
    const members = await MembershipService.listMembers(tableId);

    return (
        <PageShell>
            <div className="space-y-8 py-4">
                <TableHeader
                    tableId={tableId}
                    name={details.table.name}
                    description={details.table.description}
                    myRole={details.myRole}
                />

                <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-3">
                    <div className="space-y-6 md:col-span-2">
                        {/* Summary / Main Feed */}
                        <NextSessionSummary 
                            tableId={tableId} 
                            session={details.nextSession} 
                            activeSession={details.activeSession}
                        />

                        <SessionHistory tableId={tableId} />
                    </div>

                    <div className="space-y-6">
                        <MemberList tableId={tableId} members={members} myRole={details.myRole} />

                        {/* Quick Stats / Info */}
                        <Card className="bg-card/50 space-y-3 p-4 text-sm shadow-sm">
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                                    Date de création
                                </span>
                                <span className="text-xs font-medium">
                                    {formatShortDate(details.table.created_at)}
                                </span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                                    Identifiant Table
                                </span>
                                <span className="bg-muted ml-2 truncate rounded px-1 font-mono text-[10px]">
                                    {tableId}
                                </span>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </PageShell>
    );
}
