import { jsonAccepted, jsonOk } from "@/server/api/http";
import { handleStripeWebhook } from "@/server/webhooks/stripeWebhookHandler";
import { handleWhatsAppIncomingWebhook, handleWhatsAppStatusWebhook } from "@/server/webhooks/whatsappWebhookHandler";

export async function handleStripeWebhookRoute(request: Request) {
  return jsonAccepted(await handleStripeWebhook(request));
}

export async function handleWhatsAppIncomingRoute(request: Request) {
  return jsonOk(await handleWhatsAppIncomingWebhook(request));
}

export async function handleWhatsAppStatusRoute(request: Request) {
  return jsonOk(await handleWhatsAppStatusWebhook(request));
}
