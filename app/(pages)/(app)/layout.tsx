import { Container } from "@/components/layout/container";
import { AppHeader } from "@/components/layout/app-header";
import { MobileBottomNav } from "@/components/layout/app-nav";

type AppLayoutProps = Readonly<{
    children: React.ReactNode;
}>;

export default function AppLayout({ children }: AppLayoutProps) {
    return (
        <div className="flex min-h-screen flex-col pb-16 md:pb-0">
            <AppHeader />

            <main className="flex-1 py-6 md:py-8">
                <Container>{children}</Container>
            </main>

            <MobileBottomNav />
        </div>
    );
}
