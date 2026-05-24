import { withApiErrors } from "@/server/api/http";
import { handlePatchProduct } from "@/server/api/adminHandlers";

type Context = { params: Promise<{ productId: string }> };

export async function PATCH(request: Request, context: Context) {
  const { productId } = await context.params;
  return withApiErrors(() => handlePatchProduct(request, productId));
}
