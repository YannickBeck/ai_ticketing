import { withApiErrors } from "@/server/api/http";
import { handleStaffOutOfStock } from "@/server/api/staffHandlers";

type Context = { params: Promise<{ productId: string }> };

export async function POST(request: Request, context: Context) {
  const { productId } = await context.params;
  return withApiErrors(() => handleStaffOutOfStock(request, productId));
}
