import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
    title: "À propos",
    description:
        "The-Walk est un outil sobre pour organiser une table de jeu de rôle, préparer les sessions et centraliser les échanges du groupe.",
    alternates: {
        canonical: "/about",
    },
    openGraph: {
        title: "À propos de The-Walk",
        description:
            "Un espace web pour organiser une table JDR sans remplacer la façon de jouer du groupe.",
        url: "/about",
    },
};

export default function AboutPage() {
    return (
        <Container className="py-12 md:py-16">
            <article className="mx-auto max-w-3xl space-y-10">
                <header className="space-y-5">
                    <p className="text-primary text-sm font-bold tracking-widest uppercase">
                        À propos
                    </p>
                    <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
                        {siteConfig.name} organise ce qui entoure la partie.
                    </h1>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        The-Walk est une application web pour gérer une table de jeu de rôle :
                        membres, invitations, préparation de session, messages, notes et outils
                        utiles pendant la partie.
                    </p>
                </header>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">Ce que l’outil cherche à résoudre</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Dans beaucoup de groupes, les informations importantes finissent dispersées
                        : une date dans un fil de discussion, une note dans un document, une réponse
                        oubliée ailleurs. The-Walk sert à regrouper ces éléments dans un espace de
                        table simple.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">Ce que The-Walk n’est pas</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Ce n’est pas une plateforme de streaming, ni une table virtuelle complète,
                        ni un remplacement de vos règles. La V1 accompagne l’organisation et la
                        session, sans imposer une façon de jouer.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">Le périmètre V1</h2>
                    <ul className="text-muted-foreground grid gap-3 leading-relaxed sm:grid-cols-2">
                        <li className="rounded-md border p-4">Créer et gérer des tables.</li>
                        <li className="rounded-md border p-4">Inviter les membres du groupe.</li>
                        <li className="rounded-md border p-4">
                            Préparer une session et suivre les réponses.
                        </li>
                        <li className="rounded-md border p-4">
                            Échanger avant et pendant la partie.
                        </li>
                        <li className="rounded-md border p-4">
                            Centraliser notes, présence et dés.
                        </li>
                        <li className="rounded-md border p-4">
                            Donner au MJ des contrôles simples.
                        </li>
                    </ul>
                </section>

                <footer className="flex flex-col gap-3 border-t pt-8 sm:flex-row">
                    <Button asChild>
                        <Link href="/register">Créer un compte</Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/faq">Lire la FAQ</Link>
                    </Button>
                </footer>
            </article>
        </Container>
    );
}
