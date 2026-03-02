import nodemailer from "nodemailer";

export function getTransport() {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
        throw new Error("Variables SMTP_HOST, SMTP_USER et SMTP_PASS requises.");
    }

    const port = Number(process.env.SMTP_PORT || 587);

    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
    });
}