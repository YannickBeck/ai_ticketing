import { withApiErrors } from "@/server/api/http";
import { handleAdminNotifications } from "@/server/api/adminHandlers";

export async function GET(request: Request) {
  return withApiErrors(() => handleAdminNotifications(request));
}
