import { Smile, Play, MessageCircle } from "lucide-react";

type Item = {
    title: string;
    description: string;
    Icon: React.ComponentType<{ className?: string }>;
};

const ITEMS: Item[] = [
    {
        title: "Sécuriser L'achat",
        description: "Protéger un équipement essentiel de vos patients.",
        Icon: Smile,
    },
    {
        title: "Fidéliser",
        description:
            "Une relation par le service qui projette le renouvellement dans votre centre audio.",
        Icon: Play,
    },
    {
        title: "Différencier",
        description:
            "Proposer un service de qualité pour se distinguer de la concurrence.",
        Icon: MessageCircle,
    },
];

function IconBadge({ Icon }: { Icon: Item["Icon"] }) {
    return (
        <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-sky-500/60 bg-white shadow-sm">
            <Icon className="h-7 w-7 text-sky-500" />
        </div>
    );
}

export function AudioCentersBlock() {
    return (
        <section className="relative overflow-hidden  py-10 md:py-14">
            {/* “Bulles” décoratives à droite */}
            {/* <div className="pointer-events-none absolute right-[-120px] top-[-80px] h-[260px] w-[260px] rounded-full bg-indigo-100/55" />
            <div className="pointer-events-none absolute right-[60px] top-[-60px] h-[220px] w-[220px] rounded-full bg-indigo-100/45" />
            <div className="pointer-events-none absolute right-[220px] top-[-20px] h-[180px] w-[180px] rounded-full bg-indigo-100/35" /> */}

            <div className="mx-auto w-full max-w-6xl px-4">
                {/* Titre */}
                <h2 className="text-center text-4xl font-extrabold tracking-tight text-slate-700 md:text-6xl">
                    Au service des centres audios
                </h2>

                {/* 3 colonnes */}
                <div className="mt-10 grid gap-8 md:mt-12 md:grid-cols-3">
                    {ITEMS.map((it) => (
                        <div key={it.title} className="flex gap-4">
                            <IconBadge Icon={it.Icon} />
                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-slate-700 md:text-xl">
                                    {it.title}
                                </h3>
                                <p className="max-w-sm text-base leading-relaxed text-slate-500">
                                    {it.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}