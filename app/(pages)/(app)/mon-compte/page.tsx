import type { Metadata } from "next";
import { PageShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
    title: "Mon Compte",
};

export default function ProfilePage() {
    return (
        <PageShell title="Mon Compte" description="Gérez votre profil et vos préférences.">
            <div className="max-w-2xl space-y-6">
                <div className="app-card overflow-hidden">
                    <div className="bg-muted h-24 sm:h-32" />
                    <div className="px-6 pb-6">
                        <div className="relative -mt-12 mb-4">
                            <div className="border-card bg-primary text-primary-foreground flex h-24 w-24 items-center justify-center rounded-full border-4 text-3xl font-bold">
                                JD
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold">Jean-Dés</h2>
                        <p className="text-muted-foreground">mj-master@the-walk.fr</p>
                    </div>
                </div>

                <div className="app-list">
                    <div className="app-list-item">
                        <div className="space-y-0.5">
                            <span className="text-muted-foreground/60 text-sm font-semibold tracking-wide uppercase">
                                Rôle Principal
                            </span>
                            <p className="text-lg font-medium">Maître de Jeu (MJ)</p>
                        </div>
                    </div>
                    <div className="app-list-item">
                        <div className="space-y-0.5">
                            <span className="text-muted-foreground/60 text-sm font-semibold tracking-wide uppercase">
                                Tables actives
                            </span>
                            <p className="text-lg font-medium">3 tables en cours</p>
                        </div>
                    </div>
                    <div className="app-list-item">
                        <div className="text-destructive space-y-0.5">
                            <p className="font-medium">Se déconnecter</p>
                        </div>
                    </div>
                </div>
            </div>
        </PageShell>
    );
}
