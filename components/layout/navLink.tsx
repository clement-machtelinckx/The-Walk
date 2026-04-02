"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavLinkProps {
    href: string;
    children: React.ReactNode;
    className?: string;
    activeClassName?: string;
    onClick?: () => void;
}

export function NavLink({
    href,
    children,
    className,
    activeClassName = "text-foreground font-medium",
    onClick,
}: NavLinkProps) {
    const pathname = usePathname();
    const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

    return (
        <Link
            href={href}
            onClick={onClick}
            className={cn("relative", className, isActive && activeClassName)}
        >
            {children}
            {isActive && (
                <span className="bg-primary absolute -bottom-1 left-0 h-0.5 w-full rounded-full" />
            )}
        </Link>
    );
}
