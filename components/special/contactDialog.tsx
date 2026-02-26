"use client";

import Image from "next/image";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Props = {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;

    title?: string;
    phone: string;
    email: string;

    imageSrc?: string;
    imageAlt?: string;

    className?: string;
};

export function ContactDialog({
    open,
    onOpenChange,
    title = "Contact",
    phone,
    email,
    imageSrc,
    imageAlt = "Contact",
    className,
}: Props) {
    const telHref = `tel:${phone.replace(/\s/g, "")}`;
    const mailHref = `mailto:${email}`;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={cn(
                    "w-[96vw] max-w-[900px] sm:max-w-[900px] overflow-hidden p-0",
                    className
                )}
            >
                <div className="grid min-h-[520px] md:grid-cols-2">
                    {imageSrc ? (
                        <div className="relative hidden md:block md:min-h-[520px]">
                            <Image
                                src={imageSrc}
                                alt={imageAlt}
                                fill
                                className="object-cover"
                                sizes="(min-width: 768px) 50vw, 100vw"
                            />
                        </div>
                    ) : null}

                    <div
                        className={cn(
                            "p-8 md:p-10 flex flex-col justify-center",
                            !imageSrc && "md:col-span-2"
                        )}
                    >
                        <DialogHeader>
                            <DialogTitle className="text-center text-4xl font-semibold tracking-tight text-primary">
                                {title}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="mt-6 space-y-3 text-xl text-center ">
                            <div className="flex justify-center gap-2">
                                <span className="font-semibold">Mail :</span>
                                <Link href={mailHref} className="text-primary underline-offset-4 hover:underline">
                                    {email}
                                </Link>
                            </div>

                            <div className="flex justify-center gap-2">
                                <span className="font-semibold">Tel :</span>
                                <Link href={telHref} className="underline-offset-4 hover:underline">
                                    {phone}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}