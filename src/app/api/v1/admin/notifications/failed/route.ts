import { withApiErrors } from "@/server/api/http";
import { handleAdminFailedNotifications } from "@/server/api/adminHandlers";

export async function GET(request: Request) {
  return withApiErrors(() => handleAdminFailedNotifications(request));
}
