import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MdiIcon } from "@/components/ui/icon";

type GarantieCardProps = {
    title: string;
    body: string;
    /** Path MDI (ex: mdiMapMarkerQuestion) */
    iconPath?: string;
    headerClassName?: string;
};

export function GarantieCard({
    title,
    body,
    iconPath,
    headerClassName,
}: GarantieCardProps) {
    return (
        <Card className="overflow-hidden rounded-2xl p-0">
            {/* Header = full-bleed */}
            <CardHeader className="p-0">
                <div className={`relative h-24 bg-primary ${headerClassName ?? ""}`}>
                    {/* petit bandeau plus clair */}
                    <div className="absolute bottom-0 left-0 h-2 w-full bg-accent" />

                    {/* Icône centrée */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white">
                            {iconPath ? (
                                <MdiIcon path={iconPath} size={2} />
                            ) : (
                                <span className="text-lg font-semibold">◎</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Titre sous le bandeau (padding contrôlé) */}
                <div className="px-6 pt-6 pb-2">
                    <CardTitle className="text-lg tracking-tight">{title}</CardTitle>
                </div>
            </CardHeader>

            <CardContent className="px-6 pb-6 text-sm leading-relaxed text-muted-foreground">
                {body}
            </CardContent>
        </Card>
    );
}