import nodemailer from "nodemailer";

export function getTransport() {
    const host = process.env.SMTP_HOST!;
    const port = Number(process.env.SMTP_PORT || 587);

    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
            user: process.env.SMTP_USER!,
            pass: process.env.SMTP_PASS!,
        },
    });
}