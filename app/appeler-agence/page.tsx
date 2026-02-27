"use client";

import { useState } from "react";
import { ContactCard } from "@/components/special/contactCard";
import { Container } from "@/components/layout/container";
import { ContactDialog } from "@/components/special/contactDialog";
import { CONTACTS } from "@/config/contact";
import { Reveal } from "@/components/ui/reveal";
import { Phone } from "lucide-react";


type DialogType = "partner" | "becomePartner" | "customer" | null;

export default function AppelerAgence() {
    const [open, setOpen] = useState<DialogType>(null);

    const dialogData = open ? CONTACTS[open] : null;

    return (
        <>
            <section className="py-16 md:py-24">
                <Container>
                    <h1 className="text-center text-5xl font-semibold text-primary">
                        Accueil téléphonique
                    </h1>
                    <h2 className="mt-2 text-center text-lg font-medium text-muted-foreground">
                        Du lundi au vendredi de 9h à 18h.
                    </h2>
                </Container>
            </section>

            <section className="">
                <Container>
                    <div className="grid gap-10 md:grid-cols-3">
                        <Reveal delay={10}>
                            <ContactCard
                                title="VOUS ÊTES PARTENAIRE"
                                buttonLabel="Cliquez ici"
                                icon={Phone}
                                className="whitespace-pre-line"
                                onClick={() => setOpen("partner")}
                            />
                        </Reveal>
                        <Reveal delay={80}>
                            <ContactCard
                                title="VOUS SOUHAITEZ DEVENIR PARTENAIRE"
                                buttonLabel="Cliquez ici"
                                icon={Phone}
                                className="whitespace-pre-line"
                                onClick={() => setOpen("becomePartner")}
                            />
                        </Reveal>
                        <Reveal delay={160}>
                            <ContactCard
                                title="VOUS ÊTES PARTICULIER"
                                buttonLabel="Cliquez ici"
                                icon={Phone}
                                className="whitespace-pre-line"
                                onClick={() => setOpen("customer")}
                            />
                        </Reveal>
                    </div>
                </Container>
            </section>

            {dialogData ? (
                <ContactDialog
                    open={open !== null}
                    onOpenChange={(v) => setOpen(v ? open : null)}
                    title={dialogData.label}
                    phone={dialogData.phone}
                    email={dialogData.email}
                    imageSrc="/bebe-pigeon.jpg"
                />
            ) : null}
        </>
    );
}