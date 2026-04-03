"use client";

import { useState } from "react";
import { AppUser } from "@/types/auth";
import { useAuth } from "@/components/auth/auth-provider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { passwordChangeSchema, PasswordChangeInput } from "@/lib/validators/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Loader2, CheckCircle2, AlertCircle, LogOut } from "lucide-react";

interface ProfileContentProps {
    user: AppUser;
}

export function ProfileContent({ user: serverUser }: ProfileContentProps) {
    const { logout, user: clientUser, changePassword } = useAuth();
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Favor client user if available for real-time updates, fallback to server user
    const user = clientUser || serverUser;

    const initials = user.profile?.display_name
        ? user.profile.display_name.substring(0, 2).toUpperCase()
        : user.email.substring(0, 2).toUpperCase();

    const form = useForm<PasswordChangeInput>({
        resolver: zodResolver(passwordChangeSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (data: PasswordChangeInput) => {
        setIsSuccess(false);
        setError(null);

        const result = await changePassword(data);

        if (!result.success) {
            setError(result.error || "Une erreur est survenue");
            return;
        }

        setIsSuccess(true);
        form.reset();
    };

    return (
        <div className="max-w-2xl space-y-8">
            {/* Profil Info */}
            <Card className="overflow-hidden border-none shadow-md">
                <div className="bg-primary/10 h-24 sm:h-32" />
                <CardContent className="px-6 pb-6">
                    <div className="relative -mt-12 mb-4">
                        <div className="bg-primary text-primary-foreground ring-background flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold shadow-xl ring-4">
                            {initials}
                        </div>
                    </div>
                    <h2 className="text-foreground text-2xl font-bold">
                        {user.profile?.display_name || "Utilisateur"}
                    </h2>
                    <p className="text-muted-foreground font-medium">{user.email}</p>
                </CardContent>
            </Card>

            {/* Account Settings */}
            <div className="app-list">
                <div className="app-list-item">
                    <div className="space-y-0.5">
                        <span className="text-muted-foreground/60 text-[10px] font-bold tracking-widest uppercase">
                            Email de connexion
                        </span>
                        <p className="text-base font-semibold">{user.email}</p>
                    </div>
                </div>
                <button
                    onClick={() => logout()}
                    className="app-list-item hover:bg-destructive/5 group w-full text-left transition-colors"
                >
                    <div className="text-muted-foreground group-hover:text-destructive flex items-center gap-3 text-sm font-bold transition-colors">
                        <LogOut size={18} />
                        <span>Se déconnecter</span>
                    </div>
                </button>
            </div>

            {/* Sécurité Section */}
            <Card className="border-primary/10 bg-card/50 shadow-sm">
                <CardHeader className="flex flex-row items-center gap-4">
                    <div className="bg-primary/10 text-primary rounded-full p-2.5">
                        <Shield size={22} />
                    </div>
                    <div>
                        <CardTitle className="text-xl">Sécurité</CardTitle>
                        <CardDescription>
                            Gérez votre mot de passe et vos paramètres de sécurité.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="currentPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ancien mot de passe</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="••••••••"
                                                autoComplete="current-password"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="newPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nouveau mot de passe</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    placeholder="••••••••"
                                                    autoComplete="new-password"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirmation</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    placeholder="••••••••"
                                                    autoComplete="new-password"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {error && (
                                <div className="bg-destructive/10 text-destructive border-destructive/20 flex items-center gap-2 rounded-lg border p-4 text-sm font-medium">
                                    <AlertCircle size={18} />
                                    <span>{error}</span>
                                </div>
                            )}

                            {isSuccess && (
                                <div className="bg-primary/10 text-primary border-primary/20 flex items-center gap-2 rounded-lg border p-4 text-sm font-medium">
                                    <CheckCircle2 size={18} />
                                    <span>Votre mot de passe a été mis à jour avec succès.</span>
                                </div>
                            )}

                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    className="w-full px-8 sm:w-auto"
                                    disabled={form.formState.isSubmitting}
                                >
                                    {form.formState.isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Mise à jour...
                                        </>
                                    ) : (
                                        "Changer le mot de passe"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
