import Link from "next/link";
import { Container } from "@/components/layout/container";

type ContactMap = Record<string, string>;

type Column = {
    title: string;
    orias?: string;
    body: string;
    linkLabel: string;
    linkHref: string;
    linkTone: string;
    phone?: ContactMap;
    mail?: ContactMap;
    address?: ContactMap;
};

const COLUMNS: readonly Column[] = [
    {
        title: "Cabinet Eurossur",
        orias: "n° ORIAS 07001927 - www.orias.fr",
        body:
            "Cabinet de courtage expert de l’assurance des appareils auditifs depuis 1999. Service sinistre 100% en France, certifié par les assureurs.",
        linkLabel: "Mentions légales et médiateur",
        linkHref: "/mentions-legales",
        linkTone: "text-blue-300 hover:text-blue-200",
        phone: { standard: "05 56 79 01 10" },
        mail: { email: "contact@eurossur.fr" },
        address: { adresse: "74 rue Georges Bonnac Tour 6 33000 Bordeaux" },
    },
    {
        title: "Cabinet Mark’assur",
        orias: "n° ORIAS 09-049-435 (www.orias.fr)",
        body:
            "Créé en 2009, Mark’assur est un courtier spécialiste dans la protection de l’aide auditive et de l’audioprothésiste.",
        linkLabel: "Mentions légales et médiateur",
        linkHref: "/mentions-legales",
        linkTone: "text-white/80 hover:text-white",
        phone: { gestion: "02 79 02 77 28", commercial: "02 79 02 77 27" },
        mail: { email: "contact@markassur.com" },
    },
    {
        title: "Cabinet Rossard Courtage",
        orias: "",
        body:
            "Rossard Courtage est un cabinet de courtage en assurance pour les entreprises et les professionnels créé en 2001. Entreprise familiale et à l’écoute des clients, Rossard Courtage s’engage à apporter la meilleure offre et à toujours défendre les intérêts auprès des compagnies d’assurances partenaires.",
        linkLabel: "Mentions légales et médiateur",
        linkHref: "/mentions-legales",
        linkTone: "text-yellow-300 hover:text-yellow-200",
        phone: { standard: "02 79 02 77 27" },
    },
] as const;

function normalizePhone(phone: string) {
    // tel: nécessite souvent sans espaces
    return phone.replace(/[^\d+]/g, "");
}

function prettyLabel(kind: "phone" | "mail" | "address", key: string) {
    const k = key.toLowerCase();
    if (kind === "phone") {
        if (k.includes("gestion")) return "Gestion";
        if (k.includes("commercial")) return "Commercial";
        if (k.includes("standard") || k.includes("default")) return "Téléphone";
        return key;
    }
    if (kind === "mail") {
        if (k.includes("email") || k.includes("default")) return "Email";
        return key;
    }
    // address
    if (k.includes("adresse") || k.includes("default")) return "Adresse";
    return key;
}

function ContactList({
    kind,
    data,
}: {
    kind: "phone" | "mail" | "address";
    data?: ContactMap;
}) {
    if (!data) return null;

    const entries = Object.entries(data).filter(([, v]) => Boolean(v?.trim()));
    if (entries.length === 0) return null;

    return (
        <div className="space-y-1">
            {entries.map(([key, value]) => {
                const label = prettyLabel(kind, key);

                let href: string | null = null;
                if (kind === "phone") href = `tel:${normalizePhone(value)}`;
                if (kind === "mail") href = `mailto:${value}`;
                // address => pas de href par défaut (tu peux ajouter maps: plus tard)

                return (
                    <div key={`${kind}-${key}`} className="text-sm text-white/70">
                        <span className="text-white/50">{label} :</span>{" "}
                        {href ? (
                            <a
                                href={href}
                                className="underline underline-offset-4 hover:text-white"
                            >
                                {value}
                            </a>
                        ) : (
                            <span>{value}</span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

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

                            {/* Contacts */}
                            <div className="space-y-2">
                                <ContactList kind="phone" data={col.phone} />
                                <ContactList kind="mail" data={col.mail} />
                                <ContactList kind="address" data={col.address} />
                            </div>

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