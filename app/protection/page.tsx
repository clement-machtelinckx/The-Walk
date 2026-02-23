import { Container } from "@/components/layout/container";
import ProtectionPill from "@/components/special/ProtectionPill";
import GarantiePage from "../garantie/page";
import { Button } from "@/components/ui/button";
import Link from "next/link";


export default function Protection() {
    return (
        <>
            <section>
                <Container>
                    <ProtectionPill />
                    <Button asChild size="lg">
                        <Link href="/contact">Prendre RDV</Link>
                    </Button>
                </Container>
            </section>

            <section className="py-16 md:py-24">
                <Container>
                    <h2 className="text-center text-2xl font-semibold tracking-tight md:text-3xl">
                        POURQUOI NOUS CHOISIR ?
                    </h2>

                    <div className="mt-10 rounded-3xl border bg-accent p-8 md:p-12">
                        <div className="grid gap-10 md:grid-cols-2">
                            {/* Colonne gauche */}
                            <div className="space-y-10">
                                <div className="space-y-3">
                                    <h3 className="text-lg font-semibold md:text-xl">
                                        Une équipe d’experts engagés
                                    </h3>
                                    <p className="leading-relaxed text-muted-foreground">
                                        Notre équipe est stable, se forme régulièrement et est surtout fière
                                        du taux de satisfaction de nos clients. La confiance, c’est notre
                                        engagement de tous les instants.
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-lg font-semibold md:text-xl">Suivi et qualité</h3>
                                    <p className="leading-relaxed text-muted-foreground">
                                        Répondre généralement sous 48H à toutes vos demandes est notre
                                        engagement. En cas de sinistre, notre service dédié 100% en France
                                        vous accompagne pas à pas jusqu’à l’indemnisation.
                                    </p>
                                </div>
                            </div>

                            {/* Colonne droite */}
                            <div className="space-y-10">
                                <div className="space-y-3">
                                    <h3 className="text-lg font-semibold md:text-xl">
                                        Une des offres les plus larges du marché
                                    </h3>
                                    <p className="leading-relaxed text-muted-foreground">
                                        Nous travaillons avec plus de 20 partenaires assureurs, garantissant
                                        une véritable démarche de conseil, transparente, à l’écoute et
                                        forcément avec une solution.
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-lg font-semibold md:text-xl">
                                        Un accompagnement sur-mesure
                                    </h3>
                                    <p className="leading-relaxed text-muted-foreground">
                                        Parce que chaque situation est spécifique, nos chargés de clientèle
                                        prennent soin de comprendre vos besoins et préoccupations pour vous
                                        proposer les garanties les mieux adaptées.{" "}
                                        <span className="font-semibold text-foreground">
                                            Nous pouvons faire évoluer votre contrat
                                        </span>{" "}
                                        grâce aux points de situation que nous vous proposerons régulièrement.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

        </>
    )
}