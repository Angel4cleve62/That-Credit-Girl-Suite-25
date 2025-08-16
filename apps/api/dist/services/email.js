import nodemailer from 'nodemailer';
function createTransport() {
    const host = process.env.SMTP_HOST || 'localhost';
    const port = Number(process.env.SMTP_PORT || 1025);
    const user = process.env.SMTP_USER || '';
    const pass = process.env.SMTP_PASS || '';
    const secure = port === 465;
    return nodemailer.createTransport({ host, port, secure, auth: user ? { user, pass } : undefined });
}
export async function sendEmail(options) {
    const from = process.env.FROM_EMAIL || 'no-reply@example.com';
    const transporter = createTransport();
    const info = await transporter.sendMail({ from, ...options, to: Array.isArray(options.to) ? options.to.join(',') : options.to });
    return info.messageId;
}
