import { withApiErrors } from "@/server/api/http";
import { handleWhatsAppIncomingRoute } from "@/server/api/webhookHandlers";

export async function POST(request: Request) {
  return withApiErrors(() => handleWhatsAppIncomingRoute(request));
}
