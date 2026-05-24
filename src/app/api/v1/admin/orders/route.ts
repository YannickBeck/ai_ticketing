import { withApiErrors } from "@/server/api/http";
import { handleAdminOrders } from "@/server/api/adminHandlers";

export async function GET(request: Request) {
  return withApiErrors(() => handleAdminOrders(request));
}
