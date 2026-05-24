import { withApiErrors } from "@/server/api/http";
import { handleStaffDelivery } from "@/server/api/staffHandlers";

export async function POST(request: Request) {
  return withApiErrors(() => handleStaffDelivery(request));
}
