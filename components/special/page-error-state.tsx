import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PageErrorStateProps {
    title: string;
    description: string;
    icon?: LucideIcon;
    primaryAction?: {
        label: string;
        onClick?: () => void;
        href?: string;
    };
    secondaryAction?: {
        label: string;
        href: string;
    };
}

export function PageErrorState({
    title,
    description,
    icon: Icon = AlertTriangle,
    primaryAction,
    secondaryAction,
}: PageErrorStateProps) {
    return (
        <Card className="border-primary/10 mx-auto w-full max-w-md shadow-sm">
            <CardContent className="flex flex-col items-center px-6 py-10 text-center">
                <div className="bg-primary/10 text-primary mb-5 rounded-full p-4">
                    <Icon className="h-8 w-8" />
                </div>
                <h1 className="text-2xl font-bold">{title}</h1>
                <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{description}</p>
                {(primaryAction || secondaryAction) && (
                    <div className="mt-6 grid w-full grid-cols-1 gap-3">
                        {primaryAction?.href ? (
                            <Button asChild>
                                <Link href={primaryAction.href}>{primaryAction.label}</Link>
                            </Button>
                        ) : primaryAction?.onClick ? (
                            <Button onClick={primaryAction.onClick}>{primaryAction.label}</Button>
                        ) : null}
                        {secondaryAction && (
                            <Button asChild variant="outline">
                                <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
