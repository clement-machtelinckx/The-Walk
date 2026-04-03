"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/layout/app-shell";

export default function ProfilePage() {
    const { user, logout } = useAuth();

    if (!user) {
        return null; // Handled by middleware redirect
    }

    const initials = user.profile?.display_name
        ? user.profile.display_name.substring(0, 2).toUpperCase()
        : user.email.substring(0, 2).toUpperCase();

    return (
        <PageShell title="Mon Compte" description="Gérez votre profil et vos préférences.">
            <div className="max-w-2xl space-y-6">
                <div className="app-card overflow-hidden">
                    <div className="bg-muted h-24 sm:h-32" />
                    <div className="px-6 pb-6">
                        <div className="relative -mt-12 mb-4">
                            <div className="border-card bg-primary text-primary-foreground flex h-24 w-24 items-center justify-center rounded-full border-4 text-3xl font-bold">
                                {initials}
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold">
                            {user.profile?.display_name || "Utilisateur"}
                        </h2>
                        <p className="text-muted-foreground">{user.email}</p>
                    </div>
                </div>

                <div className="app-list">
                    <div className="app-list-item">
                        <div className="space-y-0.5">
                            <span className="text-muted-foreground/60 text-sm font-semibold tracking-wide uppercase">
                                Rôle Principal
                            </span>
                            <p className="text-lg font-medium">Joueur</p>
                        </div>
                    </div>
                    <div className="app-list-item">
                        <div className="space-y-0.5">
                            <span className="text-muted-foreground/60 text-sm font-semibold tracking-wide uppercase">
                                Email de connexion
                            </span>
                            <p className="text-lg font-medium">{user.email}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => logout()}
                        className="app-list-item w-full text-left"
                    >
                        <div className="text-destructive space-y-0.5">
                            <p className="font-medium">Se déconnecter</p>
                        </div>
                    </button>
                </div>
            </div>
        </PageShell>
    );
}
