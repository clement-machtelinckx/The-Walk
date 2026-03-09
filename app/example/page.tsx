"use client";

import * as React from "react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { ContactCard } from "@/components/special/contactCard";
import { ContactDialog } from "@/components/special/contactDialog";
import { GarantieCard } from "@/components/special/garantieCard";
import { InfoCard } from "@/components/special/infoCard";
import { AnimatedCounter } from "@/components/special/AnimatedCounter";
import { AudioCentersBlock } from "@/components/special/audioCenter";
import { CONTACTS } from "@/config/contact";
import { siteConfig } from "@/config/site";
import {
    Mail,
    Phone,
    Headphones,
    Shield,
    Briefcase,
    Sparkles,
} from "lucide-react";

type DialogType = "contact" | "support" | null;

export default function ExamplePage() {
    const [open, setOpen] = React.useState<DialogType>(null);

    const defaultContact = CONTACTS.default;
    const supportContact = CONTACTS.support;

    const dialogData =
        open === "contact"
            ? {
                title: "Contact principal",
                phone: defaultContact.phone,
                email: defaultContact.email,
            }
            : open === "support"
                ? {
                    title: "Support",
                    phone: supportContact.phone,
                    email: supportContact.email,
                }
                : null;

    return (
        <>
            <main className="py-16 md:py-24">
                <Container>
                    <div className="mx-auto max-w-4xl text-center">
                        <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
                            Page d’exemple des composants spéciaux
                        </h1>
                        <p className="text-muted-foreground mt-6 text-base leading-relaxed md:text-lg">
                            Cette page sert uniquement de vitrine pour visualiser rapidement les
                            composants conservés dans <code>components/special</code>.
                        </p>
                        <p className="text-muted-foreground mt-3 text-base leading-relaxed md:text-lg">
                            Tu peux t’en servir comme page de démonstration pendant le refacto du
                            skeleton, puis la supprimer ou la garder comme galerie interne.
                        </p>

                        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                            <Button
                                type="button"
                                onClick={() => setOpen("contact")}
                                className="rounded-full rounded-tr-md font-light uppercase tracking-wider"
                            >
                                Ouvrir le dialog contact
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setOpen("support")}
                                className="rounded-full rounded-tr-md font-light uppercase tracking-wider"
                            >
                                Ouvrir le dialog support
                            </Button>
                        </div>
                    </div>
                </Container>
            </main>

            <section className="py-16 md:py-24">
                <Container>
                    <div className="grid gap-6 md:grid-cols-3">
                        <ContactCard
                            title="NOUS APPELER"
                            buttonLabel="Appeler"
                            icon={Phone}
                            onClick={() => setOpen("contact")}
                        />
                        <ContactCard
                            title="SUPPORT"
                            buttonLabel="Contacter le support"
                            icon={Headphones}
                            onClick={() => setOpen("support")}
                        />
                        <ContactCard
                            title="FORMULAIRE"
                            buttonLabel="Accéder au formulaire"
                            icon={Mail}
                            href="/contact/form"
                        />
                    </div>
                </Container>
            </section>

            <section className="py-16 md:py-24">
                <Container>
                    <div className="grid gap-8 lg:grid-cols-3 lg:items-start">
                        <div className="lg:col-span-1">
                            <InfoCard
                                logoSrc="/logo-transparent.png"
                                logoAlt={siteConfig.name}
                                title="Carte d’informations"
                                phone={defaultContact.phone}
                                hours={defaultContact.hours}
                                email={defaultContact.email}
                                description="Exemple de carte de contact réutilisable pour une page contact, une sidebar ou un bloc d’introduction."
                                phoneIcon={Phone}
                                emailIcon={Mail}
                            />
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2 lg:col-span-2">
                            <GarantieCard
                                title="Bloc garantie / service"
                                body="Ce composant fonctionne bien pour présenter une offre, une garantie, un service ou un avantage clé."
                                icon={Shield}
                            />
                            <GarantieCard
                                title="Bloc activité"
                                body="Tu peux l’utiliser dans une grille de 2, 3 ou 4 colonnes pour garder un rendu visuel cohérent."
                                icon={Briefcase}
                                headerClassName="bg-primary"
                            />
                            <GarantieCard
                                title="Bloc mise en avant"
                                body="L’icône et la couleur de fond du header permettent de distinguer rapidement plusieurs catégories."
                                icon={Sparkles}
                            />
                        </div>
                    </div>
                </Container>
            </section>

            <section className="py-16 md:py-24">
                <Container>
                    <h2 className="text-center text-2xl font-bold tracking-tight md:text-3xl">
                        Compteurs animés
                    </h2>

                    <div className="mt-10 grid gap-6 text-center md:grid-cols-3">
                        <AnimatedCounter value={12} suffix="+" label="Sites lancés" />
                        <AnimatedCounter value={24} suffix=" h" label="Temps gagné" duration={1800} />
                        <AnimatedCounter value={98} suffix="%" label="Base réutilisable" duration={2200} />
                    </div>
                </Container>
            </section>

            <section className="py-16 md:py-24">
                <Container>
                    <h2 className="text-center text-2xl font-bold tracking-tight md:text-3xl">
                        Bloc audioCenter
                    </h2>
                    <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-center">
                        Ce composant peut aussi servir comme section “bénéfices”, “avantages” ou
                        “pourquoi nous choisir”, même hors du contexte audio d’origine.
                    </p>
                </Container>

                <div className="mt-10">
                    <AudioCentersBlock />
                </div>
            </section>

            {dialogData ? (
                <ContactDialog
                    open={open !== null}
                    onOpenChange={(value) => setOpen(value ? open : null)}
                    title={dialogData.title}
                    phone={dialogData.phone}
                    email={dialogData.email}
                    imageSrc="/images/contact.png"
                    imageAlt="Illustration de contact"
                />
            ) : null}
        </>
    );
}