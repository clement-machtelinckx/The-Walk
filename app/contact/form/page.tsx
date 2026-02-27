import type { Metadata } from "next";
import { Phone, Mail } from "lucide-react";

import { Container } from "@/components/layout/container";
import { InfoCard } from "@/components/special/infoCard";
import { ContactForm } from "@/components/form/contact/contact-form";
import { CONTACTS } from "@/config/contact";

export const metadata: Metadata = {
    title: "Formulaire de contact",
    description:
        "Contactez-nous pour obtenir des informations sur nos solutions d'assurance, réaliser un contrat ou déclarer un sinistre.",
};

const c = CONTACTS.protecaudio;

export default function ContactFormPage() {
    return (
        <main className="py-16 md:py-24">
            <Container>
                <div className="mb-10 space-y-3">
                    <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                        Nous contacter
                    </h1>
                    <p className="max-w-3xl text-muted-foreground">
                        Remplissez le formulaire, nous revenons vers vous rapidement.
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-3 lg:items-start">
                    {/* gauche: 1 col */}
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

                    {/* droite: 2 cols */}
                    <div className="lg:col-span-2">
                        <ContactForm />
                    </div>
                </div>
            </Container>
        </main>
    );
}