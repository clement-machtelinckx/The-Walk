import type { EmailContent, BrandConfig } from "./shared";
import { kvTable, renderEmailLayout } from "./shared";

export type JoinEmailData = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
};

export type CvMeta = {
    filename: string;
    sizeKb: number;
    mimeType?: string;
};

export function buildJoinEmail(
    data: JoinEmailData,
    cv: CvMeta,
    brand?: BrandConfig
): EmailContent {
    const subject = `[Candidature] ${data.lastName} ${data.firstName}`;

    const text = [
        `Nouvelle candidature`,
        ``,
        `Nom : ${data.lastName}`,
        `Prénom : ${data.firstName}`,
        `Email : ${data.email}`,
        `Téléphone : ${data.phone}`,
        ``,
        `CV : ${cv.filename} (${cv.sizeKb} KB)`,
    ].join("\n");

    const bodyHtml = `
    <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:14px;">
      <div style="font-size:14px;font-weight:800;color:#111827;margin-bottom:10px;">Candidat</div>
      ${kvTable([
        { label: "Nom", value: data.lastName },
        { label: "Prénom", value: data.firstName },
        { label: "Email", value: data.email },
        { label: "Téléphone", value: data.phone },
    ])}
    </div>

    <div style="height:14px;"></div>

    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:14px;">
      <div style="font-size:14px;font-weight:800;color:#111827;margin-bottom:10px;">CV (pièce jointe)</div>
      ${kvTable([
        { label: "Fichier", value: cv.filename },
        { label: "Taille", value: `${cv.sizeKb} KB` },
        { label: "Type", value: cv.mimeType || "-" },
    ])}
      <div style="margin-top:10px;font-size:12px;color:#6b7280;">
        Le CV est joint à cet email.
      </div>
    </div>
  `;

    const html = renderEmailLayout({
        title: "Nouvelle candidature",
        subtitle: `${data.lastName} ${data.firstName}`,
        previewText: `Nouvelle candidature — ${data.lastName} ${data.firstName}`,
        bodyHtml,
        brand,
    });

    return { subject, text, html };
}