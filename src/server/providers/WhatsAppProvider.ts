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
 * Maps each templateKey to:
 *  - contentSidEnv: Name der Env-Var mit dem Twilio ContentSid
 *  - variableOrder: Reihenfolge der named variables → {{1}}, {{2}}, ...
 *  - fallbackBody:  Fallback-Text wenn kein ContentSid konfiguriert ist
 */
const TEMPLATE_CONFIG: Record<
  string,
  { contentSidEnv: string; variableOrder: string[]; fallbackBody: (v: Record<string, string>) => string }
> = {
  "whatsapp.order_confirmed.v1": {
    contentSidEnv:  "TWILIO_CONTENT_SID_ORDER_CONFIRMED",
    variableOrder:  ["orderNumber", "pickupTime"],
    fallbackBody:   (v) =>
      `✅ Deine Bestellung *${v["orderNumber"] ?? ""}* ist bestätigt!\n` +
      `🕐 Abholung: ${v["pickupTime"] ?? ""}\n` +
      `🔗 ${process.env.NEXT_PUBLIC_APP_URL}/orders/${v["orderId"] ?? ""}/qr`,
  },
  "whatsapp.payment_confirmed.v1": {
    contentSidEnv:  "TWILIO_CONTENT_SID_PAYMENT_CONFIRMED",
    variableOrder:  ["orderNumber"],
    fallbackBody:   (v) =>
      `💳 Zahlung für Bestellung *${v["orderNumber"] ?? ""}* erfolgreich. Danke!`,
  },
  "whatsapp.pickup_reminder.v1": {
    contentSidEnv:  "TWILIO_CONTENT_SID_PICKUP_REMINDER",
    variableOrder:  ["orderNumber", "pickupTime"],
    fallbackBody:   (v) =>
      `🌿 Erinnerung: Dein Spargel wartet!\n` +
      `Bestellung *${v["orderNumber"] ?? ""}* – heute ab ${v["pickupTime"] ?? ""} abholen.\n` +
      `🔗 ${process.env.NEXT_PUBLIC_APP_URL}/orders/${v["orderId"] ?? ""}/qr`,
  },
  "whatsapp.order_ready.v1": {
    contentSidEnv:  "TWILIO_CONTENT_SID_ORDER_READY",
    variableOrder:  ["orderNumber"],
    fallbackBody:   (v) =>
      `🛒 Bestellung *${v["orderNumber"] ?? ""}* ist jetzt abholbereit. Zeig deinen QR-Code am Stand!`,
  },
  "whatsapp.order_changed.v1": {
    contentSidEnv:  "TWILIO_CONTENT_SID_ORDER_CHANGED",
    variableOrder:  ["orderNumber"],
    fallbackBody:   (v) =>
      `ℹ️ Deine Bestellung *${v["orderNumber"] ?? ""}* wurde aktualisiert. Bitte prüfe die Details in der App.`,
  },
  "whatsapp.picked_up.v1": {
    contentSidEnv:  "TWILIO_CONTENT_SID_PICKED_UP",
    variableOrder:  ["orderNumber"],
    fallbackBody:   (v) =>
      `🙏 Vielen Dank! Bestellung *${v["orderNumber"] ?? ""}* abgeholt. Guten Appetit!`,
  },
  "whatsapp.order_cancelled.v1": {
    contentSidEnv:  "TWILIO_CONTENT_SID_ORDER_CANCELLED",
    variableOrder:  ["orderNumber"],
    fallbackBody:   (v) =>
      `❌ Bestellung *${v["orderNumber"] ?? ""}* wurde storniert. Bei Fragen melde dich gerne.`,
  },
};

export class TwilioWhatsAppProvider implements WhatsAppProvider {
  private readonly accountSid: string;
  private readonly authToken: string;
  private readonly fromNumber: string;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID!;
    this.authToken  = process.env.TWILIO_AUTH_TOKEN!;
    this.fromNumber = process.env.TWILIO_WHATSAPP_FROM ?? "+14155238886"; // Sandbox default
  }

  async sendTemplate(message: WhatsAppTemplateMessage): Promise<ProviderSendResult> {
    const twilio = (await import("twilio")).default;
    const client = twilio(this.accountSid, this.authToken);

    const config = TEMPLATE_CONFIG[message.templateKey];
    const contentSid = config ? (process.env[config.contentSidEnv] ?? "") : "";

    let params: Parameters<typeof client.messages.create>[0];

    if (contentSid) {
      // ── ContentSid-Modus (genehmigte Templates, z.B. Produktion) ──────────
      // Twilio ContentVariables: { "1": val1, "2": val2, ... }
      const contentVariables: Record<string, string> = {};
      (config?.variableOrder ?? []).forEach((key, i) => {
        contentVariables[String(i + 1)] = message.variables[key] ?? "";
      });

      params = {
        from:             `whatsapp:${this.fromNumber}`,
        to:               `whatsapp:${message.to}`,
        contentSid,
        contentVariables: JSON.stringify(contentVariables),
      };
    } else {
      // ── Body-Modus (Sandbox / Fallback) ───────────────────────────────────
      const body = config
        ? config.fallbackBody(message.variables)
        : `Spargelstand: Aktualisierung zu deiner Bestellung. ${process.env.NEXT_PUBLIC_APP_URL ?? ""}`;

      params = {
        from: `whatsapp:${this.fromNumber}`,
        to:   `whatsapp:${message.to}`,
        body,
      };
    }

    const result = await client.messages.create(params);

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
