"use client";

import { useEffect } from "react";
import { PageErrorState } from "@/components/special/page-error-state";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("[APP_ERROR]", error);
    }, [error]);

    return (
        <main className="flex min-h-dvh items-center justify-center px-4 py-12">
            <PageErrorState
                title="Oups, cette page a rencontré un problème."
                description="Une erreur inattendue empêche l'affichage de cette page. Vous pouvez réessayer ou revenir à l'accueil."
                primaryAction={{
                    label: "Réessayer",
                    onClick: reset,
                }}
                secondaryAction={{
                    label: "Retour à l'accueil",
                    href: "/",
                }}
            />
        </main>
    );
}
