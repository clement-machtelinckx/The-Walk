import type { EmailContent, BrandConfig } from "./shared";
import { kvTable, nl2brEscaped, renderEmailLayout } from "./shared";

export type ContactEmailData = {
    insuranceLabel: string;
    userType: string;
    jobFunction: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    companyName?: string;
    companyAddress?: string;
    postalCode: string;
    city: string;
    message: string;
};

export function buildContactEmail(
    data: ContactEmailData,
    brand?: BrandConfig
): EmailContent {
    const subject = `[Contact] ${data.insuranceLabel} — ${data.lastName} ${data.firstName}`;

    const text = [
        `Nouveau message via le formulaire`,
        ``,
        `Assurance : ${data.insuranceLabel}`,
        ``,
        `Vous êtes : ${data.userType}`,
        `Fonction : ${data.jobFunction}`,
        ``,
        `Nom : ${data.lastName}`,
        `Prénom : ${data.firstName}`,
        `Email : ${data.email}`,
        `Téléphone : ${data.phone}`,
        ``,
        `Raison sociale : ${data.companyName || "-"}`,
        `Adresse : ${data.companyAddress || "-"}`,
        `CP / Ville : ${data.postalCode} ${data.city}`,
        ``,
        `Message :`,
        data.message,
    ].join("\n");

    const sectionsHtml = `
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:14px;">
      ${kvTable([
        { label: "Assurance", value: data.insuranceLabel },
        { label: "Vous êtes", value: data.userType },
        { label: "Fonction", value: data.jobFunction },
    ])}
    </div>

    <div style="height:14px;"></div>

    <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:14px;">
      <div style="font-size:14px;font-weight:800;color:#111827;margin-bottom:10px;">Coordonnées</div>
      ${kvTable([
        { label: "Nom", value: data.lastName },
        { label: "Prénom", value: data.firstName },
        { label: "Email", value: data.email },
        { label: "Téléphone", value: data.phone },
    ])}
    </div>

    <div style="height:14px;"></div>

    <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:14px;">
      <div style="font-size:14px;font-weight:800;color:#111827;margin-bottom:10px;">Entreprise</div>
      ${kvTable([
        { label: "Raison sociale", value: data.companyName || "-" },
        { label: "Adresse", value: data.companyAddress || "-" },
        { label: "CP / Ville", value: `${data.postalCode} ${data.city}` },
    ])}
    </div>

    <div style="height:14px;"></div>

    <div style="background:#111827;border-radius:12px;padding:14px;">
      <div style="font-size:13px;color:#d1d5db;margin-bottom:8px;">Message</div>
      <div style="font-size:14px;line-height:1.6;color:#ffffff;white-space:normal;">
        ${nl2brEscaped(data.message)}
      </div>
    </div>
  `;

    const html = renderEmailLayout({
        title: "Nouveau message via le formulaire",
        subtitle: `Assurance : ${data.insuranceLabel}`,
        previewText: `Nouveau message — ${data.insuranceLabel} — ${data.lastName} ${data.firstName}`,
        bodyHtml: sectionsHtml,
        brand,
    });

    return { subject, text, html };
}