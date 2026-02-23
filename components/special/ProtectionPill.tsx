import { Container } from "@/components/layout/container";
import { MdiIcon } from "@/components/ui/icon";
import {
    mdiFileDocumentOutline,
    mdiShieldOutline,
    mdiScaleBalance,
    mdiHeartPlusOutline,
    mdiPiggyBankOutline,
} from "@mdi/js";


type Group = {
    title: string;
    items: string[];
    icon: string;
};

const GROUPS: Group[] = [
    {
        title: "Responsabilité Civile Professionnelle",
        items: [
            "RC Professionnelle",
            "RC médicale incluse",
            "Biens confiés couverts",
            "Défense pénale",
            "Garanties modulables",
        ],
        icon: mdiFileDocumentOutline,
    },
    {
        title: "Multirisque Professionnel",
        items: [
            "Locaux protégés",
            "Matériel couvert",
            "Vol & vandalisme",
            "Dégâts des eaux",
            "Perte d’exploitation",
        ],
        icon: mdiShieldOutline,
    },
    {
        title: "Protection Juridique",
        items: [
            "Assistance juridique",
            "Défense en cas de litige",
            "Frais de procédure",
            "Protection contractuelle",
            "Sécurité réglementaire",
        ],
        icon: mdiScaleBalance,
    },
    {
        title: "Santé & Prévoyance",
        items: [
            "Santé individuelle & collective",
            "Prévoyance individuelle & collective",
        ],
        icon: mdiHeartPlusOutline,
    },
    {
        title: "Épargne & Retraite",
        items: [
            "Préparation retraite",
            "Optimisation fiscale",
            "Épargne long terme",
            "Sécurisation du patrimoine",
        ],
        icon: mdiPiggyBankOutline,
    },
];

function Chip({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center rounded-full border-2 border-blue-300 bg-white hover:bg-accent px-5 py-2 text-sm font-semibold text-foreground">
            {children}
        </span>
    );
}

function GroupBlock({ title, items, icon }: Group) {
    return (
        <div className="space-y-5">
            {/* Header bleu */}
            <div className="flex items-center gap-4 rounded-2xl bg-primary px-6 py-5 shadow-sm">
                {/* Icône placeholder */}
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                    <MdiIcon path={icon} size={1} className="text-white" />
                </div>

                <h3 className="text-lg font-semibold text-white md:text-xl">
                    {title}
                </h3>
            </div>

            {/* Chips */}
            <div className="flex flex-wrap gap-4">
                {items.map((it) => (

                    <Chip key={it} >{it}</Chip>

                ))}
            </div>
        </div>
    );
}

export default function ProtectionPill() {
    return (
        <main>
            <section className="py-16 md:py-24">
                <Container>
                    <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
                        Découvrez nos garanties
                    </h1>

                    <div className="mt-10 space-y-10">
                        {GROUPS.map((g) => (
                            <GroupBlock key={g.title} {...g} />
                        ))}
                    </div>
                </Container>
            </section>
        </main>
    );
}