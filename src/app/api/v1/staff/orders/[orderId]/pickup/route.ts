import { withApiErrors } from "@/server/api/http";
import { handleStaffPickup } from "@/server/api/staffHandlers";

type Context = { params: Promise<{ orderId: string }> };

export async function POST(request: Request, context: Context) {
  const { orderId } = await context.params;
  return withApiErrors(() => handleStaffPickup(request, orderId));
}
