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
      provider: process.env.EMAIL_PROVIDER ?? "mock",
      providerMessageId: `mock_email_${message.templateKey}_${Date.now()}`,
      status: "sent" as const,
    };
  }
}

export function createEmailProvider(): EmailProvider {
  return new MockEmailProvider();
}
