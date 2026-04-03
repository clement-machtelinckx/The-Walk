"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTableSchema, CreateTableInput } from "@/lib/validators/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export function CreateTableForm() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    const form = useForm<CreateTableInput>({
        resolver: zodResolver(createTableSchema),
        defaultValues: {
            name: "",
            description: "",
        },
    });

    const onSubmit = async (data: CreateTableInput) => {
        setError(null);

        try {
            const response = await fetch("/api/tables", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                setError(result.error || "Une erreur est survenue lors de la création.");
                return;
            }

            // Redirect to the newly created table
            router.push(`/tables/${result.table.id}`);
            router.refresh();
        } catch (err) {
            setError("Erreur réseau ou serveur. Veuillez réessayer.");
        }
    };

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div className="text-muted-foreground hover:text-foreground mb-2 flex items-center gap-2 transition-colors">
                <ArrowLeft size={16} />
                <Link href="/tables" className="text-sm font-medium">
                    Retour à mes tables
                </Link>
            </div>

            <Card className="border-primary/10 bg-card/50 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Créer une nouvelle table</CardTitle>
                    <CardDescription>
                        Donnez un nom et une description à votre nouvelle campagne ou table de jeu.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nom de la table</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ex: La Malédiction de Strahd"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            C&apos;est le nom qui sera affiché à tous vos joueurs.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description (optionnelle)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Décrivez brièvement l'univers, le ton ou les règles spécifiques de votre table..."
                                                className="min-h-32 resize-none"
                                                {...field}
                                                value={field.value || ""}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {error && (
                                <div className="text-destructive bg-destructive/10 flex items-center gap-2 rounded-md p-3 text-sm">
                                    <AlertCircle size={16} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                                <Button
                                    type="submit"
                                    className="flex-1"
                                    disabled={form.formState.isSubmitting}
                                >
                                    {form.formState.isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Création...
                                        </>
                                    ) : (
                                        "Créer la table"
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    asChild
                                    disabled={form.formState.isSubmitting}
                                >
                                    <Link href="/tables">Annuler</Link>
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
