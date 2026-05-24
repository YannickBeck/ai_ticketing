import { withApiErrors } from "@/server/api/http";
import { handleCreateOrder } from "@/server/api/customerHandlers";

export async function POST(request: Request) {
  return withApiErrors(() => handleCreateOrder(request));
}
