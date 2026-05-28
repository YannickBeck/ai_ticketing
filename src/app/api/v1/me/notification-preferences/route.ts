import { withApiErrors } from "@/server/api/http";
import { handleGetNotificationPreferences, handleUpdateNotificationPreferences } from "@/server/api/customerHandlers";

export async function GET(request: Request) {
  return withApiErrors(() => handleGetNotificationPreferences(request));
}

export async function PATCH(request: Request) {
  return withApiErrors(() => handleUpdateNotificationPreferences(request));
}
