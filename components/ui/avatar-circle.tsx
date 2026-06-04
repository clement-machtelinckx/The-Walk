import Image from "next/image";
import { getAvatarByKey, getAvatarImagePath } from "@/config/avatars";
import { cn } from "@/lib/utils";

type AvatarCircleSize = "sm" | "md" | "lg" | "xl";

type AvatarCircleProps = Readonly<{
    avatarKey?: string | null;
    name?: string | null;
    email?: string | null;
    size?: AvatarCircleSize;
    className?: string;
}>;

const sizeClasses: Record<AvatarCircleSize, string> = {
    sm: "h-6 w-6 text-[10px]",
    md: "h-8 w-8 text-xs",
    lg: "h-9 w-9 text-[11px]",
    xl: "h-24 w-24 text-3xl",
};

const imageSizes: Record<AvatarCircleSize, number> = {
    sm: 24,
    md: 32,
    lg: 36,
    xl: 96,
};

function getInitials(name?: string | null, email?: string | null) {
    const source = name?.trim() || email?.trim() || "??";
    return source.substring(0, 2).toUpperCase();
}

export function AvatarCircle({
    avatarKey,
    name,
    email,
    size = "md",
    className,
}: AvatarCircleProps) {
    const avatar = getAvatarByKey(avatarKey);
    const imageSize = imageSizes[size];

    return (
        <div
            className={cn(
                "bg-primary/10 text-primary border-primary/20 flex shrink-0 items-center justify-center overflow-hidden rounded-full border font-bold",
                sizeClasses[size],
                className,
            )}
        >
            {avatar ? (
                <Image
                    src={getAvatarImagePath(avatar.key)}
                    alt={avatar.label}
                    width={imageSize}
                    height={imageSize}
                    className="h-full w-full object-cover"
                />
            ) : (
                getInitials(name, email)
            )}
        </div>
    );
}
