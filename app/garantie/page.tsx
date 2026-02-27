import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { MapPin, EyeOff, Settings } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { GarantieCard } from "@/components/special/garantieCard";

export const metadata: Metadata = {
    title: "Garanties",
    description:
        "Découvrez nos garanties d'assurance pour audioprothèses : Perte, Vol, Casse. Protégez vos patients et sécurisez leur investissement avec nos solutions adaptées.",
};

const GARANTIES = [
    {
        title: "GARANTIE PERTE",
        body:
            "Cette couverture est pertinente pour des appareils de petite taille, elle offre la possibilité de remplacer le dispositif égaré en l’absence d’une participation des dispositifs des régimes obligatoires et mutuelles.*",
        icon: MapPin,
    },
    {
        title: "GARANTIE VOL",
        body:
            "La garantie vol protège l'assuré contre la soustraction frauduleuse de son audioprothèse. Elle entre en jeu lorsque l'appareil est dérobé, que ce soit par effraction, agression ou à l'insu de son propriétaire.*",
        icon: EyeOff,
    },
    {
        title: "GARANTIE CASSE",
        body:
            "La garantie casse couvre les dégâts matériels subis par l'audioprothèse suite à un évènement soudain et imprévu. Cette protection assure la réparation ou le remplacement de l'appareil endommagé, permettant ainsi à l'assuré de retrouver rapidement l'usage de son dispositif auditif.*",
        icon: Settings,
    },
] as const;

export default function GarantiePage() {
    return (
        <>
            {/* HERO */}
            <section className="py-16 md:py-24">
                <Container>
                    <div className="grid items-center gap-10 md:grid-cols-2">
                        <div className="space-y-6">
                            <h1 className="text-3xl text-primary font-semibold tracking-tight md:text-5xl">
                                Assurance appareil auditif
                            </h1>

                            <p className="max-w-prose leading-relaxed text-muted-foreground font-semibold">
                                Audioprothésistes, sécurisez chaque appareillage, proposez à vos patients
                                une sérénité totale. Assurance Perte, Vol, Casse.
                            </p>

                            <div className="pt-2">
                                <Button asChild size="lg">
                                    <Link href="https://eurossur-audio.fr/contact/">Prendre RDV</Link>
                                </Button>
                            </div>
                        </div>

                        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border bg-muted">
                            <Image
                                src="/bebe-pigeon.jpg"
                                alt="Appareil auditif - illustration"
                                fill
                                className="object-cover"
                                sizes="(min-width: 768px) 50vw, 100vw"
                                priority
                            />
                        </div>
                    </div>
                </Container>
            </section>

            {/* GARANTIES */}
            <section className="py-16 md:py-24">
                <Container>
                    <div className="space-y-3">
                        <h2 className="text-3xl text-primary text-center font-semibold tracking-tight md:text-5xl">
                            Nos garanties
                        </h2>
                        <p className="mx-auto max-w-4xl text-center leading-relaxed text-muted-foreground font-semibold">
                            En proposant nos solutions, les audioprothésistes offrent à leurs patients
                            une tranquillité d’esprit. Des couvertures indispensables, efficaces et
                            totalement adaptées à la protection des appareillages.
                        </p>
                    </div>

                    <div className="mt-10 grid gap-6 md:grid-cols-3">
                        {GARANTIES.map((g) => (
                            <GarantieCard
                                key={g.title}
                                title={g.title}
                                body={g.body}
                                icon={g.icon}
                            />
                        ))}
                    </div>

                    <div className="mt-10 flex flex-col items-center gap-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            * Sous réserve des conditions spécifiques énoncées dans le contrat
                            d&apos;assurance.
                        </p>

                        <Button asChild size="lg">
                            <Link href="/contact">Voir les détails</Link>
                        </Button>
                    </div>
                </Container>
            </section>

            {/* LES APPAREILS ASSURÉS */}
            <section className="py-16 md:py-24">
                <Container>
                    <div className="grid items-center gap-10 md:grid-cols-2">
                        <div className="space-y-6">
                            <h2 className="text-3xl text-primary font-semibold tracking-tight md:text-5xl">
                                Les appareils assurés
                            </h2>

                            <p className="max-w-prose leading-relaxed text-muted-foreground font-semibold">
                                Les audioprothèses Classe 1 ou 2 sont couverts pendant 4 ans. Les
                                accessoires système FM, Cros ou ancrage osseux sont pris en charge
                                pendant 2 ans selon l’âge ou la situation du patient.
                                <br />
                                <br />
                                Avec nos programmes, les audioprothésistes apportent une solution aux
                                utilisateurs afin de préserver leur investissement et assurer la
                                continuité de leur correction auditive indispensable.
                            </p>
                        </div>

                        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border bg-muted">
                            <Image
                                src="/images/appareil_auditif.jpg"
                                alt="Illustration appareils assurés"
                                fill
                                className="object-cover"
                                sizes="(min-width: 768px) 50vw, 100vw"
                            />
                        </div>
                    </div>
                </Container>
            </section>

            {/* CTA */}
            <section className="py-16 md:py-24">
                <Container>
                    <div className="grid items-center gap-10 md:grid-cols-2">
                        <div className="space-y-6">
                            <h2 className="text-3xl text-primary font-semibold tracking-tight md:text-5xl">
                                Protection de votre activité
                            </h2>

                            <p className="max-w-prose leading-relaxed text-muted-foreground font-semibold">
                                Nous sommes à vos côtés pour vous aider à protéger vos biens et votre équipe.
                            </p>

                            <Button asChild size="lg">
                                <Link href="/contact">Prendre RDV</Link>
                            </Button>
                        </div>

                        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border bg-muted">
                            <Image
                                src="/bebe-pigeon.jpg"
                                alt="Illustration protection activité"
                                fill
                                className="object-cover"
                                sizes="(min-width: 768px) 50vw, 100vw"
                            />
                        </div>
                    </div>
                </Container>
            </section>
        </>
    );
}