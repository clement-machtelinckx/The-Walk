import type { Metadata } from "next";
import Link from "next/link";
import {
    ArrowRight,
    BookOpen,
    CalendarDays,
    Mail,
    MessageSquare,
    ShieldCheck,
    Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/layout/container";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
    title: "Organiser une table de jeu de rôle",
    description:
        "The-Walk centralise les invitations, la préparation, les messages et les outils utiles pendant une session de jeu de rôle.",
    alternates: {
        canonical: "/",
    },
    openGraph: {
        title: "The-Walk — organiser une table de jeu de rôle",
        description:
            "Un espace web pour gérer vos tables JDR, préparer les sessions et garder les échanges du groupe au même endroit.",
        url: "/",
    },
};

const coreFeatures = [
    {
        title: "Tables et invitations",
        description:
            "Créez une table, ajoutez les membres, gérez les rôles et envoyez des invitations ciblées ou partageables.",
        icon: Users,
    },
    {
        title: "Préparation de session",
        description:
            "Annoncez une date, récupérez les réponses RSVP et gardez le résumé de la prochaine session accessible.",
        icon: CalendarDays,
    },
    {
        title: "Messages de table",
        description:
            "Échangez avant la session, pendant la partie et en privé entre membres lorsque le groupe a besoin de se coordonner.",
        icon: MessageSquare,
    },
    {
        title: "Notes et outils de session",
        description:
            "Centralisez les notes personnelles ou de groupe, les présences, les dés et les modules utiles à la partie.",
        icon: BookOpen,
    },
];

const useCases = [
    "Savoir qui vient à la prochaine session.",
    "Retrouver les notes et décisions du groupe.",
    "Donner au MJ un espace clair pour piloter la session.",
    "Éviter que les infos importantes se perdent dans plusieurs canaux.",
];

function ProductSnapshot() {
    return (
        <div className="bg-card rounded-lg border p-4 text-left shadow-sm">
            <div className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-primary text-xs font-bold tracking-widest uppercase">
                        Espace de table
                    </p>
                    <p className="mt-1 text-lg font-bold">Les Veilleurs du Nord</p>
                </div>
                <div className="bg-muted/40 rounded-md border px-3 py-2 text-xs font-semibold">
                    Prochaine session · 4 réponses
                </div>
            </div>

            <div className="grid gap-3 pt-4 md:grid-cols-3">
                <div className="rounded-md border p-3">
                    <Mail className="text-primary h-4 w-4" />
                    <p className="mt-3 text-sm font-bold">Avant la session</p>
                    <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                        Messages de préparation et réponses RSVP.
                    </p>
                </div>
                <div className="rounded-md border p-3">
                    <MessageSquare className="text-primary h-4 w-4" />
                    <p className="mt-3 text-sm font-bold">Pendant la partie</p>
                    <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                        Messages de session, présence et outils utiles.
                    </p>
                </div>
                <div className="rounded-md border p-3">
                    <ShieldCheck className="text-primary h-4 w-4" />
                    <p className="mt-3 text-sm font-bold">Messages privés</p>
                    <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                        Échanges directs entre membres de la table.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function HomePage() {
    return (
        <>
            <section className="bg-muted/30 border-b">
                <Container className="grid gap-10 py-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:py-20">
                    <div className="max-w-2xl space-y-6">
                        <p className="text-primary text-sm font-bold tracking-widest uppercase">
                            Organisation de tables JDR
                        </p>
                        <div className="space-y-4">
                            <h1 className="text-4xl leading-tight font-extrabold tracking-tight md:text-6xl">
                                Un espace clair pour préparer et jouer vos sessions.
                            </h1>
                            <p className="text-muted-foreground max-w-xl text-lg leading-relaxed">
                                {siteConfig.name} aide un groupe de jeu de rôle à gérer ses tables,
                                ses invitations, ses échanges et les outils utiles pendant la
                                partie.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Button size="lg" className="h-12 px-6" asChild>
                                <Link href="/register">
                                    Créer un compte
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" className="h-12 px-6" asChild>
                                <Link href="/login">Se connecter</Link>
                            </Button>
                        </div>
                    </div>
                    <ProductSnapshot />
                </Container>
            </section>

            <Container className="space-y-14 py-14 md:py-18">
                <section className="space-y-6">
                    <div className="max-w-2xl space-y-3">
                        <h2 className="text-3xl font-bold tracking-tight">
                            Ce que The-Walk centralise
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            La V1 reste volontairement ciblée : aider une table à s’organiser sans
                            remplacer vos règles, vos cartes ou vos habitudes de jeu.
                        </p>
                    </div>
                    <div className="grid gap-5 md:grid-cols-2">
                        {coreFeatures.map((feature) => {
                            const Icon = feature.icon;

                            return (
                                <Card key={feature.title} className="rounded-lg">
                                    <CardHeader>
                                        <div className="bg-primary/10 text-primary mb-2 w-fit rounded-md p-3">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground text-sm leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </section>

                <section className="grid gap-8 border-t pt-12 lg:grid-cols-[0.8fr_1fr]">
                    <div className="space-y-3">
                        <h2 className="text-3xl font-bold tracking-tight">Pour quels usages ?</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            The-Walk sert surtout à réduire les oublis et à garder les informations
                            de table au même endroit.
                        </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {useCases.map((useCase) => (
                            <div key={useCase} className="bg-card rounded-md border p-4">
                                <p className="text-sm font-medium">{useCase}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="bg-card rounded-lg border p-6 md:p-8">
                    <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold">Découvrir le périmètre V1</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                L’outil est pensé pour les tables qui veulent une organisation plus
                                fiable, pas une plateforme complète de jeu en ligne.
                            </p>
                        </div>
                        <Button variant="outline" asChild>
                            <Link href="/about">Découvrir The-Walk</Link>
                        </Button>
                    </div>
                </section>
            </Container>
        </>
    );
}
