import { withApiErrors } from "@/server/api/http";
import { handleDeliverySuggestions } from "@/server/api/adminHandlers";

export async function GET(request: Request) {
  return withApiErrors(() => handleDeliverySuggestions(request));
}
