import { withApiErrors } from "@/server/api/http";
import { handleAdminDashboard } from "@/server/api/adminHandlers";

export async function GET(request: Request) {
  return withApiErrors(() => handleAdminDashboard(request));
}
