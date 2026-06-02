import type { TableRole } from "@/types/table";

export interface EmailContent {
    subject: string;
    html: string;
    text: string;
}

const roleLabels: Record<TableRole, string> = {
    gm: "Maître du Jeu",
    player: "joueur",
    observer: "observateur",
};

function escapeHtml(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function formatDate(value: string | null): string {
    if (!value) {
        return "Date à confirmer";
    }

    return new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "long",
        timeStyle: "short",
        timeZone: "Europe/Paris",
    }).format(new Date(value));
}

function renderLayout(title: string, body: string, actionLabel?: string, actionUrl?: string) {
    const action =
        actionLabel && actionUrl
            ? `<p style="margin:24px 0;"><a href="${escapeHtml(actionUrl)}" style="display:inline-block;padding:10px 14px;background:#111827;color:#ffffff;text-decoration:none;border-radius:6px;">${escapeHtml(actionLabel)}</a></p>`
            : "";

    return `
<!doctype html>
<html lang="fr">
  <body style="margin:0;padding:24px;background:#f7f7f8;color:#111827;font-family:Arial,sans-serif;">
    <main style="max-width:560px;margin:0 auto;background:#ffffff;padding:24px;border:1px solid #e5e7eb;border-radius:8px;">
      <p style="margin:0 0 16px;color:#6b7280;font-size:13px;">The-Walk</p>
      <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;">${escapeHtml(title)}</h1>
      ${body}
      ${action}
      <p style="margin:24px 0 0;color:#6b7280;font-size:12px;">Email transactionnel envoyé par The-Walk.</p>
    </main>
  </body>
</html>`.trim();
}

export function buildTableInvitationEmail(input: {
    tableName: string;
    role: TableRole;
    invitationUrl: string;
}): EmailContent {
    const roleLabel = roleLabels[input.role];
    const subject = `Invitation à rejoindre ${input.tableName}`;
    const body = `
      <p>Vous avez été invité à rejoindre la table <strong>${escapeHtml(input.tableName)}</strong> en tant que ${escapeHtml(roleLabel)}.</p>
      <p>Ouvrez le lien ci-dessous pour consulter et accepter l'invitation.</p>
    `;

    return {
        subject,
        html: renderLayout(
            "Invitation à rejoindre une table",
            body,
            "Voir l'invitation",
            input.invitationUrl,
        ),
        text: [
            "The-Walk",
            "",
            `Vous avez été invité à rejoindre la table ${input.tableName} en tant que ${roleLabel}.`,
            `Voir l'invitation : ${input.invitationUrl}`,
        ].join("\n"),
    };
}

export function buildSignupConfirmationEmail(input: { appUrl: string }): EmailContent {
    const subject = "Bienvenue sur The-Walk";
    const body = `
      <p>Votre compte The-Walk est bien créé.</p>
      <p>Vous pouvez maintenant rejoindre une table, accepter une invitation ou préparer votre prochaine session.</p>
    `;

    return {
        subject,
        html: renderLayout("Compte créé", body, "Ouvrir The-Walk", input.appUrl),
        text: [
            "The-Walk",
            "",
            "Votre compte The-Walk est bien créé.",
            `Ouvrir The-Walk : ${input.appUrl}`,
        ].join("\n"),
    };
}

export function buildSessionReminderEmail(input: {
    tableName: string;
    sessionTitle: string;
    scheduledAt: string | null;
    sessionUrl: string;
}): EmailContent {
    const formattedDate = formatDate(input.scheduledAt);
    const subject = `Rappel de session - ${input.sessionTitle}`;
    const body = `
      <p>Rappel pour la table <strong>${escapeHtml(input.tableName)}</strong>.</p>
      <p>Prochaine session : <strong>${escapeHtml(input.sessionTitle)}</strong><br />${escapeHtml(formattedDate)}</p>
      <p>Ouvrez The-Walk pour consulter les détails et répondre si nécessaire.</p>
    `;

    return {
        subject,
        html: renderLayout(
            "Rappel de prochaine session",
            body,
            "Voir la session",
            input.sessionUrl,
        ),
        text: [
            "The-Walk",
            "",
            `Rappel pour la table ${input.tableName}.`,
            `Prochaine session : ${input.sessionTitle}`,
            `Date : ${formattedDate}`,
            `Voir la session : ${input.sessionUrl}`,
        ].join("\n"),
    };
}
