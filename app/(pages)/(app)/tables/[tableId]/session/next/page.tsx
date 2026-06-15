import { requireAuth } from "@/lib/auth/server";
import { MembershipService } from "@/lib/services/memberships/membership-service";
import { notFound, redirect } from "next/navigation";
import { ForbiddenError } from "@/lib/errors";

export default async function NextSessionPage({
    params,
}: {
    params: Promise<{ tableId: string }>;
}) {
    const user = await requireAuth();
    const { tableId } = await params;

    try {
        await MembershipService.requireMembership(user.id, tableId);
    } catch (error) {
        if (error instanceof ForbiddenError) {
            notFound();
        }
        throw error;
    }

    redirect(`/tables/${tableId}`);
}
