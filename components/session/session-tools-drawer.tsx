"use client";

import { useState } from "react";
import type React from "react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import type {
    SessionLiveModuleSettings,
    SessionLiveModuleSettingsValues,
} from "@/types/live-module-settings";
import { Crown, Dice5, ExternalLink, MessageSquare, Shield, Users, Wrench } from "lucide-react";
import { DiceLogBlock } from "./dice-log-block";
import { LiveModuleSettings } from "./live-module-settings";
import { PlayerPresencePanel } from "./player-presence-panel";

type SessionToolsDrawerProps = Readonly<{
    isGM: boolean;
    tableId: string;
    context?: SessionToolsContext;
    sessionId?: string;
    moduleSettings?: SessionLiveModuleSettings;
    onModuleSettingsChange?: (settings: SessionLiveModuleSettingsValues) => void;
}>;

type SessionToolsContext = "table" | "pre-session" | "live";
type SessionToolId = "players" | "rolls" | "advanced" | "gm";

const SESSION_TOOLS: Array<{
    id: SessionToolId;
    label: string;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
}> = [
    {
        id: "players",
        label: "Joueurs",
        title: "Joueurs et privé",
        icon: Users,
    },
    {
        id: "rolls",
        label: "Dés",
        title: "Dés et initiative",
        icon: Dice5,
    },
    {
        id: "advanced",
        label: "Avancé",
        title: "Outils avancés",
        icon: Wrench,
    },
    {
        id: "gm",
        label: "MJ",
        title: "Outils MJ",
        icon: Crown,
    },
];

const CONTEXT_DESCRIPTION: Record<SessionToolsContext, string> = {
    table: "Outils de table. Les fonctions strictement live restent visibles mais indiquent leur contexte.",
    "pre-session":
        "Outils de préparation. Les fonctions strictement live restent visibles mais inactives.",
    live: "Outils secondaires du live. Les modules futurs restent regroupés hors du noyau de session.",
};

function ToolPanel({
    icon: Icon,
    title,
    description,
    children,
}: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    children?: React.ReactNode;
}) {
    return (
        <section className="space-y-4">
            <div className="flex items-start gap-3">
                <div className="bg-primary/10 text-primary rounded-md p-3">
                    <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 space-y-1">
                    <h3 className="text-sm font-bold">{title}</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed">{description}</p>
                </div>
            </div>
            {children}
        </section>
    );
}

function PlaceholderItem({
    label,
    detail,
    state = "available",
}: {
    label: string;
    detail: string;
    state?: "available" | "live-only" | "future" | "gm-only";
}) {
    const badge =
        state === "live-only"
            ? "Disponible en live"
            : state === "future"
              ? "Prévu"
              : state === "gm-only"
                ? "MJ"
                : "Disponible";

    return (
        <div
            className={cn(
                "bg-muted/30 rounded-md border border-dashed p-3",
                state === "live-only" && "opacity-70",
            )}
        >
            <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold">{label}</p>
                <Badge
                    variant={state === "available" ? "success" : "outline"}
                    className="shrink-0 px-2 py-0 text-[9px]"
                >
                    {badge}
                </Badge>
            </div>
            <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">{detail}</p>
        </div>
    );
}

export function SessionToolsDrawer({
    isGM,
    tableId,
    context = "live",
    sessionId,
    moduleSettings,
    onModuleSettingsChange,
}: SessionToolsDrawerProps) {
    const [open, setOpen] = useState(false);
    const [activeTool, setActiveTool] = useState<SessionToolId>("players");
    const visibleTools = SESSION_TOOLS.filter((tool) => tool.id !== "gm" || isGM);
    const isLive = context === "live";

    const openTool = (tool: SessionToolId) => {
        setActiveTool(tool);
        setOpen(true);
    };

    return (
        <>
            {!open && (
                <div
                    className="border-primary/20 bg-background/95 fixed top-1/2 right-2 z-40 flex -translate-y-1/2 flex-col items-center gap-1 rounded-lg border p-1 shadow-lg backdrop-blur sm:right-0 sm:rounded-r-none sm:border-r-0"
                    aria-label="Accès rapide aux outils de session"
                >
                    <span
                        aria-hidden="true"
                        className="text-primary px-1 py-0.5 text-[9px] font-bold tracking-wider uppercase"
                    >
                        Outils
                    </span>
                    {visibleTools.map((tool) => {
                        const Icon = tool.icon;

                        return (
                            <Button
                                key={tool.id}
                                type="button"
                                variant="secondary"
                                size="icon"
                                className="border-border/70 bg-background hover:bg-primary hover:text-primary-foreground h-11 w-11 border shadow-sm"
                                onClick={() => openTool(tool.id)}
                                title={tool.title}
                                aria-label={`Ouvrir ${tool.title}`}
                            >
                                <Icon className="size-7" />
                            </Button>
                        );
                    })}
                </div>
            )}

            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent
                    side="right"
                    className="border-primary/30 w-[94vw] gap-0 overflow-hidden p-0 shadow-2xl sm:max-w-lg"
                >
                    <SheetHeader className="border-b pr-12">
                        <SheetTitle className="flex items-center gap-2">
                            <Wrench className="text-primary h-6 w-6" />
                            Outils de session
                        </SheetTitle>
                        <SheetDescription>{CONTEXT_DESCRIPTION[context]}</SheetDescription>
                    </SheetHeader>

                    <Tabs
                        value={activeTool}
                        onValueChange={(value) => setActiveTool(value as SessionToolId)}
                        orientation="vertical"
                        className="min-h-0 flex-1 gap-0"
                    >
                        <TabsList
                            variant="line"
                            className="bg-muted/20 w-20 shrink-0 justify-start rounded-none border-r p-2"
                        >
                            {visibleTools.map((tool) => {
                                const Icon = tool.icon;

                                return (
                                    <TabsTrigger
                                        key={tool.id}
                                        value={tool.id}
                                        className="h-16 w-16 justify-center rounded-md px-0"
                                        title={tool.title}
                                    >
                                        <Icon className="size-7" />
                                        <span className="sr-only">{tool.label}</span>
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>

                        <div className="min-w-0 flex-1 overflow-y-auto p-4 pb-6">
                            <TabsContent value="players" className="m-0 space-y-4">
                                <ToolPanel
                                    icon={MessageSquare}
                                    title="Joueurs / privé"
                                    description="Messages privés de table, vue joueurs et futurs contrôles ciblés."
                                >
                                    <PlaceholderItem
                                        label="Messages privés de table"
                                        detail="Espace prévu pour rester accessible depuis la table, la préparation et le live."
                                        state="future"
                                    />
                                    <PlayerPresencePanel
                                        tableId={tableId}
                                        sessionId={sessionId}
                                        isGM={isGM}
                                    />
                                    <PlaceholderItem
                                        label="Contrôles live ciblés"
                                        detail={
                                            isLive
                                                ? "Les interactions strictement live pourront être ajoutées ici."
                                                : "Disponible pendant une session live."
                                        }
                                        state={isLive ? "available" : "live-only"}
                                    />
                                </ToolPanel>
                            </TabsContent>

                            <TabsContent value="rolls" className="m-0 space-y-4">
                                <ToolPanel
                                    icon={Dice5}
                                    title="Dés / initiative"
                                    description="Jets de dés accessibles largement, initiative réservée au live."
                                >
                                    <DiceLogBlock tableId={tableId} sessionId={sessionId} />
                                    <PlaceholderItem
                                        label="Initiative"
                                        detail={
                                            isLive
                                                ? "Le suivi d'ordre de tour pourra partager ce panneau avec les outils de dés."
                                                : "Disponible pendant une session live."
                                        }
                                        state={isLive ? "available" : "live-only"}
                                    />
                                </ToolPanel>
                            </TabsContent>

                            <TabsContent value="advanced" className="m-0 space-y-4">
                                <ToolPanel
                                    icon={Shield}
                                    title="Futur / outils avancés"
                                    description="Modules secondaires et futurs outils qui ne doivent pas encombrer la page principale."
                                >
                                    <Button
                                        variant="outline"
                                        className="border-primary/20 hover:bg-primary/5 h-auto w-full justify-start gap-3 p-3"
                                        asChild
                                    >
                                        <a
                                            href={siteConfig.links.crawl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <ExternalLink className="text-primary h-6 w-6" />
                                            <span className="text-left">
                                                <span className="block text-xs font-bold">
                                                    The Crawl
                                                </span>
                                                <span className="text-muted-foreground block text-[11px]">
                                                    Interface externe
                                                </span>
                                            </span>
                                        </a>
                                    </Button>
                                    <PlaceholderItem
                                        label="Combat"
                                        detail="Les outils de combat plus avancés pourront être ajoutés ici."
                                        state="future"
                                    />
                                    <PlaceholderItem
                                        label="Autres modules"
                                        detail="Espace réservé aux futurs outils de session non essentiels."
                                        state="future"
                                    />
                                </ToolPanel>
                            </TabsContent>

                            {isGM && (
                                <TabsContent value="gm" className="m-0 space-y-4">
                                    <ToolPanel
                                        icon={Crown}
                                        title="MJ"
                                        description="Zone réservée aux outils de pilotage et ressources du meneur."
                                    >
                                        {sessionId && (
                                            <LiveModuleSettings
                                                sessionId={sessionId}
                                                initialSettings={moduleSettings}
                                                onSettingsChange={onModuleSettingsChange}
                                            />
                                        )}
                                        <PlaceholderItem
                                            label="Ressources MJ"
                                            detail="Espace réservé aux ressources utiles au meneur."
                                            state="gm-only"
                                        />
                                        <PlaceholderItem
                                            label="Fichiers"
                                            detail="Les futurs fichiers ou supports de table pourront être regroupés ici."
                                            state="future"
                                        />
                                        <PlaceholderItem
                                            label="Raccourcis MJ"
                                            detail="Raccourcis structurels réservés au MJ, sans les mélanger aux outils joueurs."
                                            state="gm-only"
                                        />
                                    </ToolPanel>
                                </TabsContent>
                            )}
                        </div>
                    </Tabs>
                </SheetContent>
            </Sheet>
        </>
    );
}
