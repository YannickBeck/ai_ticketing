import { withApiErrors } from "@/server/api/http";
import { handleAdminOrderNotifications } from "@/server/api/adminHandlers";

type Context = { params: Promise<{ orderId: string }> };

export async function GET(request: Request, context: Context) {
  const { orderId } = await context.params;
  return withApiErrors(() => handleAdminOrderNotifications(request, orderId));
}
