import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Container } from "@/components/layout/container";
import { JsonLd } from "@/components/seo/json-ld";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
    title: "FAQ",
    description:
        "Questions fréquentes sur The-Walk : tables, invitations, sessions, messages, mobile et périmètre V1.",
    alternates: {
        canonical: "/faq",
    },
    openGraph: {
        title: "FAQ The-Walk",
        description: "Les réponses utiles avant de créer ou rejoindre une table JDR sur The-Walk.",
        url: "/faq",
    },
};

const faqs = [
    {
        question: "Qu’est-ce que The-Walk ?",
        answer: "The-Walk est une application web pour organiser une table de jeu de rôle : membres, invitations, sessions à venir, réponses RSVP, messages, notes et outils de session.",
    },
    {
        question: "Comment créer ou rejoindre une table ?",
        answer: "Un compte permet de créer une table. Pour rejoindre une table existante, il faut recevoir une invitation du MJ ou du groupe.",
    },
    {
        question: "Faut-il installer quelque chose ?",
        answer: "Non. The-Walk fonctionne dans le navigateur, sur ordinateur comme sur mobile.",
    },
    {
        question: "Quels messages sont gérés ?",
        answer: "La V1 prévoit les messages avant session, les messages pendant la partie et les messages privés entre membres d’une même table.",
    },
    {
        question: "À quoi sert l’espace de session ?",
        answer: "Il regroupe le résumé, les présences, les notes, les dés et les modules que le MJ choisit d’afficher pendant la partie.",
    },
    {
        question: "The-Walk remplace-t-il une table virtuelle ?",
        answer: "Non. The-Walk ne remplace pas vos cartes, vos règles ou vos outils de jeu. Il centralise l’organisation et les échanges du groupe.",
    },
    {
        question: "The-Walk est-il gratuit ?",
        answer: "La V1 est en phase de stabilisation. Les conditions d’accès seront précisées au moment de l’ouverture plus large.",
    },
];

const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
        },
    })),
};

export default function FaqPage() {
    return (
        <Container className="space-y-10 py-12 md:py-16">
            <JsonLd data={faqJsonLd} />
            <section className="mx-auto max-w-3xl space-y-5">
                <p className="text-primary text-sm font-bold tracking-widest uppercase">FAQ</p>
                <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
                    Questions fréquentes
                </h1>
                <p className="text-muted-foreground text-lg leading-relaxed">
                    Réponses courtes sur le périmètre actuel de {siteConfig.name}.
                </p>
            </section>

            <section className="bg-card mx-auto max-w-3xl rounded-lg border px-5 py-2">
                <Accordion type="single" collapsible>
                    {faqs.map((item, index) => (
                        <AccordionItem key={item.question} value={`item-${index}`}>
                            <AccordionTrigger className="text-base font-bold">
                                {item.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground leading-relaxed">
                                {item.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </section>

            <section className="mx-auto flex max-w-3xl flex-col gap-3 border-t pt-8 sm:flex-row">
                <Button asChild>
                    <Link href="/register">Créer un compte</Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/about">Découvrir The-Walk</Link>
                </Button>
            </section>
        </Container>
    );
}
