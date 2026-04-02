"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, User, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

const NAV_ITEMS = [
    { href: "/tables", label: "Tables", icon: LayoutGrid },
    { href: "/mon-compte", label: "Profil", icon: User },
    { href: siteConfig.links.crawl, label: "The Crawl", icon: BookOpen, external: true },
];

export function AppNav() {
    const pathname = usePathname();

    return (
        <nav className="flex items-center gap-1 md:gap-2">
            {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href) && !item.external;

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        target={item.external ? "_blank" : undefined}
                        rel={item.external ? "noopener noreferrer" : undefined}
                        className={cn(
                            "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                            isActive
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                    >
                        <Icon className="h-4 w-4" />
                        <span className="hidden sm:inline">{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}

export function MobileBottomNav() {
    const pathname = usePathname();

    return (
        <nav className="bg-background/80 fixed right-0 bottom-0 left-0 z-50 flex h-16 items-center justify-around border-t px-4 backdrop-blur md:hidden">
            {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href) && !item.external;

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        target={item.external ? "_blank" : undefined}
                        rel={item.external ? "noopener noreferrer" : undefined}
                        className={cn(
                            "flex flex-col items-center justify-center gap-1 transition-colors",
                            isActive ? "text-primary" : "text-muted-foreground",
                        )}
                    >
                        <Icon className="h-5 w-5" />
                        <span className="text-[10px] font-medium tracking-tight uppercase">
                            {item.label}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
