"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createSessionSchema, CreateSessionInput } from "@/lib/validators/session";
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
import { Loader2, AlertCircle } from "lucide-react";
import { Session } from "@/types/session";
import { useSessionStore } from "@/store/session-store";

interface SessionFormProps {
    tableId: string;
    initialData?: Session;
    onSuccess: (session: Session) => void;
    onCancel: () => void;
}

export function SessionForm({ tableId, initialData, onSuccess, onCancel }: SessionFormProps) {
    const [error, setError] = useState<string | null>(null);
    const { createSession, updateSession } = useSessionStore();
    const isEditing = !!initialData;

    const form = useForm<CreateSessionInput>({
        resolver: zodResolver(createSessionSchema),
        defaultValues: {
            table_id: tableId,
            title: initialData?.title || "",
            description: initialData?.description || "",
            scheduled_at: initialData?.scheduled_at
                ? new Date(initialData.scheduled_at).toISOString().slice(0, 16)
                : "",
        },
    });

    const onSubmit = async (data: CreateSessionInput) => {
        setError(null);

        // Convert local datetime-local string to ISO string for API
        const payload = {
            ...data,
            scheduled_at: data.scheduled_at ? new Date(data.scheduled_at).toISOString() : null,
        };

        const result = isEditing
            ? await updateSession(initialData.id, payload)
            : await createSession(tableId, payload);

        if (result.success && result.session) {
            onSuccess(result.session);
        } else {
            setError(result.error || "Une erreur est survenue.");
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Titre de la session</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Ex: Chapitre 1 : L'arrivée au village"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description / Notes de préparation</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Briefing pour les joueurs..."
                                    className="min-h-32 resize-none"
                                    {...field}
                                    value={field.value || ""}
                                />
                            </FormControl>
                            <FormDescription>
                                Visible par tous les membres de la table.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="scheduled_at"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Date et Heure</FormLabel>
                            <FormControl>
                                <Input type="datetime-local" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {error && (
                    <div className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-md p-3 text-sm">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                    <Button type="submit" className="flex-1" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {isEditing ? "Modification..." : "Création..."}
                            </>
                        ) : isEditing ? (
                            "Enregistrer les modifications"
                        ) : (
                            "Planifier la session"
                        )}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={onCancel}
                        disabled={form.formState.isSubmitting}
                    >
                        Annuler
                    </Button>
                </div>
            </form>
        </Form>
    );
}
