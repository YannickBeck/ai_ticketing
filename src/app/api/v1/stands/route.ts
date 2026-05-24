import { withApiErrors } from "@/server/api/http";
import { handleListStands } from "@/server/api/customerHandlers";

export async function GET(request: Request) {
  return withApiErrors(() => handleListStands(request));
}
