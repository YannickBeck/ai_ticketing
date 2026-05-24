import { withApiErrors } from "@/server/api/http";
import { handleUpdateNotificationPreferences } from "@/server/api/customerHandlers";

export async function PATCH(request: Request) {
  return withApiErrors(() => handleUpdateNotificationPreferences(request));
}
