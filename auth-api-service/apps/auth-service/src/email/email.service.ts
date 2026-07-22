import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false, // TLS via STARTTLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: process.env.EMAIL_TLS_REJECT_UNAUTHORIZED !== 'false',
      },
    });

    this.logger.log(
      `Email transporter configured — host: ${process.env.EMAIL_HOST}, user: ${process.env.EMAIL_USER}`,
    );
  }

  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    const from = process.env.EMAIL_FROM ?? 'NexoPet <no-reply@nexopet.com>';

    try {
      const info = await this.transporter.sendMail({
        from,
        to,
        subject: 'Restablecer contraseña - NexoPet',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4a90d9;">Restablecer tu contraseña</h2>
            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en NexoPet.</p>
            <p>Haz clic en el siguiente enlace para crear una nueva contraseña. Este enlace expira en <strong>1 hora</strong>.</p>
            <a href="${resetUrl}"
               style="display:inline-block;padding:12px 24px;background:#4a90d9;color:#fff;border-radius:4px;text-decoration:none;margin:16px 0;">
              Restablecer contraseña
            </a>
            <p style="color:#888;font-size:12px;">
              Si no solicitaste este cambio, ignora este mensaje y tu contraseña permanecerá igual.
            </p>
          </div>
        `,
      });

      this.logger.log(`Password reset email sent to ${to} — messageId: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${to}`, (error as Error).stack);
      throw new InternalServerErrorException('No se pudo enviar el correo de restablecimiento');
    }
  }
}
