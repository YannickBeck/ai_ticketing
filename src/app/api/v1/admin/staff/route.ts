import { withApiErrors } from "@/server/api/http";
import { handleCreateStaff } from "@/server/api/adminHandlers";

export async function POST(request: Request) {
  return withApiErrors(() => handleCreateStaff(request));
}
