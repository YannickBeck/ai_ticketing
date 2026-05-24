import { paymentService } from "@/server/services/PaymentService";

export async function handleStripeWebhook(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");
  return paymentService.handleStripeWebhook(rawBody, signature);
}
