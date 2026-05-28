export type WhatsAppTemplateMessage = {
  to: string;
  templateKey: string;
  locale?: string;
  variables: Record<string, string>;
};

export type ProviderSendResult = {
  provider: string;
  providerMessageId: string;
  status: "sent";
};

export interface WhatsAppProvider {
  sendTemplate(message: WhatsAppTemplateMessage): Promise<ProviderSendResult>;
}

// ─── Mock ────────────────────────────────────────────────────────────────────

export class MockWhatsAppProvider implements WhatsAppProvider {
  async sendTemplate(message: WhatsAppTemplateMessage): Promise<ProviderSendResult> {
    console.log(`[MockWhatsApp] sendTemplate ${message.templateKey} → ${message.to}`);
    return {
      provider: "mock",
      providerMessageId: `mock_whatsapp_${message.templateKey}_${Date.now()}`,
      status: "sent",
    };
  }
}

// ─── Twilio ──────────────────────────────────────────────────────────────────

/**
 * German message bodies keyed by templateKey.
 * Variables are interpolated from the `variables` map.
 */
const TWILIO_TEMPLATES: Record<string, (vars: Record<string, string>) => string> = {
  "whatsapp.order_confirmed.v1": (v) =>
    `✅ Hallo ${v["customerName"] ?? ""}! Deine Bestellung *${v["orderNumber"] ?? ""}* beim Spargelstand ist bestätigt.\n` +
    `🕐 Abholzeit: ${v["pickupTime"] ?? ""}\n` +
    `🔗 QR-Code: ${process.env.NEXT_PUBLIC_APP_URL ?? ""}/orders/${v["orderId"] ?? ""}/qr`,

  "whatsapp.payment_confirmed.v1": (v) =>
    `💳 Zahlung für Bestellung *${v["orderNumber"] ?? ""}* erfolgreich eingegangen. Danke!`,

  "whatsapp.pickup_reminder.v1": (v) =>
    `🌿 Erinnerung: Dein Spargel wartet!\n` +
    `Bestellung *${v["orderNumber"] ?? ""}* kann heute ab ${v["pickupTime"] ?? ""} abgeholt werden.\n` +
    `🔗 QR-Code: ${process.env.NEXT_PUBLIC_APP_URL ?? ""}/orders/${v["orderId"] ?? ""}/qr`,

  "whatsapp.order_ready.v1": (v) =>
    `🛒 Deine Bestellung *${v["orderNumber"] ?? ""}* ist jetzt abholbereit! Zeig deinen QR-Code am Stand.`,

  "whatsapp.order_changed.v1": (v) =>
    `ℹ️ Deine Bestellung *${v["orderNumber"] ?? ""}* wurde aktualisiert. Bitte prüfe die Details in der App.`,

  "whatsapp.picked_up.v1": (v) =>
    `🙏 Vielen Dank! Bestellung *${v["orderNumber"] ?? ""}* wurde abgeholt. Guten Appetit!`,

  "whatsapp.order_cancelled.v1": (v) =>
    `❌ Deine Bestellung *${v["orderNumber"] ?? ""}* wurde storniert. Bei Fragen melde dich gerne.`,
};

export class TwilioWhatsAppProvider implements WhatsAppProvider {
  private readonly accountSid: string;
  private readonly authToken: string;
  private readonly fromNumber: string; // without whatsapp: prefix

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID!;
    this.authToken  = process.env.TWILIO_AUTH_TOKEN!;
    this.fromNumber = process.env.TWILIO_WHATSAPP_FROM ?? "+14155238886"; // Sandbox default
  }

  async sendTemplate(message: WhatsAppTemplateMessage): Promise<ProviderSendResult> {
    // Lazy-import so the module isn't bundled client-side
    const twilio = (await import("twilio")).default;
    const client = twilio(this.accountSid, this.authToken);

    const bodyFn = TWILIO_TEMPLATES[message.templateKey];
    const body = bodyFn
      ? bodyFn(message.variables)
      : `Spargelstand: Aktualisierung zu deiner Bestellung. ${process.env.NEXT_PUBLIC_APP_URL ?? ""}`;

    const result = await client.messages.create({
      from: `whatsapp:${this.fromNumber}`,
      to:   `whatsapp:${message.to}`,
      body,
    });

    return {
      provider: "twilio",
      providerMessageId: result.sid,
      status: "sent",
    };
  }
}

// ─── Factory ─────────────────────────────────────────────────────────────────

export function createWhatsAppProvider(): WhatsAppProvider {
  switch (process.env.WHATSAPP_PROVIDER) {
    case "twilio":
      return new TwilioWhatsAppProvider();
    default:
      return new MockWhatsAppProvider();
  }
}
