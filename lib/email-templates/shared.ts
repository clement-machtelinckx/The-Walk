export type EmailContent = {
    subject: string;
    text: string;
    html: string;
};

export type BrandConfig = {
    brandName?: string; // ex: "ProtecAudio"
    logoUrl?: string;   // ex: https://.../logo.png (public HTTPS)
    footerText?: string; // ex: "Envoyé depuis le site..."
};

export function escapeHtml(input: string) {
    return input
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

export function formatDateFR(date = new Date()) {
    try {
        return date.toLocaleString("fr-FR");
    } catch {
        return String(date);
    }
}

export function nl2brEscaped(text: string) {
    return escapeHtml(text).replaceAll("\n", "<br />");
}

export function kvTable(rows: Array<{ label: string; value: string }>) {
    const safe = rows
        .filter((r) => r.value !== undefined && r.value !== null)
        .map((r) => ({
            label: escapeHtml(r.label),
            value: escapeHtml(r.value || "-"),
        }));

    return `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:14px;color:#111827;">
    ${safe
            .map(
                (r) => `
      <tr>
        <td style="padding:6px 0;color:#6b7280;width:180px;">${r.label}</td>
        <td style="padding:6px 0;font-weight:600;">${r.value}</td>
      </tr>`
            )
            .join("")}
  </table>`;
}

export function renderEmailLayout(opts: {
    title: string;
    subtitle?: string;
    previewText: string;
    bodyHtml: string;
    brand?: BrandConfig;
}) {
    const brandName = opts.brand?.brandName ?? "ProtecAudio";
    const logoUrl = opts.brand?.logoUrl;
    const footerText = opts.brand?.footerText ?? `Envoyé depuis le site ${brandName}`;

    const logo = logoUrl
        ? `<img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(
            brandName
        )}" style="height:40px;width:auto;display:block;" />`
        : `<div style="font-size:18px;font-weight:800;color:#111827;">${escapeHtml(
            brandName
        )}</div>`;

    const subtitleHtml = opts.subtitle
        ? `<div style="margin-top:6px;font-size:13px;color:#6b7280;">${escapeHtml(
            opts.subtitle
        )}</div>`
        : "";

    return `<!doctype html>
<html>
  <head>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(opts.title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f3f4f6;">
    <!-- preview text -->
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      ${escapeHtml(opts.previewText)}
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f4f6;padding:24px 0;">
      <tr>
        <td align="center" style="padding:0 12px;">
          <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="width:640px;max-width:100%;">
            <tr>
              <td style="padding:16px 20px;">
                ${logo}
              </td>
            </tr>

            <tr>
              <td style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 6px 24px rgba(0,0,0,.08);">
                <div style="padding:22px 22px 10px 22px;">
                  <div style="font-size:18px;font-weight:800;color:#111827;">${escapeHtml(
        opts.title
    )}</div>
                  ${subtitleHtml}
                </div>

                <div style="padding:0 22px 18px 22px;">
                  ${opts.bodyHtml}
                </div>

                <div style="padding:16px 22px;border-top:1px solid #e5e7eb;background:#fafafa;">
                  <div style="font-size:12px;color:#6b7280;">
                    ${escapeHtml(footerText)} • ${escapeHtml(formatDateFR())}
                  </div>
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:14px 20px;text-align:center;color:#9ca3af;font-size:12px;">
                © ${new Date().getFullYear()} ${escapeHtml(brandName)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}