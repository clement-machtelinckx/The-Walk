import { EmptyState } from "@/components/special/empty-state";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";

interface NextSessionEmptyStateProps {
    canCreate: boolean;
    onCreate?: () => void;
}

export function NextSessionEmptyState({ canCreate, onCreate }: NextSessionEmptyStateProps) {
    return (
        <EmptyState
            title="Aucune session planifiée"
            description="Il n'y a pas de prochaine session prévue pour le moment."
            icon={Calendar}
        >
            {canCreate && (
                <Button onClick={onCreate} className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Planifier une session
                </Button>
            )}
        </EmptyState>
    );
}
