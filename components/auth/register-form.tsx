"use client";

import React, { useState } from "react";
import { useAuth } from "./auth-provider";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export function RegisterForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { register } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas");
            return;
        }

        setIsLoading(true);

        try {
            const result = await register(email, password, confirmPassword, displayName);
            if (result.success) {
                setSuccess(result.message || "Inscription réussie !");
                // Optional: redirect to tables after a short delay if immediately logged in
                setTimeout(() => {
                    router.push("/tables");
                    router.refresh();
                }, 1500);
            } else {
                setError(result.error || "Erreur lors de l'inscription");
            }
        } catch (err) {
            setError("Une erreur est survenue");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="mx-auto w-full max-w-md">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Inscription</CardTitle>
                <CardDescription>
                    Créez votre compte pour commencer à gérer vos sessions.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="bg-destructive/15 text-destructive rounded-md p-3 text-sm font-medium">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-primary/15 text-primary rounded-md p-3 text-sm font-medium">
                            {success}
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="displayName">Nom d&apos;affichage</Label>
                        <Input
                            id="displayName"
                            type="text"
                            placeholder="Ex: MJ du Dimanche"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="nom@exemple.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Mot de passe</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Inscription en cours..." : "S'inscrire"}
                    </Button>
                    <div className="text-center text-sm">
                        Déjà un compte ?{" "}
                        <Link href="/login" className="text-primary font-medium hover:underline">
                            Se connecter
                        </Link>
                    </div>
                </CardFooter>
            </form>
        </Card>
    );
}
