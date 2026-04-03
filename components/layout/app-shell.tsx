import { cn } from "@/lib/utils";
import { Container } from "./container";

interface PageShellProps {
    title?: string;
    description?: string;
    children: React.ReactNode;
    actions?: React.ReactNode;
    className?: string;
}

export function PageShell({ title, description, children, actions, className }: PageShellProps) {
    return (
        <div className={cn("flex flex-col gap-6", className)}>
            {(title || description || actions) && (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        {title && (
                            <h1 className="text-foreground text-3xl font-bold tracking-tight">
                                {title}
                            </h1>
                        )}
                        {description && (
                            <p className="text-muted-foreground max-w-2xl text-base">
                                {description}
                            </p>
                        )}
                    </div>
                    {actions && <div className="flex items-center gap-3">{actions}</div>}
                </div>
            )}

            <div className="app-section">{children}</div>
        </div>
    );
}

export function ContentGrid({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3", className)}>
            {children}
        </div>
    );
}

export function StickyBar({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "bg-background/95 fixed right-0 bottom-16 left-0 z-40 border-t p-4 backdrop-blur sm:px-6 md:bottom-0",
                className,
            )}
        >
            <Container>{children}</Container>
        </div>
    );
}
