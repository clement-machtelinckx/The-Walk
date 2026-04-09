import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { siteConfig } from "@/config/site";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, Sword, BookOpen, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
    title: "Le cockpit de vos sessions JDR",
    description: siteConfig.description,
};

export default function HomePage() {
    return (
        <Container>
            <section className="flex flex-col items-center justify-center py-12 text-center md:py-24">
                {/* Hero Section */}
                <div className="max-w-3xl space-y-6">
                    <div className="bg-primary/10 text-primary mx-auto w-fit rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase">
                        Prêt pour l&apos;aventure
                    </div>
                    <h1 className="text-5xl font-extrabold tracking-tighter italic md:text-8xl">
                        {siteConfig.name}
                    </h1>
                    <p className="text-muted-foreground mx-auto max-w-2xl text-xl leading-relaxed md:text-2xl">
                        Simplifiez l&apos;organisation de vos sessions de jeu de rôle.
                        Planification, suivi de session et notes partagées, tout est là.
                    </p>
                </div>

                {/* Main CTAs */}
                <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row">
                    <Button
                        size="lg"
                        className="h-14 rounded-full px-10 text-lg font-bold shadow-lg"
                        asChild
                    >
                        <Link href="/register">
                            Rejoindre l&apos;aventure
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        className="h-14 rounded-full px-10 text-lg font-bold"
                        asChild
                    >
                        <Link href="/login">Déjà MJ ? Se connecter</Link>
                    </Button>
                </div>

                {/* Feature Grid */}
                <div className="mt-24 grid grid-cols-1 gap-12 md:grid-cols-3">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="bg-primary/10 text-primary rounded-2xl p-4">
                            <Calendar className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold tracking-tight uppercase opacity-80">
                            Planning Intelligent
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Gérez vos dates de session et les présences (RSVP) sans friction.
                            The-Walk s&apos;occupe des rappels pour vous.
                        </p>
                    </div>

                    <div className="flex flex-col items-center space-y-4">
                        <div className="bg-primary/10 text-primary rounded-2xl p-4">
                            <Sword className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold tracking-tight uppercase opacity-80">
                            Session Live
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Un cockpit dédié pour vos sessions en cours. Chat direct, suivi de
                            présence et outils MJ à portée de clic.
                        </p>
                    </div>

                    <div className="flex flex-col items-center space-y-4">
                        <div className="bg-primary/10 text-primary rounded-2xl p-4">
                            <BookOpen className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold tracking-tight uppercase opacity-80">
                            Notes & Archives
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Conservez l&apos;historique de vos aventures. Notes partagées ou
                            personnelles, rien ne se perd entre deux sessions.
                        </p>
                    </div>
                </div>

                {/* Secondary Invite Link */}
                <div className="mt-20 border-t pt-12">
                    <p className="text-muted-foreground text-sm font-medium">
                        Vous avez reçu un lien d&apos;invitation ?
                    </p>
                    <Link
                        href="/login"
                        className="text-primary mt-2 inline-flex items-center text-sm font-bold hover:underline"
                    >
                        Connectez-vous pour rejoindre votre table
                        <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                </div>
            </section>
        </Container>
    );
}
