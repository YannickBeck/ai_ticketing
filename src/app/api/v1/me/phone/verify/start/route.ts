import { withApiErrors } from "@/server/api/http";
import { handlePhoneVerifyStart } from "@/server/api/customerHandlers";

export async function POST(request: Request) {
  return withApiErrors(() => handlePhoneVerifyStart(request));
}
