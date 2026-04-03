import { Shield, User, Eye } from "lucide-react";
import { TableRole } from "@/types/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RoleBadgeProps {
    role: TableRole;
    className?: string;
    showIcon?: boolean;
    size?: "default" | "sm";
}

const roleConfigs = {
    gm: {
        label: "Maître du Jeu",
        shortLabel: "MJ",
        icon: Shield,
        variant: "default" as const,
    },
    player: {
        label: "Joueur",
        shortLabel: "Joueur",
        icon: User,
        variant: "secondary" as const,
    },
    observer: {
        label: "Observateur",
        shortLabel: "Obs.",
        icon: Eye,
        variant: "outline" as const,
    },
};

export function RoleBadge({ role, className, showIcon = true, size = "default" }: RoleBadgeProps) {
    const config = roleConfigs[role];
    const Icon = config.icon;

    return (
        <Badge
            variant={config.variant}
            className={cn("gap-1.5", size === "sm" && "px-2 py-0 text-[10px]", className)}
        >
            {showIcon && <Icon size={size === "sm" ? 10 : 12} />}
            <span className="truncate">{size === "sm" ? config.shortLabel : config.label}</span>
        </Badge>
    );
}
