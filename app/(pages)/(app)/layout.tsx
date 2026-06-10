import { Container } from "@/components/layout/container";
import { AppHeader } from "@/components/layout/app-header";
import { MobileBottomNav } from "@/components/layout/app-nav";

type AppLayoutProps = Readonly<{
    children: React.ReactNode;
}>;

export default function AppLayout({ children }: AppLayoutProps) {
    return (
        <div className="flex min-h-dvh flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
            <AppHeader />

            <main className="flex-1 py-6 md:py-8">
                <Container>{children}</Container>
            </main>

            <MobileBottomNav />
        </div>
    );
}
