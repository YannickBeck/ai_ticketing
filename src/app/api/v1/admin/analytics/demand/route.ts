import { withApiErrors } from "@/server/api/http";
import { handleDemandAnalytics } from "@/server/api/adminHandlers";

export async function GET(request: Request) {
  return withApiErrors(() => handleDemandAnalytics(request));
}
