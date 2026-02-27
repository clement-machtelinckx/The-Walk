import { NextResponse } from "next/server";
import { z } from "zod";
import { getTransport } from "@/lib/mailer";
import { CONTACTS, type ContactKey } from "@/config/contact";
import { contactFormSchema, insuranceLabel, type InsuranceType } from "@/components/form/contact/contact-schema";

export const runtime = "nodejs"; // nodemailer => runtime node

// même mapping que ton mailto (on garde identique)
const INSURANCE_EMAIL: Record<InsuranceType, ContactKey> = {
    garantie_audioprothese: "protecaudio",
    rc_pro: "rossard",
    multirisque_pro: "rossard",
    protection_juridique: "rossard",
    sante_prevoyance: "rossard",
    epargne_retraite: "rossard",
};

// petit anti-bot (honeypot)
const ServerSchema = contactFormSchema.extend({
    website: z.string().optional().default(""), // champ caché côté front
});

function escapeHtml(input: string) {
    return input
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

export async function POST(req: Request) {
    try {
        const json = await req.json();
        const parsed = ServerSchema.safeParse(json);

        if (!parsed.success) {
            return NextResponse.json(
                { ok: false, error: "Champs invalides.", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { website, ...values } = parsed.data;

        // honeypot rempli => bot => on répond OK sans envoyer
        if (website && website.trim().length > 0) {
            return NextResponse.json({ ok: true, routedTo: "default" });
        }

        const contactKey = INSURANCE_EMAIL[values.insuranceType];
        const toEmail = CONTACTS[contactKey].email;

        const subject = `[Contact] ${insuranceLabel[values.insuranceType]} — ${values.lastName} ${values.firstName}`;

        const lines = [
            `Vous êtes: ${values.userType}`,
            `Fonction: ${values.jobFunction}`,
            "",
            `Nom: ${values.lastName}`,
            `Prénom: ${values.firstName}`,
            `Email: ${values.email}`,
            `Téléphone: ${values.phone}`,
            "",
            `Raison sociale: ${values.companyName || "-"}`,
            `Adresse entreprise: ${values.companyAddress || "-"}`,
            `Code postal: ${values.postalCode}`,
            `Ville: ${values.city}`,
            "",
            `Type d’assurance: ${insuranceLabel[values.insuranceType]}`,
            "",
            "Demande:",
            values.message,
        ];

        const text = lines.join("\n");
        const html = `
      <h2>Nouveau message via le formulaire</h2>
      <p><strong>Assurance :</strong> ${escapeHtml(insuranceLabel[values.insuranceType])}</p>
      <p><strong>Vous êtes :</strong> ${escapeHtml(values.userType)}</p>
      <p><strong>Fonction :</strong> ${escapeHtml(values.jobFunction)}</p>
      <hr />
      <p><strong>Nom :</strong> ${escapeHtml(values.lastName)}</p>
      <p><strong>Prénom :</strong> ${escapeHtml(values.firstName)}</p>
      <p><strong>Email :</strong> ${escapeHtml(values.email)}</p>
      <p><strong>Téléphone :</strong> ${escapeHtml(values.phone)}</p>
      <hr />
      <p><strong>Raison sociale :</strong> ${escapeHtml(values.companyName || "-")}</p>
      <p><strong>Adresse :</strong> ${escapeHtml(values.companyAddress || "-")}</p>
      <p><strong>CP / Ville :</strong> ${escapeHtml(values.postalCode)} ${escapeHtml(values.city)}</p>
      <hr />
      <p><strong>Message :</strong></p>
      <pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(values.message)}</pre>
    `;

        const transporter = getTransport();

        await transporter.sendMail({
            from: process.env.MAIL_FROM!,
            to: toEmail,
            subject,
            text,
            html,
            replyTo: values.email,
        });

        return NextResponse.json({ ok: true, routedTo: contactKey, toEmail });
    } catch (err) {
        console.error("POST /api/contact error:", err);
        return NextResponse.json(
            { ok: false, error: "Erreur serveur lors de l’envoi." },
            { status: 500 }
        );
    }
}