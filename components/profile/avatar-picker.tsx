"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { AlertCircle, Check, CheckCircle2, Loader2, RotateCcw } from "lucide-react";
import { AVATARS, getAvatarImagePath, isAvatarKey } from "@/config/avatars";
import type { AvatarKey } from "@/config/avatars";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AvatarPickerProps = Readonly<{
    currentAvatarKey: string | null | undefined;
}>;

export function AvatarPicker({ currentAvatarKey }: AvatarPickerProps) {
    const { updateProfile } = useAuth();
    const [selectedAvatarKey, setSelectedAvatarKey] = useState<AvatarKey | null>(
        isAvatarKey(currentAvatarKey) ? currentAvatarKey : null,
    );
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const normalizedCurrentAvatarKey = isAvatarKey(currentAvatarKey) ? currentAvatarKey : null;
    const hasChanges = selectedAvatarKey !== normalizedCurrentAvatarKey;

    const selectedAvatar = useMemo(
        () => AVATARS.find((avatar) => avatar.key === selectedAvatarKey) ?? null,
        [selectedAvatarKey],
    );

    const saveAvatar = async () => {
        setIsSaving(true);
        setError(null);
        setIsSuccess(false);

        const result = await updateProfile({ avatarKey: selectedAvatarKey });

        setIsSaving(false);

        if (!result.success) {
            setError(result.error || "Impossible d'enregistrer l'avatar.");
            return;
        }

        setIsSuccess(true);
    };

    return (
        <Card className="border-primary/10 bg-card/50 shadow-sm">
            <CardHeader>
                <CardTitle className="text-xl">Avatar</CardTitle>
                <CardDescription>
                    Choisissez l&apos;apparence affichee sur votre profil.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="bg-background/70 flex items-center gap-4 rounded-lg border p-4">
                    <div className="bg-primary/10 text-primary flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border">
                        {selectedAvatar ? (
                            <Image
                                src={getAvatarImagePath(selectedAvatar.key)}
                                alt={selectedAvatar.label}
                                width={80}
                                height={80}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span className="text-xs font-bold uppercase">Aucun</span>
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold">
                            {selectedAvatar?.label || "Avatar par defaut"}
                        </p>
                        <p className="text-muted-foreground text-sm">
                            {selectedAvatar
                                ? "Ce visuel sera utilise sur votre profil."
                                : "Vos initiales restent affichees tant qu'aucun avatar n'est choisi."}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {AVATARS.map((avatar) => {
                        const isSelected = selectedAvatarKey === avatar.key;

                        return (
                            <button
                                key={avatar.key}
                                type="button"
                                onClick={() => {
                                    setSelectedAvatarKey(avatar.key);
                                    setIsSuccess(false);
                                }}
                                className={cn(
                                    "bg-background group focus-visible:ring-ring/50 relative overflow-hidden rounded-lg border text-left shadow-sm transition focus-visible:ring-[3px] focus-visible:outline-none",
                                    isSelected
                                        ? "border-primary ring-primary/30 ring-2"
                                        : "border-border hover:border-primary/60",
                                )}
                                aria-pressed={isSelected}
                            >
                                <Image
                                    src={getAvatarImagePath(avatar.key)}
                                    alt={avatar.label}
                                    width={160}
                                    height={160}
                                    className="aspect-square w-full object-cover"
                                />
                                <span className="block truncate px-2 py-2 text-xs font-semibold">
                                    {avatar.label}
                                </span>
                                {isSelected && (
                                    <span className="bg-primary text-primary-foreground absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full shadow">
                                        <Check size={14} />
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {error && (
                    <div className="bg-destructive/10 text-destructive border-destructive/20 flex items-center gap-2 rounded-lg border p-3 text-sm font-medium">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                {isSuccess && (
                    <div className="bg-primary/10 text-primary border-primary/20 flex items-center gap-2 rounded-lg border p-3 text-sm font-medium">
                        <CheckCircle2 size={16} />
                        <span>Avatar mis a jour.</span>
                    </div>
                )}

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            setSelectedAvatarKey(null);
                            setIsSuccess(false);
                        }}
                        disabled={isSaving || selectedAvatarKey === null}
                    >
                        <RotateCcw />
                        Retirer l&apos;avatar
                    </Button>
                    <Button type="button" onClick={saveAvatar} disabled={isSaving || !hasChanges}>
                        {isSaving ? (
                            <>
                                <Loader2 className="animate-spin" />
                                Enregistrement...
                            </>
                        ) : (
                            "Enregistrer l'avatar"
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
