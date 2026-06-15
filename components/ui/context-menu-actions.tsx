"use client";

import { Fragment, type ComponentType } from "react";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type ContextMenuActionBase = {
    id: string;
    label: string;
    icon?: ComponentType<{ className?: string }>;
    iconClassName?: string;
    disabled?: boolean;
    destructive?: boolean;
    separatorBefore?: boolean;
};

type ContextMenuCallbackAction = ContextMenuActionBase & {
    onSelect: () => void;
    href?: never;
};

type ContextMenuLinkAction = ContextMenuActionBase & {
    href: string;
    onSelect?: never;
};

export type ContextMenuAction = ContextMenuCallbackAction | ContextMenuLinkAction;

type ContextMenuActionsProps = Readonly<{
    actions: ContextMenuAction[];
    label?: string;
    align?: "start" | "center" | "end";
    triggerClassName?: string;
}>;

export function ContextMenuActions({
    actions,
    label = "Ouvrir les actions",
    align = "end",
    triggerClassName,
}: ContextMenuActionsProps) {
    if (actions.length === 0) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-lg"
                    aria-label={label}
                    title={label}
                    className={cn("text-muted-foreground", triggerClassName)}
                >
                    <MoreHorizontal />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={align}>
                {actions.map((action) => {
                    const Icon = action.icon;
                    const content = (
                        <>
                            {Icon && <Icon aria-hidden="true" className={action.iconClassName} />}
                            <span>{action.label}</span>
                        </>
                    );

                    return (
                        <Fragment key={action.id}>
                            {action.separatorBefore && <DropdownMenuSeparator />}
                            {"href" in action && action.href && !action.disabled ? (
                                <DropdownMenuItem
                                    asChild
                                    variant={action.destructive ? "destructive" : "default"}
                                >
                                    <Link href={action.href}>{content}</Link>
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem
                                    disabled={action.disabled}
                                    variant={action.destructive ? "destructive" : "default"}
                                    onSelect={
                                        "onSelect" in action && action.onSelect
                                            ? action.onSelect
                                            : undefined
                                    }
                                >
                                    {content}
                                </DropdownMenuItem>
                            )}
                        </Fragment>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
