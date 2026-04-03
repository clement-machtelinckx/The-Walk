"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";

interface InvitationAcceptButtonProps {
    token: string;
}

export function InvitationAcceptButton({ token }: InvitationAcceptButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const router = useRouter();

    const handleAccept = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/invitations/${token}/accept`, {
                method: "POST",
            });

            const result = await response.json();

            if (!response.ok) {
                setError(result.error || "Une erreur est survenue.");
                setIsLoading(false);
                return;
            }

            setIsSuccess(true);

            // Short delay to show success state
            setTimeout(() => {
                router.push(result.redirectTo || "/tables");
                router.refresh();
            }, 1000);
        } catch (err) {
            setError("Erreur réseau ou serveur.");
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="text-primary flex flex-col items-center gap-2 font-medium">
                <CheckCircle2 size={32} className="animate-in zoom-in" />
                <span>Invitation acceptée ! Redirection...</span>
            </div>
        );
    }

    return (
        <div className="mx-auto flex w-full max-w-xs flex-col gap-4">
            <Button onClick={handleAccept} disabled={isLoading} size="lg" className="w-full">
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Acceptation...
                    </>
                ) : (
                    "Rejoindre la table"
                )}
            </Button>

            {error && (
                <p className="text-destructive bg-destructive/10 rounded p-2 text-center text-sm font-medium">
                    {error}
                </p>
            )}
        </div>
    );
}
