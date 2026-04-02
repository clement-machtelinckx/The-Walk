"use client";

import * as React from "react";
import { Menu } from "lucide-react";
import { NavLink } from "./navLink";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import LucideIcon from "@/components/ui/icon";

type NavItem = { href: string; label: string };

const NAV_ITEMS: NavItem[] = [{ href: "/", label: "Accueil" }];

export function MenuBurger() {
    const [open, setOpen] = React.useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    aria-label="Ouvrir le menu"
                >
                    <LucideIcon icon={Menu} className="h-5 w-5" />
                </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-[90vw] sm:max-w-sm">
                <SheetHeader className="space-y-1">
                    <SheetTitle className="flex items-center justify-between">
                        <span>Menu</span>
                    </SheetTitle>
                </SheetHeader>

                <div className="mt-6 space-y-4">
                    <nav aria-label="Menu mobile" className="grid gap-2">
                        {NAV_ITEMS.map((item) => (
                            <NavLink
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className="text-foreground hover:bg-muted focus-visible:ring-ring rounded-md px-3 py-2 text-base focus-visible:ring-2 focus-visible:outline-none"
                                activeClassName="bg-muted text-foreground font-medium"
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>

                    <Separator />
                </div>
            </SheetContent>
        </Sheet>
    );
}
