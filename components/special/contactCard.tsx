import Link from "next/link";
import type { LucideIcon as LucideIconType } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LucideIcon from "@/components/ui/icon";
import { cn } from "@/lib/utils";

type ContactCardProps = {
    title: string;
    buttonLabel: string;
    icon: LucideIconType;
    className?: string;

    href?: string;
    onClick?: () => void;
};

export function ContactCard({
    title,
    href,
    onClick,
    buttonLabel,
    icon,
    className,
}: ContactCardProps) {
    const isAction = typeof onClick === "function";

    return (
        <Card className={cn("rounded-2xl shadow-sm", className)}>
            <CardContent className="flex flex-col items-center gap-5 p-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <LucideIcon icon={icon} className="h-7 w-7" />
                </div>

                <h2 className="text-base font-semibold tracking-wide">{title}</h2>

                {isAction ? (
                    <Button type="button" onClick={onClick} className="rounded-full px-6">
                        <span className="inline-flex items-center gap-2">
                            <span aria-hidden>›</span>
                            {buttonLabel}
                        </span>
                    </Button>
                ) : (
                    <Button asChild className="rounded-full px-6">
                        <Link href={href ?? "#"} className="inline-flex items-center gap-2">
                            <span aria-hidden>›</span>
                            {buttonLabel}
                        </Link>
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}