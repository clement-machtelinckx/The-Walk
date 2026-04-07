import { requireAuth } from "@/lib/auth/server";
import { SessionService } from "@/lib/services/sessions/session-service";
import { MembershipService } from "@/lib/services/memberships/membership-service";
import { redirect } from "next/navigation";
import { LiveSessionHub } from "@/components/session/live-session-hub";
import { PageShell } from "@/components/layout/app-shell";

export default async function TableLiveSessionPage({
    params,
}: {
    params: Promise<{ tableId: string; sessionId: string }>;
}) {
    const user = await requireAuth();
    const { tableId, sessionId } = await params;

    // 1. Vérifier la session
    const session = await SessionService.getSessionById(user.id, sessionId);

    // 2. Vérifier si elle est active. Si non, on redirige.
    if (session.status !== "active") {
        redirect(`/tables/${tableId}`);
    }

    // 3. Récupérer le rôle
    const membership = await MembershipService.requireMembership(user.id, tableId);

    return (
        <PageShell>
            <LiveSessionHub session={session} tableId={tableId} myRole={membership.role} />
        </PageShell>
    );
}
