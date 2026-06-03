import { Search } from "lucide-react";
import { PageErrorState } from "@/components/special/page-error-state";

export default function NotFound() {
    return (
        <main className="flex min-h-dvh items-center justify-center px-4 py-12">
            <PageErrorState
                title="Ressource introuvable"
                description="La page demandée n'existe pas, a peut-être été supprimée, ou vous n'avez plus accès à cet espace."
                icon={Search}
                primaryAction={{
                    label: "Retour à l'accueil",
                    href: "/",
                }}
                secondaryAction={{
                    label: "Mes tables",
                    href: "/tables",
                }}
            />
        </main>
    );
}
