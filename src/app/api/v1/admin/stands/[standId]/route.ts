import { withApiErrors } from "@/server/api/http";
import { handleAdminGetStand, handlePatchStand } from "@/server/api/adminHandlers";

type Context = { params: Promise<{ standId: string }> };

export async function GET(request: Request, context: Context) {
  const { standId } = await context.params;
  return withApiErrors(() => handleAdminGetStand(request, standId));
}

export async function PATCH(request: Request, context: Context) {
  const { standId } = await context.params;
  return withApiErrors(() => handlePatchStand(request, standId));
}
