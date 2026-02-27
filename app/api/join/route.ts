import { NextResponse } from "next/server";
import { z } from "zod";
import { getTransport } from "@/lib/mailer";
import { CONTACTS } from "@/config/contact";

export const runtime = "nodejs";

const MAX_CV_BYTES = 5 * 1024 * 1024; // 5MB

const AllowedMime = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

const JoinSchema = z.object({
    firstName: z.string().min(2).max(80),
    lastName: z.string().min(2).max(80),
    email: z.string().email().max(120),
    phone: z
        .string()
        .min(8)
        .max(20)
        .regex(/^[0-9+().\s-]+$/),
    website: z.string().optional().default(""), // honeypot
});

function escapeHtml(input: string) {
    return input
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function extFromName(name: string) {
    const idx = name.lastIndexOf(".");
    return idx >= 0 ? name.slice(idx + 1).toLowerCase() : "";
}

export async function POST(req: Request) {
    try {
        const formData = await req.formData();

        const raw = {
            firstName: String(formData.get("firstName") ?? ""),
            lastName: String(formData.get("lastName") ?? ""),
            email: String(formData.get("email") ?? ""),
            phone: String(formData.get("phone") ?? ""),
            website: String(formData.get("website") ?? ""),
        };

        const parsed = JoinSchema.safeParse(raw);
        if (!parsed.success) {
            return NextResponse.json(
                { ok: false, error: "Champs invalides.", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        // Honeypot rempli => bot => on répond OK sans rien faire
        if (parsed.data.website.trim().length > 0) {
            return NextResponse.json({ ok: true });
        }

        const cv = formData.get("cv");
        if (!(cv instanceof File)) {
            return NextResponse.json({ ok: false, error: "CV requis." }, { status: 400 });
        }

        // Validation fichier
        if (cv.size > MAX_CV_BYTES) {
            return NextResponse.json(
                { ok: false, error: "Fichier trop lourd (max 5MB)." },
                { status: 400 }
            );
        }

        const ext = extFromName(cv.name);
        const allowedExt = ["pdf", "doc", "docx"];
        if (!allowedExt.includes(ext)) {
            return NextResponse.json(
                { ok: false, error: "Format invalide (PDF, DOC, DOCX)." },
                { status: 400 }
            );
        }

        if (!AllowedMime.includes(cv.type as any)) {
            // Certains navigateurs peuvent envoyer un type vide => on tolère si extension OK
            if (cv.type && cv.type.trim().length > 0) {
                return NextResponse.json(
                    { ok: false, error: "Type de fichier invalide." },
                    { status: 400 }
                );
            }
        }

        const toEmail = CONTACTS.recrutement.email;
        const from = process.env.MAIL_FROM!;
        const subject = `[Candidature] ${parsed.data.lastName} ${parsed.data.firstName}`;

        const text = `Nouvelle candidature via le formulaire JOIN

Nom: ${parsed.data.lastName}
Prénom: ${parsed.data.firstName}
Email: ${parsed.data.email}
Téléphone: ${parsed.data.phone}

CV: ${cv.name} (${Math.round(cv.size / 1024)} KB)
`;

        const html = `
      <h2>Nouvelle candidature</h2>
      <p><strong>Nom :</strong> ${escapeHtml(parsed.data.lastName)}</p>
      <p><strong>Prénom :</strong> ${escapeHtml(parsed.data.firstName)}</p>
      <p><strong>Email :</strong> <a href="mailto:${escapeHtml(parsed.data.email)}">${escapeHtml(parsed.data.email)}</a></p>
      <p><strong>Téléphone :</strong> ${escapeHtml(parsed.data.phone)}</p>
      <hr />
      <p><strong>CV :</strong> ${escapeHtml(cv.name)} (${Math.round(cv.size / 1024)} KB)</p>
    `;

        const bytes = Buffer.from(await cv.arrayBuffer());

        const transporter = getTransport();
        const info = await transporter.sendMail({
            from,
            to: toEmail,
            subject,
            text,
            html,
            replyTo: parsed.data.email,
            attachments: [
                {
                    filename: cv.name,
                    content: bytes,
                    contentType: cv.type || undefined,
                },
            ],
        });

        return NextResponse.json({
            ok: true,
            toEmail,
            messageId: info.messageId,
        });
    } catch (err) {
        console.error("POST /api/join error:", err);
        return NextResponse.json(
            { ok: false, error: "Erreur serveur lors de l’envoi." },
            { status: 500 }
        );
    }
}