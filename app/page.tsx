import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Container } from "@/components/layout/container";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Image from 'next/image';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accueil",
  description:
    "Solutions d’assurance pour audioprothésistes : garanties, protection d’activité et accompagnement.",
};

export default function HomePage() {
  return (
    <>
      <section className="py-16 md:py-24">
        <Container>
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            {/* Logo */}
            <Image
              src="/logo-transparent.svg"
              alt="Logo de ProtecAudio"
              width={420}
              height={160}
              className="h-auto w-[220px] md:w-[320px]"
              priority
            />

            {/* Sous-titre / distributeurs */}
            <p className="mt-4 text-sm text-muted-foreground">
              Distribué par <span className="font-semibold text-foreground">Eurossur</span>,{" "}
              <span className="font-semibold text-foreground">Mark’assur</span> &{" "}
              <span className="font-semibold text-foreground">Rossard</span>
            </p>

            {/* Séparateur */}
            <div className="mt-6 h-px w-56 bg-foreground/30" />

            {/* Titre */}
            <h1 className="mt-10 text-4xl font-semibold tracking-tight md:text-6xl">
              <span className="block">Experts</span>
              <span className="mt-2 block text-base font-medium tracking-normal md:text-lg">
                de la
              </span>
              <span className="mt-3 block">protection des audioprothésistes</span>
            </h1>

            {/* Texte */}
            <p className="mt-8 text-base leading-relaxed text-muted-foreground md:text-lg">
              Depuis plus de 35 ans, nous accompagnons les professionnels du secteur de
              l’audioprothèse dans la protection et la sécurisation de leur activité.
              Nous développons également des solutions d’assurance spécifiquement dédiées
              aux dispositifs auditifs.
            </p>

            <p className="mt-6 text-base leading-relaxed text-muted-foreground md:text-lg">
              Protec’audio propose des solutions d’assurance dédiées aux audioprothésistes,
              conçues pour couvrir les risques liés à leur exercice : responsabilité civile
              professionnelle, locaux, équipements et continuité d’activité.
            </p>

            <p className="mt-6 font-semibold">
              Notre engagement : vous offrir une protection fiable, adaptée à votre métier
              et à ses exigences spécifiques.
            </p>

            {/* CTA */}
            <div className="mt-10">
              <Button asChild size="lg">
                <Link href="/contact">Demander un devis</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          {/* Bloc 1 : texte à gauche, image à droite */}
          <div className="grid items-center gap-10 md:grid-cols-2">
            {/* Colonne gauche */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl text-primary">
                Protégez votre activité professionnelle
              </h2>

              <p className="leading-relaxed text-muted-foreground">
                Nous vous accompagnons dans la protection globale de votre activité
                d’audioprothésiste, en prenant en considération les spécificités liées à
                la gestion de vos cabinets, de vos équipes et de vos partenaires
                professionnels.
              </p>

              <p className="leading-relaxed text-muted-foreground">
                Grâce à notre double expertise en assurance de personne et assurance
                dommage, nous analysons vos risques afin de sécuriser votre
                responsabilité professionnelle, vos locaux, votre matériel, et pour
                offrir à vos équipes une protection optimale.
              </p>

              <p className="leading-relaxed text-muted-foreground">
                Notre approche vous permet de garantir la continuité de votre activité
                tout en maîtrisant durablement votre budget d’assurance.
              </p>

              <div className="pt-2">
                <Button asChild>
                  <Link href="/contact">Demande d&apos;informations</Link>
                </Button>
              </div>
            </div>

            {/* Colonne droite */}
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border bg-muted">
              <Image
                src="/bebe-pigeon.jpg"
                alt="Illustration activité professionnelle"
                fill
                className="object-cover"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            </div>
          </div>

          {/* Espace entre blocs */}
          <div className="h-14 md:h-20" />

          {/* Bloc 2 : image à gauche, texte à droite */}
          <div className="grid items-center gap-10 md:grid-cols-2">
            {/* Colonne gauche */}
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border bg-muted">
              <Image
                src="/bebe-pigeon.jpg"
                alt="Illustration dispositifs auditifs"
                fill
                className="object-cover"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            </div>

            {/* Colonne droite */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl text-primary">
                Protégez vos patients et les dispositifs auditifs
              </h2>

              <p className="leading-relaxed text-muted-foreground">
                L’audioprothésiste a une responsabilité directe envers ses patients,
                tant sur la qualité de l’appareillage que sur la sécurité, le suivi et
                la continuité de prise en charge.
              </p>

              <p className="leading-relaxed text-muted-foreground">
                Nous vous proposons des solutions spécifiquement conçues pour protéger
                les dispositifs auditifs délivrés et sécuriser la relation de confiance
                entre vous et vos patients.
              </p>

              <p className="leading-relaxed text-muted-foreground">
                Nos garanties permettent de faire face aux imprévus tout en assurant un
                accompagnement rapide et efficace, dans le respect des obligations
                professionnelles et réglementaires.
              </p>

              <div className="pt-2">
                <Button asChild>
                  <Link href="/contact">Demande d&apos;informations</Link>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <h2 className="text-center text-2xl text-primary font-bold tracking-tight md:text-3xl mb-10">
            Nos partenaires historique(s)
          </h2>
          <div className="mx-auto w-full max-w-6xl">
            <Carousel
              opts={{ align: "start" }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {Array.from({ length: 10 }).map((_, index) => (
                  <CarouselItem key={index} className="pl-4 basis-[85%] sm:basis-[33.333%] lg:basis-[20%]">
                    <div className="relative aspect-square w-full overflow-hidden rounded-2xl border bg-muted">
                      <Image
                        src="/bebe-pigeon.jpg"
                        alt="Bébé Pigeon"
                        fill
                        className="object-cover"
                        sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 85vw"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </Container>
      </section>
      <section className="py-16 md:py-24">
        <Container>
          <h2 className="text-center text-2xl font-bold text-primary tracking-tight md:text-3xl">
            Notre accompagnement
          </h2>

          <div className="mt-10 grid gap-10 md:grid-cols-3">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Assistance et support</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Une équipe dédiée pour accompagner et assister les audioprothésistes pour
                tous leurs besoins en matière d’assurance.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Zéro papier, tout se fait en ligne</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                La souscription et gestion de vos solutions d’assurances sont rapides,
                intuitives et sécurisées.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Assurance sur-mesure</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Une capacité unique à construire des solutions et des programmes simples
                et cohérents.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}