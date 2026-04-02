import Link from "next/link";
import { Container } from "./container";
import { AppNav } from "./app-nav";
import { siteConfig } from "@/config/site";

export function AppHeader() {
    return (
        <header className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
            <Container>
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="font-heading text-xl font-bold tracking-tight">
                            {siteConfig.name}
                        </Link>
                        <div className="hidden md:block">
                            <AppNav />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Session / User Info Placeholder */}
                        <div className="bg-muted/50 flex items-center gap-2 rounded-full border py-1.5 pr-1.5 pr-2 pl-3">
                            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                                MJ
                            </span>
                            <div className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold">
                                JD
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </header>
    );
}
