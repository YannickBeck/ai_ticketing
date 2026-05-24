import { withApiErrors } from "@/server/api/http";
import { handleStaffInventory } from "@/server/api/staffHandlers";

export async function PATCH(request: Request) {
  return withApiErrors(() => handleStaffInventory(request));
}
