export type EmailMessage = {
  to: string;
  subject: string;
  templateKey: string;
  variables: Record<string, string>;
};

export interface EmailProvider {
  send(message: EmailMessage): Promise<{ provider: string; providerMessageId: string; status: "sent" }>;
}

export class MockEmailProvider implements EmailProvider {
  async send(message: EmailMessage) {
    return {
      provider: "mock",
      providerMessageId: `mock_email_${message.templateKey}_${Date.now()}`,
      status: "sent" as const,
    };
  }
}

export class ResendEmailProvider implements EmailProvider {
  async send(message: EmailMessage) {
    // Lazy import so the module is only loaded when Resend is active
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY!);

    const subject = this.subjectForTemplate(message.templateKey, message.variables);
    const html = this.htmlForTemplate(message.templateKey, message.variables);

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "Spargelstand <noreply@example.local>",
      to: message.to,
      subject,
      html,
    });

    return {
      provider: "resend",
      providerMessageId: result.data?.id ?? `resend_${Date.now()}`,
      status: "sent" as const,
    };
  }

  private subjectForTemplate(templateKey: string, vars: Record<string, string>): string {
    const subjects: Record<string, string> = {
      "email.order_confirmed.v1": "Bestellbestätigung – Spargelstand",
      "email.pickup_reminder.v1": "Erinnerung: Dein Spargel wartet!",
      "email.order_ready.v1": "Deine Bestellung ist abholbereit",
      "email.order_cancelled.v1": "Bestellung storniert",
      "email.order_changed.v1": "Deine Bestellung wurde geändert",
      "email.picked_up.v1": "Vielen Dank für deine Abholung!",
    };
    return subjects[templateKey] ?? `Spargelstand – ${vars["orderNumber"] ?? "Bestellung"}`;
  }

  private htmlForTemplate(templateKey: string, vars: Record<string, string>): string {
    const orderNumber = vars["orderNumber"] ?? "";
    const customerName = vars["customerName"] ?? "Kunde";
    const pickupTime = vars["pickupTime"] ?? "";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://spargel-app.vercel.app";

    if (templateKey === "email.order_confirmed.v1") {
      return `
        <h2>Hallo ${customerName},</h2>
        <p>deine Bestellung <strong>${orderNumber}</strong> wurde bestätigt.</p>
        ${pickupTime ? `<p>Abholzeit: <strong>${pickupTime}</strong></p>` : ""}
        <p><a href="${appUrl}/orders/${vars["orderId"] ?? ""}">Bestellung anzeigen</a></p>
        <p>Dein Spargelstand-Team</p>
      `.trim();
    }

    if (templateKey === "email.pickup_reminder.v1") {
      return `
        <h2>Hallo ${customerName},</h2>
        <p>dein Spargel für Bestellung <strong>${orderNumber}</strong> wartet auf dich!</p>
        ${pickupTime ? `<p>Abholzeit: <strong>${pickupTime}</strong></p>` : ""}
        <p><a href="${appUrl}/orders/${vars["orderId"] ?? ""}">QR-Code anzeigen</a></p>
        <p>Dein Spargelstand-Team</p>
      `.trim();
    }

    // Generic fallback
    return `
      <h2>Hallo ${customerName},</h2>
      <p>Es gibt eine Aktualisierung zu deiner Bestellung <strong>${orderNumber}</strong>.</p>
      <p><a href="${appUrl}">Zum Spargelstand</a></p>
    `.trim();
  }
}

export function createEmailProvider(): EmailProvider {
  if (process.env.EMAIL_PROVIDER === "resend") {
    return new ResendEmailProvider();
  }
  return new MockEmailProvider();
}
