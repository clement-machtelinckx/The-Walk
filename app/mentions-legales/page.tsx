import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
    title: "Mentions légales",
    description:
        "Mentions légales ProtecAudio et accès aux mentions légales des cabinets partenaires.",
};

const PARTNERS = [
    {
        name: "Mark’assur",
        href: "https://markassur.com/mention-legale/",
        note: "Cabinet partenaire",
    },
    {
        name: "Eurossur Audio",
        href: "https://eurossur-audio.fr/mention-legale/",
        note: "Cabinet partenaire",
    },
    {
        name: "Rossard Courtage",
        href: "https://rossardcourtage.com/mentions-legales/",
        note: "Cabinet partenaire",
    },
] as const;

export default function MentionsLegalesPage() {
    return (
        <main className="py-16 md:py-24">
            <Container>
                <div className="mb-10 space-y-3">
                    <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                        Mentions légales
                    </h1>
                    <p className="max-w-3xl text-muted-foreground">
                        Cette page présente les informations légales relatives à ProtecAudio ainsi que les
                        liens vers les mentions légales officielles de nos cabinets partenaires.
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-3 lg:items-start">
                    {/* ProtecAudio */}
                    <div className="lg:col-span-2">
                        <Card className="rounded-2xl">
                            <CardHeader>
                                <CardTitle>ProtecAudio</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-muted-foreground">
                                <p>
                                    Les informations légales spécifiques à ProtecAudio seront ajoutées prochainement.
                                </p>
                                <p className="text-sm">
                                    En attendant, veuillez vous référer aux mentions légales des cabinets partenaires
                                    ci-contre pour les informations relatives à l’édition, la médiation et
                                    l’hébergement.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Partenaires */}
                    <div className="space-y-4 lg:col-span-1">
                        <h2 className="text-lg font-semibold">Cabinets partenaires</h2>

                        {PARTNERS.map((p) => (
                            <Card key={p.name} className="rounded-2xl">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">{p.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-sm text-muted-foreground">{p.note}</p>

                                    <Button asChild variant="secondary" className="w-full">
                                        <Link href={p.href} target="_blank" rel="noreferrer">
                                            Consulter les mentions légales
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                <div className="mt-10 text-sm text-muted-foreground">
                    <p>
                        Les liens ci-dessus renvoient vers les pages officielles des cabinets. Ces informations
                        peuvent évoluer — en cas de doute, la page officielle du cabinet fait foi.
                    </p>
                </div>
            </Container>
        </main>
    );
}