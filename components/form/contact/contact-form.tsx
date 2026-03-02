"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import {
    contactFormSchema,
    insuranceLabel,
    type ContactFormValues,
    USER_TYPES,
} from "./contact-schema";

const JOB_FUNCTIONS = [
    "Gérant / Dirigeant",
    "Audioprothésiste",
    "Assistant(e)",
    "Administratif",
    "Autre",
] as const;

// On étend les valeurs du form côté client pour inclure le honeypot
type ContactFormClientValues = ContactFormValues & {
    website?: string;
};

export function ContactForm() {
    const [submitted, setSubmitted] = React.useState(false);
    const [isSending, setIsSending] = React.useState(false);
    const [serverError, setServerError] = React.useState<string | null>(null);


    const form = useForm<ContactFormClientValues>({
        resolver: zodResolver(contactFormSchema) as any,
        defaultValues: {
            userType: "professionnel",
            jobFunction: "",
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            companyName: "",
            companyAddress: "",
            postalCode: "",
            city: "",
            insuranceType: "garantie_audioprothese",
            message: "",
            website: "", // honeypot
        },
        mode: "onBlur",
    });

    const userType = form.watch("userType");

    async function onSubmit(values: ContactFormClientValues) {
        setServerError(null);
        setIsSending(true);

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok || !data?.ok) {
                setServerError(data?.error ?? "Impossible d’envoyer le message.");
                return;
            }

            setSubmitted(true);
        } catch {
            setServerError("Impossible d’envoyer le message (réseau).");
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
                    <p>Votre demande a bien été envoyée à l’équipe.</p>

                    <div className="flex flex-wrap gap-3">
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setSubmitted(false);
                                setServerError(null);
                            }}
                        >
                            Modifier ma demande
                        </Button>
                        <Button asChild>
                            <Link href="/contact">Retour</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Vous êtes */}
                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle>Vous êtes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="userType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <RadioGroup
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            className="grid gap-3 sm:grid-cols-2"
                                        >
                                            {USER_TYPES.map((t) => (
                                                <label
                                                    key={t}
                                                    className="flex cursor-pointer items-center gap-3 rounded-xl border p-4 hover:bg-muted"
                                                >
                                                    <RadioGroupItem value={t} />
                                                    <span className="font-medium">
                                                        {t === "particulier"
                                                            ? "Un particulier"
                                                            : "Un professionnel"}
                                                    </span>
                                                </label>
                                            ))}
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Identité */}
                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle>Identité de l’interlocuteur</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="jobFunction"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>Fonction</FormLabel>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner…" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {JOB_FUNCTIONS.map((v) => (
                                                <SelectItem key={v} value={v}>
                                                    {v}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nom</FormLabel>
                                    <FormControl>
                                        <Input
                                            autoComplete="family-name"
                                            placeholder="Votre nom"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Prénom</FormLabel>
                                    <FormControl>
                                        <Input
                                            autoComplete="given-name"
                                            placeholder="Votre prénom"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            autoComplete="email"
                                            placeholder="nom@exemple.com"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Téléphone</FormLabel>
                                    <FormControl>
                                        <Input
                                            inputMode="tel"
                                            autoComplete="tel"
                                            placeholder="06 00 00 00 00"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Entreprise */}
                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle>Votre entreprise</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="companyName"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>
                                        Raison sociale{" "}
                                        {userType === "professionnel" ? "*" : "(optionnel)"}
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nom de l’entreprise" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="companyAddress"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>
                                        Adresse{" "}
                                        {userType === "professionnel" ? "*" : "(optionnel)"}
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="Adresse de l’entreprise" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="postalCode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Code postal *</FormLabel>
                                    <FormControl>
                                        <Input
                                            inputMode="numeric"
                                            placeholder="75000"
                                            maxLength={5}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ville *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Paris" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Besoin */}
                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle>Votre besoin</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <FormField
                            control={form.control}
                            name="insuranceType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type d’assurance *</FormLabel>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner…" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {Object.entries(insuranceLabel).map(([value, label]) => (
                                                <SelectItem key={value} value={value}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Selon le type d’assurance, votre demande sera envoyée au bon
                                        interlocuteur.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description de votre demande *</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            rows={7}
                                            placeholder="Décrivez votre besoin…"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Honeypot anti-bot (ne pas afficher) */}
                <input
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    className="hidden"
                    {...form.register("website")}
                />

                {serverError ? (
                    <p className="text-sm font-medium text-destructive">{serverError}</p>
                ) : null}

                <div className="flex flex-wrap items-center gap-3">
                    <Button type="submit" size="lg" disabled={isSending}>
                        {isSending ? "Envoi..." : "Envoyer"}
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
            </form>
        </Form>
    );
}