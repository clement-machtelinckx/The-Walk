import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { MapPin, EyeOff, Settings } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { GarantieCard } from "@/components/special/garantieCard";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
    title: "Garanties",
    description:
        "Découvrez nos garanties d'assurance pour audioprothèses : Perte, Vol, Casse. Protégez vos patients et sécurisez leur investissement avec nos solutions adaptées.",
    openGraph: {
        title: "Garanties assurance audioprothèses",
        description:
            "Garanties Perte, Vol, Casse pour appareils auditifs. Protégez vos patients et sécurisez leur investissement.",
    },
};

const GARANTIES = [
    {
        title: "GARANTIE PERTE",
        body: "Cette couverture est pertinente pour des appareils de petite taille, elle offre la possibilité de remplacer le dispositif égaré en l’absence d’une participation des dispositifs des régimes obligatoires et mutuelles.*",
        icon: MapPin,
    },
    {
        title: "GARANTIE VOL",
        body: "La garantie vol protège l'assuré contre la soustraction frauduleuse de son audioprothèse. Elle entre en jeu lorsque l'appareil est dérobé, que ce soit par effraction, agression ou à l'insu de son propriétaire.*",
        icon: EyeOff,
    },
    {
        title: "GARANTIE CASSE",
        body: "La garantie casse couvre les dégâts matériels subis par l'audioprothèse suite à un évènement soudain et imprévu. Cette protection assure la réparation ou le remplacement de l'appareil endommagé, permettant ainsi à l'assuré de retrouver rapidement l'usage de son dispositif auditif.*",
        icon: Settings,
    },
] as const;

export default function GarantiePage() {
    return (
        <>
            <JsonLd
                data={{
                    "@context": "https://schema.org",
                    "@type": "Service",
                    name: "Assurance appareils auditifs ProtecAudio",
                    provider: {
                        "@type": "Organization",
                        name: "ProtecAudio",
                        url: "https://protecaudio.fr",
                    },
                    description:
                        "Garanties d'assurance Perte, Vol et Casse pour audioprothèses Classe 1 et 2, couverture 4 ans.",
                    serviceType: "Assurance appareils auditifs",
                    areaServed: {
                        "@type": "Country",
                        name: "France",
                    },
                    hasOfferCatalog: {
                        "@type": "OfferCatalog",
                        name: "Garanties audioprothèses",
                        itemListElement: [
                            {
                                "@type": "Offer",
                                itemOffered: {
                                    "@type": "Service",
                                    name: "Garantie Perte",
                                    description: "Remplacement du dispositif auditif égaré.",
                                },
                            },
                            {
                                "@type": "Offer",
                                itemOffered: {
                                    "@type": "Service",
                                    name: "Garantie Vol",
                                    description:
                                        "Couverture contre la soustraction frauduleuse de l'audioprothèse.",
                                },
                            },
                            {
                                "@type": "Offer",
                                itemOffered: {
                                    "@type": "Service",
                                    name: "Garantie Casse",
                                    description:
                                        "Réparation ou remplacement de l'appareil suite à un dommage matériel.",
                                },
                            },
                        ],
                    },
                }}
            />
            <JsonLd
                data={{
                    "@context": "https://schema.org",
                    "@type": "BreadcrumbList",
                    itemListElement: [
                        {
                            "@type": "ListItem",
                            position: 1,
                            name: "Accueil",
                            item: "https://protecaudio.fr",
                        },
                        {
                            "@type": "ListItem",
                            position: 2,
                            name: "Garanties",
                            item: "https://protecaudio.fr/garantie",
                        },
                    ],
                }}
            />
            {/* HERO */}
            <section aria-label="Assurance appareil auditif" className="py-16 md:py-24">
                <Container>
                    <div className="grid items-center gap-10 md:grid-cols-2">
                        <div className="space-y-6">
                            <h1 className="text-primary text-3xl font-semibold tracking-tight md:text-5xl">
                                Assurance appareil auditif
                            </h1>

                            <p className="text-muted-foreground max-w-prose leading-relaxed font-semibold">
                                Audioprothésistes, sécurisez chaque appareillage, proposez à vos
                                patients une sérénité totale. Assurance Perte, Vol, Casse.
                            </p>

                            <div className="pt-2">
                                <Button asChild size="lg">
                                    <Link href="https://eurossur-audio.fr/contact/">
                                        Prendre RDV
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        <div className="bg-muted relative aspect-[16/10] w-full overflow-hidden rounded-2xl border">
                            <Image
                                src="/images/assurance_appareil_audioprothese.jpg"
                                alt="Assurance Appareil auditif - illustration"
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
            <section aria-label="Nos garanties" className="py-16 md:py-24">
                <Container>
                    <div className="space-y-3">
                        <h2 className="text-primary text-center text-3xl font-semibold tracking-tight md:text-5xl">
                            Nos garanties
                        </h2>
                        <p className="text-muted-foreground mx-auto max-w-4xl text-center leading-relaxed font-semibold">
                            En proposant nos solutions, les audioprothésistes offrent à leurs
                            patients une tranquillité d’esprit. Des couvertures indispensables,
                            efficaces et totalement adaptées à la protection des appareillages.
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
                        <p className="text-muted-foreground text-sm">
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
            <section aria-label="Appareils assurés" className="py-16 md:py-24">
                <Container>
                    <div className="grid items-center gap-10 md:grid-cols-2">
                        <div className="space-y-6">
                            <h2 className="text-primary text-3xl font-semibold tracking-tight md:text-5xl">
                                Les appareils assurés
                            </h2>

                            <p className="text-muted-foreground max-w-prose leading-relaxed font-semibold">
                                Les audioprothèses Classe 1 ou 2 sont couverts pendant 4 ans. Les
                                accessoires système FM, Cros ou ancrage osseux sont pris en charge
                                pendant 2 ans selon l’âge ou la situation du patient.
                                <br />
                                <br />
                                Avec nos programmes, les audioprothésistes apportent une solution
                                aux utilisateurs afin de préserver leur investissement et assurer la
                                continuité de leur correction auditive indispensable.
                            </p>
                        </div>

                        <div className="bg-muted relative aspect-[16/10] w-full overflow-hidden rounded-2xl border">
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
            <section aria-label="Protection activité" className="py-16 md:py-24">
                <Container>
                    <div className="grid items-center gap-10 md:grid-cols-2">
                        <div className="space-y-6">
                            <h2 className="text-primary text-3xl font-semibold tracking-tight md:text-5xl">
                                Protection de votre activité
                            </h2>

                            <p className="text-muted-foreground max-w-prose leading-relaxed font-semibold">
                                Nous sommes à vos côtés pour vous aider à protéger vos biens et
                                votre équipe.
                            </p>

                            <Button asChild size="lg">
                                <Link href="/contact">Prendre RDV</Link>
                            </Button>
                        </div>

                        <div className="bg-muted relative aspect-[16/10] w-full overflow-hidden rounded-2xl border">
                            <Image
                                src="/images/protection.jpg"
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
