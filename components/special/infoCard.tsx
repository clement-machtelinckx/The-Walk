import Image from "next/image";
import Link from "next/link";
import type { LucideIcon as LucideIconType } from "lucide-react";
import { Mail, Phone } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import LucideIcon from "@/components/ui/icon";
import { cn } from "@/lib/utils";

type Props = {
    logoSrc: string;
    logoAlt?: string;
    logoWidth?: number;
    logoHeight?: number;

    title?: string;

    phoneLabel?: string;
    phone: string;

    emailLabel?: string;
    email: string;

    hours?: string;
    description?: string;

    className?: string;

    phoneIcon?: LucideIconType;
    emailIcon?: LucideIconType;
};

export function InfoCard({
    logoSrc,
    logoAlt = "Logo",
    logoWidth = 220,
    logoHeight = 90,

    title = "Nous contacter",

    phoneLabel = "Téléphone",
    phone,

    emailLabel = "Email",
    email,

    hours,
    description,

    className,

    phoneIcon,
    emailIcon,
}: Props) {
    const phoneHref = `tel:${phone.replace(/[^\d+]/g, "")}`;
    const emailHref = `mailto:${email}`;

    return (
        <Card className={cn("rounded-2xl", className)}>
            <CardContent className="p-8">
                {/* Logo */}
                <div className="flex justify-center">
                    <Image
                        src={logoSrc}
                        alt={logoAlt}
                        width={logoWidth}
                        height={logoHeight}
                        className="h-auto w-auto max-w-[260px]"
                        priority={false}
                    />
                </div>

                {/* Trait */}
                <div className="my-6 h-px w-full bg-border" />

                {/* Titre */}
                <h2 className="text-2xl font-semibold tracking-tight text-primary">{title}</h2>

                {/* Phone */}
                <div className="mt-6 flex gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-foreground text-background">
                        <LucideIcon icon={phoneIcon ?? Phone} className="h-5 w-5" />
                    </div>

                    <div className="space-y-1">
                        <div className="text-sm font-semibold">{phoneLabel}</div>
                        <Link
                            href={phoneHref}
                            className="text-base font-semibold underline-offset-4 hover:underline"
                        >
                            {phone}
                        </Link>
                        {hours ? <p className="text-sm text-muted-foreground">{hours}</p> : null}
                    </div>
                </div>

                {/* Email */}
                <div className="mt-6 flex gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-foreground text-background">
                        <LucideIcon icon={emailIcon ?? Mail} className="h-5 w-5" />
                    </div>

                    <div className="space-y-1">
                        <div className="text-sm font-semibold">{emailLabel}</div>
                        <Link
                            href={emailHref}
                            className="text-base font-semibold underline-offset-4 hover:underline"
                        >
                            {email}
                        </Link>
                    </div>
                </div>

                {/* Description */}
                {description ? (
                    <p className="mt-6 leading-relaxed text-muted-foreground">{description}</p>
                ) : null}
            </CardContent>
        </Card>
    );
}