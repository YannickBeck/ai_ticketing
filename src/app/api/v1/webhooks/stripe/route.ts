import { withApiErrors } from "@/server/api/http";
import { handleStripeWebhookRoute } from "@/server/api/webhookHandlers";

export async function POST(request: Request) {
  return withApiErrors(() => handleStripeWebhookRoute(request));
}
