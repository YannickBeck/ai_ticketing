import { withApiErrors } from "@/server/api/http";
import { handleAdminNotifyOrder } from "@/server/api/adminHandlers";

type Context = { params: Promise<{ orderId: string }> };

export async function POST(request: Request, context: Context) {
  const { orderId } = await context.params;
  return withApiErrors(() => handleAdminNotifyOrder(request, orderId));
}
