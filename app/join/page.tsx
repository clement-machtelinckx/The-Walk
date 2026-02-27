import type { Metadata } from "next";
import { Phone, Mail } from "lucide-react";

import { Container } from "@/components/layout/container";
import { InfoCard } from "@/components/special/infoCard";
import { CONTACTS } from "@/config/contact";
import { JoinForm } from "@/components/form/join/join-form";

export const metadata: Metadata = {
    title: "Nous rejoindre",
    description:
        "Vous êtes un professionnel de l'audioprothèse et souhaitez offrir à vos clients une protection complète ? Rejoignez-nous pour bénéficier de nos solutions d'assurance adaptées à votre activité.",
};

const c = CONTACTS.protecaudio;

export default function JoinPage() {
    return (
        <section className="py-10 md:py-16">
            <Container>
                <div className="grid gap-8 lg:grid-cols-3 lg:items-start">
                    {/* Colonne gauche */}
                    <div className="lg:col-span-1">
                        <InfoCard
                            logoSrc="/logo-transparent.png"
                            logoAlt="Protec'audio"
                            title="Nous contacter"
                            phone={c.phone}
                            hours={c.hours}
                            email={c.email}
                            description="Vous bénéficierez d’un échange avec un de nos experts pour obtenir la meilleure couverture assurantielle."
                            phoneIcon={Phone}
                            emailIcon={Mail}
                        />
                    </div>

                    {/* Colonne droite */}
                    <div className="space-y-8 lg:col-span-2">
                        <div className="space-y-4">
                            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                                Rejoindre le cabinet{" "}
                                <span className="text-primary">Protec’audio</span> c’est :
                            </h1>

                            <div className="space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                                <p>
                                    Participer à une aventure professionnelle motivante et développer
                                    votre expertise dans un environnement en pleine expansion.
                                </p>
                                <p>
                                    Choisir un métier dont vous pouvez être fier, avec un engagement pour
                                    chaque client : proposer la meilleure solution pour le protéger.
                                </p>
                                <p>
                                    Acquérir une solide expérience commerciale “phygitale” : l’efficacité
                                    du face à face alliée aux apports du digital et de l’IA. Bénéficier de
                                    la force d’un groupe qui vous offre des possibilités de mobilité
                                    géographique et/ou professionnelle.
                                </p>
                            </div>
                        </div>

                        <JoinForm />
                    </div>
                </div>
            </Container>
        </section>
    );
}