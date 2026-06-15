"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";
import { useInvitationStore } from "@/store/invitation-store";

type GroupInvitationAcceptButtonProps = Readonly<{
    token: string;
}>;

export function GroupInvitationAcceptButton({ token }: GroupInvitationAcceptButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const router = useRouter();
    const acceptGroupInvitation = useInvitationStore((state) => state.acceptGroupInvitation);

    const handleAccept = async () => {
        setIsLoading(true);
        const result = await acceptGroupInvitation(token);

        if (result.success && result.redirectTo) {
            setIsSuccess(true);
            router.push(result.redirectTo);
            router.refresh();
        } else {
            alert(result.error || "Une erreur est survenue.");
        }
        setIsLoading(false);
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
