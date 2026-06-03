"use client";

import Image from "next/image";
import Link from "next/link";
import { Container } from "./container";
import { AppNav } from "./app-nav";
import { siteConfig } from "@/config/site";
import { useAuth } from "@/components/auth/auth-provider";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { getAvatarByKey, getAvatarImagePath } from "@/config/avatars";

export function AppHeader() {
    const { user } = useAuth();

    const initials = user?.profile?.display_name
        ? user.profile.display_name.substring(0, 2).toUpperCase()
        : user?.email.substring(0, 2).toUpperCase() || "??";
    const profileAvatar = getAvatarByKey(user?.profile?.avatar_key);

    return (
        <header className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
            <Container>
                <div className="flex h-14 items-center justify-between md:h-16">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="font-heading text-xl font-bold tracking-tight">
                            {siteConfig.name}
                        </Link>
                        <div className="hidden md:block">
                            <AppNav />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                <NotificationCenter />
                                <Link
                                    href="/mon-compte"
                                    className="bg-muted/50 hover:bg-muted/80 flex items-center gap-2 rounded-full border py-1.5 pr-2 pl-3 transition-colors"
                                >
                                    <span className="text-muted-foreground hidden text-[10px] font-semibold tracking-wider uppercase sm:inline">
                                        {user.profile?.display_name || "Joueur"}
                                    </span>
                                    <div className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center overflow-hidden rounded-full text-[10px] font-bold">
                                        {profileAvatar ? (
                                            <Image
                                                src={getAvatarImagePath(profileAvatar.key)}
                                                alt={profileAvatar.label}
                                                width={24}
                                                height={24}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            initials
                                        )}
                                    </div>
                                </Link>
                            </>
                        ) : (
                            <Link href="/login" className="text-sm font-medium hover:underline">
                                Se connecter
                            </Link>
                        )}
                    </div>
                </div>
            </Container>
        </header>
    );
}
