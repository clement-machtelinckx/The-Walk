import type { Metadata } from "next";
import { ArrowRight, Compass, Gamepad2, Heart, Layers3, Users } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/layout/container";
import { PublicAccessActions } from "@/components/layout/public-access-actions";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
    title: "À propos",
    description:
        "Découvrez l’intention derrière The-Walk, une application développée par un solo dev passionné de jeu de rôle pour préparer moins et jouer plus.",
    alternates: {
        canonical: "/about",
    },
    openGraph: {
        title: "À propos de The-Walk",
        description:
            "Un projet passionné qui rassemble les outils utiles pour organiser, préparer et jouer une partie de JDR.",
        url: "/about",
    },
};

const intentions = [
    {
        title: "Remettre le jeu au centre",
        description:
            "La préparation doit aider la partie, pas devenir une seconde aventure à terminer avant de pouvoir jouer.",
        icon: Gamepad2,
    },
    {
        title: "Rassembler l’utile",
        description:
            "Tables, sessions, échanges et outils de jeu vivent dans un même espace simple à retrouver.",
        icon: Layers3,
    },
    {
        title: "Évoluer avec les tables",
        description:
            "Le projet avance progressivement, à partir des usages et des retours concrets des joueurs et des MJ.",
        icon: Users,
    },
];

export default function AboutPage() {
    return (
        <>
            <section className="bg-muted/30 border-b">
                <Container className="py-12 md:py-18">
                    <div className="mx-auto max-w-3xl space-y-6 text-center">
                        <Badge variant="secondary">À propos de {siteConfig.name}</Badge>
                        <h1 className="text-4xl leading-tight font-extrabold tracking-tight md:text-6xl">
                            Un projet passionné pour
                            <span className="text-primary block">préparer moins et jouer plus.</span>
                        </h1>
                        <p className="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed">
                            The-Walk est développé par un solo dev amateur de jeux de rôle, avec une
                            envie simple : rendre l’organisation plus fluide pour laisser davantage
                            de place au plaisir de jouer.
                        </p>
                        <div className="flex justify-center">
                            <PublicAccessActions />
                        </div>
                    </div>
                </Container>
            </section>

            <Container className="space-y-16 py-14 md:py-20">
                <section className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
                    <div className="space-y-4">
                        <div className="bg-primary/10 text-primary w-fit rounded-xl p-3">
                            <Heart className="h-6 w-6" />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight">
                            Né d’un besoin très concret
                        </h2>
                    </div>
                    <div className="text-muted-foreground space-y-4 leading-relaxed">
                        <p>
                            Préparer une partie peut vite vouloir dire jongler entre plusieurs
                            conversations, documents, notes et outils. Cette dispersion fait perdre
                            du temps et encourage parfois l’over-prep, alors que l’essentiel reste de
                            réunir le groupe et de lancer l’aventure.
                        </p>
                        <p>
                            The-Walk cherche à réunir dans une seule app les outils utiles pour
                            organiser une table, préparer une session et accompagner la partie, sans
                            imposer une nouvelle façon de jouer.
                        </p>
                    </div>
                </section>

                <section className="space-y-7">
                    <div className="mx-auto max-w-2xl space-y-3 text-center">
                        <p className="text-primary text-xs font-bold tracking-widest uppercase">
                            L’intention
                        </p>
                        <h2 className="text-3xl font-bold tracking-tight">
                            Simple, utile et tourné vers la partie
                        </h2>
                    </div>
                    <div className="grid gap-5 md:grid-cols-3">
                        {intentions.map((intention) => {
                            const Icon = intention.icon;

                            return (
                                <Card key={intention.title} className="gap-4">
                                    <CardHeader>
                                        <div className="bg-primary/10 text-primary mb-2 w-fit rounded-lg p-3">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <CardTitle className="text-xl">{intention.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground text-sm leading-relaxed">
                                            {intention.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </section>

                <section className="bg-card mx-auto grid max-w-5xl gap-7 rounded-xl border p-6 md:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Compass className="text-primary h-5 w-5" />
                            <p className="text-primary text-xs font-bold tracking-widest uppercase">
                                La suite
                            </p>
                        </div>
                        <h2 className="text-2xl font-bold">Une base sérieuse, appelée à grandir</h2>
                        <p className="text-muted-foreground max-w-2xl leading-relaxed">
                            La première version pose les fondations : tables, sessions, échanges,
                            notes et outils de jeu. La plateforme continuera d’évoluer progressivement
                            avec des composants utiles, choisis pour servir les parties plutôt que
                            les alourdir.
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/">
                            Découvrir le produit
                            <ArrowRight />
                        </Link>
                    </Button>
                </section>
            </Container>
        </>
    );
}
