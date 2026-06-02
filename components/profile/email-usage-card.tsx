"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Loader2, Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { EmailUsageSummary } from "@/types/email";

interface EmailUsageResponse {
    usage: EmailUsageSummary;
}

export function EmailUsageCard() {
    const [usage, setUsage] = useState<EmailUsageSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function fetchUsage() {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch("/api/email/usage");
                const payload = (await response.json()) as Partial<EmailUsageResponse> & {
                    error?: string;
                };

                if (!response.ok || !payload.usage) {
                    throw new Error(payload.error || "Impossible de charger l'usage email.");
                }

                if (isMounted) {
                    setUsage(payload.usage);
                }
            } catch (fetchError) {
                if (isMounted) {
                    setError(
                        fetchError instanceof Error
                            ? fetchError.message
                            : "Impossible de charger l'usage email.",
                    );
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        fetchUsage();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <Card className="border-primary/10 bg-card/50 shadow-sm">
            <CardHeader className="flex flex-row items-center gap-4">
                <div className="bg-primary/10 text-primary rounded-full p-2.5">
                    <Mail size={22} />
                </div>
                <div>
                    <CardTitle className="text-xl">Emails transactionnels</CardTitle>
                    <CardDescription>
                        Suivez votre quota mensuel pour les emails envoyés depuis l&apos;app.
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Chargement de l&apos;usage email...
                    </div>
                ) : error ? (
                    <div className="text-destructive flex items-center gap-2 text-sm font-medium">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                    </div>
                ) : usage ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div className="bg-muted/40 rounded-lg border p-3">
                                <p className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                                    Quota mensuel
                                </p>
                                <p className="mt-1 text-xl font-bold">{usage.limit}</p>
                            </div>
                            <div className="bg-muted/40 rounded-lg border p-3">
                                <p className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                                    Envoyés ce mois
                                </p>
                                <p className="mt-1 text-xl font-bold">{usage.sentThisMonth}</p>
                            </div>
                            <div className="bg-muted/40 rounded-lg border p-3">
                                <p className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                                    Restants
                                </p>
                                <p className="mt-1 text-xl font-bold">{usage.remaining}</p>
                            </div>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            Le quota est réinitialisé chaque début de mois.
                        </p>
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
}
