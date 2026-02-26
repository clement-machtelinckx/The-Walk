import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ParallaxBackgroundClient } from "@/components/layout/parallaxBackgroundClient";
import { Roboto } from "next/font/google";
import type { Metadata } from "next";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ProtecAudio",
    template: "%s | ProtecAudio",
  },
  description:
    "ProtecAudio accompagne les audioprothésistes avec des solutions d’assurance et de protection adaptées.",
  metadataBase: new URL("https://protecaudio.fr"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={roboto.className} suppressHydrationWarning>
      <body className="min-h-dvh flex flex-col bg-background text-foreground antialiased">
        <ParallaxBackgroundClient />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}