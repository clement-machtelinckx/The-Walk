import Link from "next/link";
import { Container } from "@/components/layout/container";

const COLUMNS = [
    {
        title: "Cabinet Eurossur",
        orias: "n° ORIAS 07001927 - www.orias.fr",
        body:
            "Cabinet de courtage expert de l’assurance des appareils auditifs depuis 1999. Service sinistre 100% en France, certifié par les assureurs.",
        linkLabel: "Mentions légales et médiateur",
        linkHref: "/mentions-legales",
        linkTone: "text-blue-300 hover:text-blue-200",
    },
    {
        title: "Cabinet Mark’assur",
        orias: "n° ORIAS 09-049-435 (www.orias.fr)",
        body:
            "Créé en 2009, Mark’assur est un courtier spécialiste dans la protection de l’aide auditive et de l’audioprothésiste.",
        linkLabel: "Mentions légales et médiateur",
        linkHref: "/mentions-legales",
        linkTone: "text-white/80 hover:text-white",
    },
    {
        title: "Cabinet Rossard Courtage",
        orias: "",
        body:
            "Rossard Courtage est un cabinet de courtage en assurance pour les entreprises et les professionnels créé en 2001. Entreprise familiale et à l’écoute des clients, Rossard Courtage s’engage à apporter la meilleure offre et à toujours défendre les intérêts auprès des compagnies d’assurances partenaires.",
        linkLabel: "Mentions légales et médiateur",
        linkHref: "/mentions-legales",
        linkTone: "text-yellow-300 hover:text-yellow-200",
    },
] as const;

export function Footer() {
    return (
        <footer className="border-t border-white/10 bg-zinc-900 text-white">
            <Container>
                <div className="grid gap-10 py-12 md:grid-cols-3">
                    {COLUMNS.map((col) => (
                        <div key={col.title} className="space-y-4">
                            <div className="space-y-1">
                                <h3 className="text-base font-semibold">
                                    <span className="text-white/70">Cabinet </span>
                                    {col.title.replace("Cabinet ", "")}
                                </h3>

                                {col.orias ? (
                                    <p className="text-xs text-white/50">{col.orias}</p>
                                ) : null}
                            </div>

                            <p className="text-sm leading-relaxed text-white/60">{col.body}</p>

                            <Link
                                href={col.linkHref}
                                className={`inline-block text-sm font-semibold underline underline-offset-4 ${col.linkTone}`}
                            >
                                {col.linkLabel}
                            </Link>
                        </div>
                    ))}
                </div>
            </Container>
        </footer>
    );
}