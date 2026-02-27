"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

import { joinFormSchema, type JoinFormValues } from "./join-schema";

export function JoinForm() {
    const [submitted, setSubmitted] = React.useState(false);
    const [isSending, setIsSending] = React.useState(false);
    const [serverError, setServerError] = React.useState<string | null>(null);

    const form = useForm<JoinFormValues>({
        resolver: zodResolver(joinFormSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            cv: null as any,
            website: "",
        },
        mode: "onBlur",
    });

    async function onSubmit(values: JoinFormValues) {
        setServerError(null);
        setIsSending(true);

        try {
            // honeypot: si rempli => bot => ok silencieux
            if (values.website && values.website.trim().length > 0) {
                setSubmitted(true);
                return;
            }

            const fd = new FormData();
            fd.append("firstName", values.firstName);
            fd.append("lastName", values.lastName);
            fd.append("email", values.email);
            fd.append("phone", values.phone);
            fd.append("website", values.website ?? "");
            fd.append("cv", values.cv); // File

            const res = await fetch("/api/join", {
                method: "POST",
                body: fd,
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok || !data?.ok) {
                setServerError(data?.error ?? "Impossible d’envoyer la candidature.");
                return;
            }

            setSubmitted(true);
        } catch {
            setServerError("Impossible d’envoyer la candidature (réseau).");
        } finally {
            setIsSending(false);
        }
    }

    if (submitted) {
        return (
            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle>Succès</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                    <p>Votre candidature a bien été prise en compte.</p>

                    <div className="flex flex-wrap gap-3">
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setSubmitted(false);
                                setServerError(null);
                            }}
                        >
                            Modifier ma candidature
                        </Button>

                        <Button asChild>
                            <Link href="/">Retour</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const cvFile = form.watch("cv") as unknown as File | null;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card className="rounded-2xl">


                    <CardContent className="grid gap-6 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>Votre nom *</FormLabel>
                                    <FormControl>
                                        <Input autoComplete="family-name" placeholder="Votre nom" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>Votre prénom *</FormLabel>
                                    <FormControl>
                                        <Input autoComplete="given-name" placeholder="Votre prénom" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>Votre email *</FormLabel>
                                    <FormControl>
                                        <Input type="email" autoComplete="email" placeholder="nom@exemple.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>Votre téléphone *</FormLabel>
                                    <FormControl>
                                        <Input inputMode="tel" autoComplete="tel" placeholder="06 00 00 00 00" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Upload CV */}
                        <FormField
                            control={form.control}
                            name="cv"
                            render={() => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>Déposez votre CV *</FormLabel>

                                    <div className="flex items-stretch gap-2">
                                        {/* Champ lecture seule (nom du fichier) */}
                                        <Input
                                            readOnly
                                            value={cvFile ? cvFile.name : "Sélectionnez votre plus beau CV"}
                                            className="cursor-default"
                                        />

                                        {/* input file caché + bouton */}
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept=".pdf,.doc,.docx"
                                                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0] ?? null;
                                                    form.setValue("cv", file as any, { shouldValidate: true });
                                                }}
                                            />
                                            <Button type="button" variant="secondary" className="h-full">
                                                Browse
                                            </Button>
                                        </div>
                                    </div>

                                    <p className="text-xs text-muted-foreground">
                                        {cvFile ? "1/1 files uploaded" : "0/1 files uploaded"}
                                    </p>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Honeypot anti-bot */}
                        <input
                            type="text"
                            tabIndex={-1}
                            autoComplete="off"
                            className="hidden"
                            {...form.register("website")}
                        />

                        {serverError ? (
                            <p className="text-sm font-medium text-destructive md:col-span-2">
                                {serverError}
                            </p>
                        ) : null}

                        <div className="flex flex-wrap items-center gap-3 md:col-span-2">
                            <Button type="submit" size="lg" disabled={isSending}>
                                {isSending ? "Envoi..." : "Envoyer ma candidature"}
                            </Button>

                            <Button
                                type="button"
                                variant="secondary"
                                size="lg"
                                onClick={() => {
                                    form.reset();
                                    setServerError(null);
                                }}
                            >
                                Réinitialiser
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </Form>
    );
}