import { withApiErrors } from "@/server/api/http";
import { handleGetOrderQr } from "@/server/api/customerHandlers";

type Context = { params: Promise<{ orderId: string }> };

export async function GET(request: Request, context: Context) {
  const { orderId } = await context.params;
  return withApiErrors(() => handleGetOrderQr(request, orderId));
}
