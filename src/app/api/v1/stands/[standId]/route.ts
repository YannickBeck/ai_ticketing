import { withApiErrors } from "@/server/api/http";
import { handleGetStand } from "@/server/api/customerHandlers";

type Context = { params: Promise<{ standId: string }> };

export async function GET(_request: Request, context: Context) {
  const { standId } = await context.params;
  return withApiErrors(() => handleGetStand(standId));
}
