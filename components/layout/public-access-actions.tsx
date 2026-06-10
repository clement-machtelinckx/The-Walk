"use client";

import Link from "next/link";
import { ArrowRight, LogIn } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PublicAccessActionsProps = Readonly<{
    compact?: boolean;
    className?: string;
}>;

export function PublicAccessActions({ compact = false, className }: PublicAccessActionsProps) {
    const { status } = useAuth();

    if (status === "loading") {
        return (
            <Button
                className={cn(!compact && "h-12 px-6", className)}
                size={compact ? "sm" : "lg"}
                variant="outline"
                disabled
            >
                Accès à l’app
            </Button>
        );
    }

    if (status === "authenticated") {
        return (
            <Button
                className={cn(!compact && "h-12 px-6", className)}
                size={compact ? "sm" : "lg"}
                asChild
            >
                <Link href="/tables">
                    {compact ? "Mes tables" : "Ouvrir l’app"}
                    <ArrowRight />
                </Link>
            </Button>
        );
    }

    return (
        <div
            className={cn("flex items-center gap-2", !compact && "flex-col sm:flex-row", className)}
        >
            <Button
                className={cn(!compact && "h-12 w-full px-6 sm:w-auto")}
                size={compact ? "sm" : "lg"}
                asChild
            >
                <Link href="/register">
                    {compact ? "Inscription" : "Créer un compte"}
                    {!compact && <ArrowRight />}
                </Link>
            </Button>
            <Button
                className={cn(!compact && "h-12 w-full px-6 sm:w-auto")}
                size={compact ? "sm" : "lg"}
                variant="outline"
                asChild
            >
                <Link href="/login">
                    {!compact && <LogIn />}
                    Connexion
                </Link>
            </Button>
        </div>
    );
}
