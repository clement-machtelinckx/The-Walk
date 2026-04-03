import { cn } from "@/lib/utils";
import { Coffee, LucideIcon } from "lucide-react";

interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    children?: React.ReactNode;
    className?: string;
    variant?: "default" | "compact" | "dashed";
}

export function EmptyState({
    title,
    description,
    icon: Icon = Coffee,
    children,
    className,
    variant = "default",
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center text-center",
                variant === "default" && "space-y-4 py-20",
                variant === "compact" && "space-y-2 py-8",
                variant === "dashed" &&
                    "border-muted bg-muted/5 rounded-xl border-2 border-dashed py-8",
                className,
            )}
        >
            <div
                className={cn(
                    "bg-muted text-muted-foreground/30 flex items-center justify-center rounded-full",
                    variant === "default" ? "p-6" : "p-3",
                )}
            >
                <Icon size={variant === "default" ? 48 : 24} />
            </div>
            <div className={cn("space-y-2", variant === "default" ? "max-w-sm" : "max-w-xs")}>
                <h3 className={cn("font-bold", variant === "default" ? "text-xl" : "text-base")}>
                    {title}
                </h3>
                {description && <p className="text-muted-foreground text-sm">{description}</p>}
            </div>
            {children && <div className="mt-4">{children}</div>}
        </div>
    );
}
