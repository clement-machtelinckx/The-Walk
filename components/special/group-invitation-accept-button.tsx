"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";

interface GroupInvitationAcceptButtonProps {
    token: string;
}

export function GroupInvitationAcceptButton({ token }: GroupInvitationAcceptButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const router = useRouter();

    const handleAccept = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/group-invitations/${token}/accept`, {
                method: "POST",
            });
            const data = await res.json();

            if (res.ok) {
                setIsSuccess(true);
                router.push(data.redirectTo);
                router.refresh();
            } else {
                alert(data.error || "Une erreur est survenue.");
            }
        } catch (error) {
            alert("Erreur réseau.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleAccept}
            disabled={isLoading || isSuccess}
            size="lg"
            className="w-full text-lg font-bold"
        >
            {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : isSuccess ? (
                <Check className="mr-2 h-5 w-5" />
            ) : null}
            {isSuccess ? "Invitation acceptée !" : "Rejoindre la table"}
        </Button>
    );
}
