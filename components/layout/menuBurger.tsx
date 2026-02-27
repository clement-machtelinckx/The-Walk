"use client";

import * as React from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import LucideIcon from "@/components/ui/icon";

type NavItem = { href: string; label: string };

const NAV_ITEMS: NavItem[] = [
    { href: "/", label: "Accueil" },
    { href: "/garantie", label: "Garanties audioprothèses" },
    { href: "/protection", label: "Protection de votre activité" },
    { href: "/contact", label: "Contact" },
];

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
                        {/* Si tu veux le bouton fermer :
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              aria-label="Fermer le menu"
            >
              <LucideIcon icon={X} className="h-5 w-5" />
            </Button>
            */}
                    </SheetTitle>
                </SheetHeader>

                <div className="mt-6 space-y-4">
                    <nav className="grid gap-2">
                        {NAV_ITEMS.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className="rounded-md px-3 py-2 text-base text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <Separator />

                    <p className="text-xs text-muted-foreground">Réponse sous 48h ouvrées.</p>
                </div>
            </SheetContent>
        </Sheet>
    );
}