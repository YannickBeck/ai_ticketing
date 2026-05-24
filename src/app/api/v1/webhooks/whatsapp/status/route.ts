import { withApiErrors } from "@/server/api/http";
import { handleWhatsAppStatusRoute } from "@/server/api/webhookHandlers";

export async function POST(request: Request) {
  return withApiErrors(() => handleWhatsAppStatusRoute(request));
}
