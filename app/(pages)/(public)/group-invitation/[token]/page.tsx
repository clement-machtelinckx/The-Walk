import { getCurrentUser } from "@/lib/auth/server";
import {
    GroupInvitationService,
    GroupInvitationWithTable,
} from "@/lib/services/invitations/group-invitation-service";
import { PageShell } from "@/components/layout/app-shell";
import { PageErrorState } from "@/components/special/page-error-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, AlertCircle } from "lucide-react";
import Link from "next/link";
import { RoleBadge } from "@/components/special/role-badge";
import { GroupInvitationAcceptButton } from "@/components/special/group-invitation-accept-button";

export const metadata = {
    title: "Invitation de groupe",
    description: "Rejoignez une table sur The-Walk via un lien de groupe.",
};

export default async function GroupInvitationPage({
    params,
}: {
    params: Promise<{ token: string }>;
}) {
    const { token } = await params;
    const user = await getCurrentUser();
    const invitationPath = `/group-invitation/${token}`;

    let invitation: GroupInvitationWithTable | null = null;
    let errorMessage: string | null = null;

    try {
        invitation = await GroupInvitationService.getByToken(token);
    } catch (error: unknown) {
        errorMessage =
            error instanceof Error
                ? error.message
                : "Ce lien d'invitation n'est plus valide ou a expiré.";
    }

    if (errorMessage || !invitation) {
        return (
            <PageShell className="mx-auto max-w-md pt-12">
                <PageErrorState
                    title="Lien d'invitation indisponible"
                    description={errorMessage || "Ce lien d'invitation est introuvable."}
                    icon={AlertCircle}
                    primaryAction={{
                        label: "Réessayer",
                        href: invitationPath,
                    }}
                    secondaryAction={{
                        label: "Retour à l'accueil",
                        href: "/",
                    }}
                />
            </PageShell>
        );
    }

    return (
        <PageShell className="mx-auto max-w-md pt-12">
            <Card className="border-primary/20 overflow-hidden shadow-xl">
                <div className="bg-primary/5 border-primary/10 flex flex-col items-center border-b p-8">
                    <div className="bg-primary/10 text-primary mb-4 rounded-full p-4">
                        <Users size={48} />
                    </div>
                    <h1 className="text-center text-2xl font-bold">Lien d&apos;invitation</h1>
                    <p className="text-primary mt-2 text-center text-3xl font-bold italic">
                        {invitation.tables.name}
                    </p>
                </div>

                <CardContent className="space-y-8 p-8">
                    <div className="space-y-4 text-center">
                        <p className="text-muted-foreground">
                            Vous pouvez rejoindre cette table avec le rôle :
                        </p>
                        <div className="flex justify-center">
                            <RoleBadge role={invitation.role} />
                        </div>
                    </div>

                    {user ? (
                        <div className="space-y-6 text-center">
                            <div className="bg-muted/50 space-y-1 rounded-lg p-4 text-sm">
                                <p className="text-muted-foreground text-[10px] font-medium tracking-widest uppercase">
                                    Connecté en tant que
                                </p>
                                <p className="font-bold">{user.email}</p>
                            </div>
                            <GroupInvitationAcceptButton token={token} />
                        </div>
                    ) : (
                        <div className="space-y-6 text-center">
                            <div className="bg-muted/50 rounded-lg border border-dashed p-4 text-sm">
                                <p className="text-muted-foreground">
                                    Vous devez être connecté pour accepter cette invitation.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                <Button asChild size="lg" className="w-full">
                                    <Link
                                        href={`/login?next=${encodeURIComponent(invitationPath)}`}
                                    >
                                        Se connecter
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" size="lg" className="w-full">
                                    <Link
                                        href={`/register?next=${encodeURIComponent(invitationPath)}`}
                                    >
                                        Créer un compte
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </PageShell>
    );
}
