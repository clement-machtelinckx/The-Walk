import Link from "next/link";
import { TableSummaryDTO } from "@/lib/services/tables/table-service";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Calendar, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { RoleBadge } from "@/components/special/role-badge";

interface TableCardProps {
    table: TableSummaryDTO;
}

export function TableCard({ table }: TableCardProps) {
    return (
        <Card className="hover:border-primary/50 bg-card/50 flex h-full flex-col shadow-sm transition-colors">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <CardTitle className="line-clamp-1 text-xl font-bold">{table.name}</CardTitle>
                    <RoleBadge role={table.myRole} size="sm" />
                </div>
                {table.description && (
                    <CardDescription className="mt-2 line-clamp-2 h-10">
                        {table.description}
                    </CardDescription>
                )}
            </CardHeader>

            <CardContent className="flex-grow">
                {table.nextSession ? (
                    <div className="bg-muted/50 border-border/50 space-y-2 rounded-lg border p-3">
                        <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
                            <Calendar size={12} />
                            Prochaine session
                        </div>
                        <div className="line-clamp-1 text-sm font-medium">
                            {table.nextSession.title}
                        </div>
                        {table.nextSession.scheduled_at && (
                            <div className="text-muted-foreground text-xs">
                                {format(
                                    new Date(table.nextSession.scheduled_at),
                                    "eeee d MMMM 'à' HH:mm",
                                    { locale: fr },
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-muted-foreground/60 rounded-lg border border-dashed py-4 text-center text-sm italic">
                        Aucune session prévue
                    </div>
                )}
            </CardContent>

            <CardFooter className="pt-0">
                <Link href={`/tables/${table.id}`} className="w-full">
                    <div className="bg-primary hover:bg-primary/90 text-primary-foreground flex w-full items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors">
                        Ouvrir la table
                        <ArrowRight size={16} />
                    </div>
                </Link>
            </CardFooter>
        </Card>
    );
}
