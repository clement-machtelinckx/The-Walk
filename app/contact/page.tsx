import { Container } from "@/components/layout/container";
import { ContactCard } from "@/components/special/contactCard";
import { mdiPhone, mdiHeadset, mdiEmail } from "@mdi/js";
import { Reveal } from "@/components/ui/reveal";
import type { Metadata } from "next";

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
                    <h1 className="text-center text-5xl font-semibold text-primary">Echanger avec Protec'audio</h1>
                    <h2 className="text-center text-lg font-medium text-muted-foreground">Pour obtenir des informations sur nos solutions, réaliser un contrat, déclarer un sinistre</h2>
                </Container>
            </section>

            <section className="">
                <Container>
                    <div className="grid gap-10 md:grid-cols-3">
                        <div>
                            <Reveal delay={10}>
                                <ContactCard
                                    title={"CONTACTER NOTRE CABINET"}
                                    href="/appeler-agence"
                                    buttonLabel="Appeler"
                                    iconPath={mdiPhone}
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
                                    iconPath={mdiHeadset}
                                />
                            </Reveal>
                        </div>
                        <div>
                            <Reveal delay={160}>
                                <ContactCard
                                    title="ENVOYER UN E-MAIL"
                                    href="/contact/form"
                                    buttonLabel="Envoyer un e-mail"
                                    iconPath={mdiEmail}
                                />
                            </Reveal>
                        </div>
                    </div>
                </Container>
            </section>


        </>
    )
}