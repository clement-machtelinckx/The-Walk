import { AuthProvider } from "@/components/auth/auth-provider";
import { Container } from "@/components/layout/container";
import { AppHeader } from "@/components/layout/app-header";
import { MobileBottomNav } from "@/components/layout/app-nav";
import { getCurrentUser } from "@/lib/auth/server";
import type { PublicUser } from "@/types/auth";
import { redirect } from "next/navigation";

type AppLayoutProps = Readonly<{
    children: React.ReactNode;
}>;

export default async function AppLayout({ children }: AppLayoutProps) {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    const initialUser: PublicUser = {
        id: user.id,
        email: user.email,
        profile: user.profile,
    };

    return (
        <AuthProvider initialUser={initialUser}>
            <div className="flex min-h-dvh flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
                <AppHeader />

                <main className="flex-1 py-6 md:py-8">
                    <Container>{children}</Container>
                </main>

                <MobileBottomNav />
            </div>
        </AuthProvider>
    );
}
