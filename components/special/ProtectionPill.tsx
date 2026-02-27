import * as React from "react";
import type { LucideIcon as LucideIconType } from "lucide-react";
import { FileText, Shield, Scale, HeartPulse, PiggyBank } from "lucide-react";

import { Container } from "@/components/layout/container";
import LucideIcon from "@/components/ui/icon";

type Group = {
    title: string;
    subtitle: string;
    items: string[];
    icon: LucideIconType;
};

const GROUPS: Group[] = [
    {
        title: "Responsabilité Civile Professionnelle",
        subtitle: "Protection jusqu’à 8M€ pour votre activité professionnelle",
        items: [
            "RC Professionnelle",
            "RC Médicale incluse",
            "Biens confiés couverts",
            "Défense pénale",
            "Garanties modulables",
        ],
        icon: FileText,
    },
    {
        title: "Multirisque Professionnel",
        subtitle: "Votre cabinet et matériel protégés 24h/24",
        items: [
            "Locaux protégés",
            "Matériel couvert",
            "Vol & vandalisme",
            "Dégâts des eaux",
            "Perte d’exploitation",
        ],
        icon: Shield,
    },
    {
        title: "Protection Juridique",
        subtitle: "Assistance et défense en cas de litige (Option)",
        items: [
            "Assistance juridique",
            "Défense en cas de litige",
            "Frais de procédure",
            "Protection contractuelle",
            "Sécurité réglementaire",
        ],
        icon: Scale,
    },
    {
        title: "Santé & Prévoyance",
        subtitle: "Protection complète pour votre activité professionnelle et votre sérénité",
        items: [
            "Mutuelle individuelle & collective",
            "Prévoyance arrêt de travail",
            "Protection invalidité",
            "Sécurité familiale",
        ],
        icon: HeartPulse,
    },
    {
        title: "Épargne & Retraite",
        subtitle: "Solutions personnalisées pour sécuriser votre avenir et celui de vos proches",
        items: [
            "Préparation retraite",
            "Optimisation fiscale",
            "Épargne long terme",
            "Sécurisation du patrimoine",
        ],
        icon: PiggyBank,
    },
];

function Chip({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center rounded-full border-2 border-primary/30 bg-white hover:bg-accent px-5 py-2 text-sm font-semibold text-foreground">
            {children}
        </span>
    );
}

function GroupBlock({ title, subtitle, items, icon }: Group) {
    return (
        <div className="space-y-5">
            <div className="flex items-center gap-4 rounded-2xl bg-primary px-6 py-5 shadow-sm">
                {/* Icône */}
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20">
                    <LucideIcon icon={icon} className="h-8 w-8 text-white" />
                </div>

                <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-white md:text-xl">{title}</h3>
                    <p className="text-sm text-white/80 md:text-base">{subtitle}</p>
                </div>
            </div>

            {/* Chips */}
            <div className="flex flex-wrap gap-4">
                {items.map((it) => (
                    <Chip key={it}>{it}</Chip>
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