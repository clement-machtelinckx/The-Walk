import type { Metadata } from "next";
import Link from "next/link";
import {
    ArrowRight,
    BookOpenCheck,
    CalendarClock,
    Check,
    Dice5,
    FileImage,
    Map,
    PencilRuler,
    Sparkles,
    Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/layout/container";
import { PublicAccessActions } from "@/components/layout/public-access-actions";
import Image from "next/image";
import { getAvatarImagePath } from "@/config/avatars";

export const metadata: Metadata = {
    title: "Préparer moins, jouer plus",
    description:
        "The-Walk aide les groupes de jeu de rôle à créer leurs tables, préparer leurs sessions et retrouver les outils utiles pour jouer.",
    alternates: {
        canonical: "/",
    },
    openGraph: {
        title: "The-Walk — préparer moins, jouer plus",
        description:
            "Un espace clair pour organiser une table JDR et passer plus vite de la préparation à la partie.",
        url: "/",
    },
};

const currentFeatures = [
    {
        title: "Crée ta table",
        description: "Rassemble tes amis, attribue les rôles et partage une invitation au groupe.",
        icon: Users,
    },
    {
        title: "Planifie les sessions",
        description:
            "Prépare la prochaine date, suis les réponses et envoie des rappels par mail aux aventuriers.",
        icon: CalendarClock,
    },
    {
        title: "Joue avec les bons outils",
        description:
            "Retrouve les dés, les notes, les présences et les échanges privés ou publics au même endroit.",
        icon: Dice5,
    },
];

const roadmapItems = [
    { label: "Plus de composants utiles pendant la partie", icon: Sparkles },
    { label: "Un espace de dessin pour vivre l’aventure en live", icon: PencilRuler },
    { label: "Une aide aux règles pour plusieurs jeux de rôle", icon: BookOpenCheck },
    { label: "L’import d’images et de documents de campagne", icon: FileImage },
];

const firstSteps = [
    {
        title: "Entre dans The-Walk",
        description: "Crée ton compte ou connecte-toi pour retrouver directement tes tables.",
    },
    {
        title: "Rejoins ton groupe",
        description: "Crée une table en tant que MJ ou accepte l’invitation reçue de ton groupe.",
    },
    {
        title: "Prépare, réunis, joue",
        description: "Planifie la session, rassemble tes potes et passe rapidement à la partie.",
    },
    {
        title: "Clôture sans perdre le fil",
        description: "Termine la session puis retrouve son historique et les informations utiles.",
    },
];

function VisualPlaceholder({
    title,
    description,
    className,
}: Readonly<{ title: string; description: string; className?: string }>) {
    return (
        <div
            className={`border-primary/20 bg-primary/5 flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center ${className ?? ""}`}
        >
            <Map className="text-primary/60 h-8 w-8" />
            <p className="mt-4 font-bold">{title}</p>
            <p className="text-muted-foreground mt-1 max-w-xs text-sm leading-relaxed">
                {description}
            </p>
            <Badge variant="outline" className="bg-background mt-4">
                Capture à venir
            </Badge>
        </div>
    );
}

export default function HomePage() {
    return (
        <>
            <section className="bg-muted/30 border-b">
                <Container className="grid gap-10 py-12 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:py-20">
                    <div className="max-w-2xl space-y-7">
                        <Badge variant="secondary">Pour les tables de jeu de rôle</Badge>
                        <div className="space-y-4">
                            <h1 className="text-4xl leading-tight font-extrabold tracking-tight md:text-6xl">
                                Moins d’over-prep.
                                <span className="text-primary block">Plus de jeu immédiat.</span>
                            </h1>
                            <p className="text-muted-foreground max-w-xl text-lg leading-relaxed">
                                The-Walk réunit la préparation, le groupe et les outils de session
                                dans une app claire, pour passer moins de temps à tout organiser et
                                plus de temps à jouer.
                            </p>
                        </div>
                        <PublicAccessActions />
                        <Link
                            href="#premiers-pas"
                            className="text-muted-foreground hover:text-primary inline-flex items-center gap-2 text-sm font-semibold transition-colors"
                        >
                            Voir comment commencer
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="border-primary/15 bg-background/70 relative mx-auto w-full max-w-xl overflow-hidden rounded-2xl border p-2 shadow-xl shadow-black/10 lg:mx-0">
                        <Image
                            src="/images/hero_image.webp"
                            alt="Quatre amis réunis autour d’une table de jeu de rôle fantasy, accompagnés par leur téléphone"
                            width={1200}
                            height={900}
                            priority
                            sizes="(min-width: 1024px) 42vw, 100vw"
                            className="aspect-[4/3] w-full rounded-xl object-cover"
                        />
                    </div>
                </Container>
            </section>

            <Container className="space-y-20 py-14 md:py-20">
                <section className="space-y-8">
                    <div className="max-w-2xl space-y-3">
                        <p className="text-primary text-xs font-bold tracking-widest uppercase">
                            Disponible aujourd’hui
                        </p>
                        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                            Tout ce qu’il faut pour tester une partie organisée
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Commence simplement : crée le groupe, prépare la prochaine session et
                            garde les outils utiles à portée de main.
                        </p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-3">
                        {currentFeatures.map((feature) => {
                            const Icon = feature.icon;

                            return (
                                <Card key={feature.title} className="gap-4 rounded-xl">
                                    <CardHeader>
                                        <div className="bg-primary/10 text-primary mb-2 w-fit rounded-lg p-3">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <CardTitle className="text-xl">{feature.title}</CardTitle>
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

                    <div className="grid gap-4 md:grid-cols-2">
                        <VisualPlaceholder
                            title="Préparation de session"
                            description="Future capture des réponses, rappels et informations de la prochaine session."
                        />
                        <VisualPlaceholder
                            title="Outils pendant la partie"
                            description="Future capture des dés, messages et composants accessibles en session."
                        />
                    </div>
                </section>

                <section className="bg-card grid gap-8 rounded-xl border p-6 md:p-10 lg:grid-cols-[0.75fr_1fr]">
                    <div className="space-y-4">
                        <Badge variant="outline">À venir</Badge>
                        <h2 className="text-3xl font-bold tracking-tight">
                            La suite reste tournée vers la partie
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            The-Walk évolue progressivement avec de nouveaux outils pour accompagner
                            le jeu, sans alourdir l’expérience actuelle.
                        </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {roadmapItems.map((item) => {
                            const Icon = item.icon;

                            return (
                                <div
                                    key={item.label}
                                    className="bg-muted/30 flex items-start gap-3 rounded-lg border p-4"
                                >
                                    <Icon className="text-primary mt-0.5 h-5 w-5 shrink-0" />
                                    <p className="text-sm leading-relaxed font-medium">
                                        {item.label}
                                    </p>
                                </div>
                            );
                        })}
                        <div className="text-muted-foreground flex items-center gap-3 rounded-lg border border-dashed p-4 text-sm">
                            <Check className="text-primary h-5 w-5 shrink-0" />
                            Et d’autres améliorations guidées par les usages des tables.
                        </div>
                    </div>
                </section>

                <section id="premiers-pas" className="scroll-mt-24 space-y-8">
                    <div className="max-w-2xl space-y-3">
                        <p className="text-primary text-xs font-bold tracking-widest uppercase">
                            Premiers pas
                        </p>
                        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                            De la découverte à la fin de session
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Quatre étapes simples suffisent pour commencer à utiliser The-Walk avec
                            ton groupe.
                        </p>
                    </div>

                    <ol className="grid gap-4 md:grid-cols-2">
                        {firstSteps.map((step, index) => (
                            <li
                                key={step.title}
                                className="bg-card rounded-xl border p-5 shadow-sm"
                            >
                                <div className="flex items-start gap-4">
                                    <span className="bg-primary text-primary-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                                        {index + 1}
                                    </span>
                                    <div className="space-y-2">
                                        <h3 className="font-bold">{step.title}</h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed">
                                            {step.description}
                                        </p>
                                        {index === 0 && <PublicAccessActions className="pt-2" />}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ol>
                </section>

                <section className="bg-primary text-primary-foreground rounded-xl p-7 md:p-10">
                    <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold">
                                Prêt à préparer moins lourdement ?
                            </h2>
                            <p className="text-primary-foreground/80 max-w-xl leading-relaxed">
                                Ouvre l’app pour retrouver tes tables, ou crée ton compte pour
                                lancer la première session du groupe.
                            </p>
                        </div>
                        <Button variant="secondary" size="lg" asChild>
                            <Link href="/tables">
                                Accéder à The-Walk
                                <ArrowRight />
                            </Link>
                        </Button>
                    </div>
                </section>
            </Container>
        </>
    );
}
