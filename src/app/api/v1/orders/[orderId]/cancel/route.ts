import { withApiErrors } from "@/server/api/http";
import { handleCancelOrder } from "@/server/api/customerHandlers";

type Context = { params: Promise<{ orderId: string }> };

export async function POST(request: Request, context: Context) {
  const { orderId } = await context.params;
  return withApiErrors(() => handleCancelOrder(request, orderId));
}
