import { withApiErrors } from "@/server/api/http";
import { handlePatchInventory } from "@/server/api/adminHandlers";

type Context = { params: Promise<{ standId: string; productId: string }> };

export async function PATCH(request: Request, context: Context) {
  const { standId, productId } = await context.params;
  return withApiErrors(() => handlePatchInventory(request, standId, productId));
}
