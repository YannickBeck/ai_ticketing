import { withApiErrors } from "@/server/api/http";
import { handleStaffOrders } from "@/server/api/staffHandlers";

export async function GET(request: Request) {
  return withApiErrors(() => handleStaffOrders(request));
}
