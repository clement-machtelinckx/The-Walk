import * as React from "react";
import type { LucideIcon as LucideIconType } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
    icon: LucideIconType;
    className?: string;
};

export default function LucideIcon({ icon: Icon, className }: Props) {
    return <Icon className={cn("shrink-0", className)} aria-hidden />;
}