import { Container } from "@/components/layout/container";
import { ContactCard } from "@/components/special/contactCard";
import { mdiPhone, mdiHeadset, mdiEmail } from "@mdi/js";


export default function Contact() {
    return (
        <>
            <section className="py-16 md:py-24">
                <Container>
                    <h1 className="text-center text-5xl font-semibold text-primary">Echanger avec Protec'audio</h1>
                    <h2 className="text-center text-lg font-medium text-muted-foreground">Pour obtenir des informations sur nos solutions, réaliser un contrat, déclarer un sinistre</h2>
                </Container>
            </section>

            <section className="mb-32">
                <Container>
                    <div className="grid gap-10 md:grid-cols-3">
                        <div>
                            <ContactCard
                                title={"CONTACTER NOTRE CABINET"}
                                href="/contact"
                                buttonLabel="Appeler"
                                iconPath={mdiPhone}
                                className="whitespace-pre-line"
                            />
                        </div>
                        <div>
                            <ContactCard
                                title="ETRE RAPPELÉ"
                                href="/contact"
                                buttonLabel="Être rappelé"
                                iconPath={mdiHeadset}
                            />
                        </div>
                        <div>
                            <ContactCard
                                title="ENVOYER UN E-MAIL"
                                href="/contact"
                                buttonLabel="Envoyer un e-mail"
                                iconPath={mdiEmail}
                            />
                        </div>
                    </div>
                </Container>
            </section>


        </>
    )
}