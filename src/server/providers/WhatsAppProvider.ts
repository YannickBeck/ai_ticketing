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

export class MockWhatsAppProvider implements WhatsAppProvider {
  async sendTemplate(message: WhatsAppTemplateMessage): Promise<ProviderSendResult> {
    return {
      provider: process.env.WHATSAPP_PROVIDER ?? "mock",
      providerMessageId: `mock_whatsapp_${message.templateKey}_${Date.now()}`,
      status: "sent",
    };
  }
}

export function createWhatsAppProvider(): WhatsAppProvider {
  return new MockWhatsAppProvider();
}
