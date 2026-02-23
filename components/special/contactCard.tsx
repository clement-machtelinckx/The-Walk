import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MdiIcon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

type ContactCardProps = {
    title: string;
    href: string;
    buttonLabel: string;
    iconPath: string; // MDI path (ex: mdiPhone)
    className?: string;
};

export function ContactCard({
    title,
    href,
    buttonLabel,
    iconPath,
    className,
}: ContactCardProps) {
    return (
        <Card className={cn("rounded-2xl shadow-sm", className)}>
            <CardContent className="flex flex-col items-center gap-5 p-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <MdiIcon path={iconPath} size={1.2} />
                </div>

                <h2 className="text-base font-semibold tracking-wide">
                    {title}
                </h2>

                <Button asChild className="rounded-full px-6">
                    <Link href={href} className="inline-flex items-center gap-2">
                        <span aria-hidden>›</span>
                        {buttonLabel}
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}