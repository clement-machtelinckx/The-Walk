import { NextResponse } from "next/server";
import { z } from "zod";

import { getTransport } from "@/lib/mailer";
import { CONTACTS, type ContactKey } from "@/config/contact";
import {
    contactFormSchema,
    insuranceLabel,
    type InsuranceType,
} from "@/components/form/contact/contact-schema";
import { buildContactEmail } from "@/lib/email-templates/contact";

export const runtime = "nodejs";

const INSURANCE_EMAIL: Record<InsuranceType, ContactKey> = {
    garantie_audioprothese: "protecaudio",
    rc_pro: "rossard",
    multirisque_pro: "rossard",
    protection_juridique: "rossard",
    sante_prevoyance: "rossard",
    epargne_retraite: "rossard",
};

const ServerSchema = contactFormSchema.extend({
    website: z.string().optional().default(""),
});

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

        if (website && website.trim().length > 0) {
            return NextResponse.json({ ok: true, routedTo: "default" });
        }

        const contactKey = INSURANCE_EMAIL[values.insuranceType];
        const toEmail = CONTACTS[contactKey].email;

        const mail = buildContactEmail(
            {
                insuranceLabel: insuranceLabel[values.insuranceType],
                userType: values.userType,
                jobFunction: values.jobFunction,
                firstName: values.firstName,
                lastName: values.lastName,
                email: values.email,
                phone: values.phone,
                companyName: values.companyName || undefined,
                companyAddress: values.companyAddress || undefined,
                postalCode: values.postalCode,
                city: values.city,
                message: values.message,
            },
            {
                brandName: "ProtecAudio",
                logoUrl: process.env.MAIL_LOGO_URL,
                footerText: process.env.MAIL_FOOTER_TEXT,
            }
        );

        const mailFrom = process.env.MAIL_FROM;
        if (!mailFrom) {
            throw new Error("Variable MAIL_FROM requise.");
        }

        const transporter = getTransport();
        const info = await transporter.sendMail({
            from: mailFrom,
            to: toEmail,
            subject: mail.subject,
            text: mail.text,
            html: mail.html,
            replyTo: values.email,
        });

        return NextResponse.json({
            ok: true,
            routedTo: contactKey,
            messageId: info.messageId,
        });
    } catch (err) {
        console.error("POST /api/contact error:", err);
        return NextResponse.json(
            { ok: false, error: "Erreur serveur lors de l’envoi." },
            { status: 500 }
        );
    }
}