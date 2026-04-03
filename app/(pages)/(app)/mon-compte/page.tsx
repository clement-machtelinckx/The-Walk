import { requireAuth } from "@/lib/auth/server";
import { PageShell } from "@/components/layout/app-shell";
import { ProfileContent } from "./_components/profile-content";

export const metadata = {
    title: "Mon Compte",
};

export default async function ProfilePage() {
    // 1. Server-side guard (blocks until user is ready or redirects)
    const user = await requireAuth();

    return (
        <PageShell title="Mon Compte" description="Gérez votre profil et vos préférences.">
            <ProfileContent user={user} />
        </PageShell>
    );
}
