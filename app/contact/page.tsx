import { Container } from "@/components/layout/container";
import { ContactCard } from "@/components/special/contactCard";
import { Reveal } from "@/components/ui/reveal";
import type { Metadata } from "next";
import { Phone, Headphones, Mail } from "lucide-react";

export const metadata: Metadata = {
    title: "Contact",
    description:
        "Contactez-nous pour obtenir des informations sur nos solutions d'assurance, réaliser un contrat ou déclarer un sinistre.",
};

export default function Contact() {
    return (
        <>
            <section className="py-16 md:py-24">
                <Container>
                    <h1 className="text-center text-5xl font-semibold text-primary">
                        Echanger avec Protec&apos;audio
                    </h1>
                    <h2 className="text-center text-lg font-medium text-muted-foreground">
                        Pour obtenir des informations sur nos solutions, réaliser un contrat, déclarer un sinistre
                    </h2>
                </Container>
            </section>

            <section>
                <Container>
                    <div className="grid gap-10 md:grid-cols-3">
                        <div>
                            <Reveal delay={10}>
                                <ContactCard
                                    title="CONTACTER NOTRE CABINET"
                                    href="/appeler-agence"
                                    buttonLabel="Appeler"
                                    icon={Phone}
                                    className="whitespace-pre-line"
                                />
                            </Reveal>
                        </div>

                        <div>
                            <Reveal delay={80}>
                                <ContactCard
                                    title="ETRE RAPPELÉ"
                                    href="/contact/form"
                                    buttonLabel="Être rappelé"
                                    icon={Headphones}
                                />
                            </Reveal>
                        </div>

                        <div>
                            <Reveal delay={160}>
                                <ContactCard
                                    title="ENVOYER UN E-MAIL"
                                    href="/contact/form"
                                    buttonLabel="Envoyer un e-mail"
                                    icon={Mail}
                                />
                            </Reveal>
                        </div>
                    </div>
                </Container>
            </section>
        </>
    );
}