export async function handleWhatsAppStatusWebhook(request: Request) {
  const payload = await request.json().catch(() => null);

  return {
    received: true,
    provider: process.env.WHATSAPP_PROVIDER ?? "mock",
    payloadShape: payload ? Object.keys(payload as Record<string, unknown>) : [],
    implementationNote:
      "Naechster Schritt: Provider-Signatur pruefen, provider_message_id idempotent zu Notification mappen.",
  };
}

export async function handleWhatsAppIncomingWebhook(request: Request) {
  const payload = await request.json().catch(() => null);

  return {
    received: true,
    action: "logged_only",
    payloadShape: payload ? Object.keys(payload as Record<string, unknown>) : [],
    implementationNote:
      "MVP: Eingehende Nachrichten nicht als Bestellkanal verarbeiten, nur protokollieren oder Standardhinweis senden.",
  };
}
