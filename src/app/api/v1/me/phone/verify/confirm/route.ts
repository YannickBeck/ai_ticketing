import { withApiErrors } from "@/server/api/http";
import { handlePhoneVerifyConfirm } from "@/server/api/customerHandlers";

export async function POST(request: Request) {
  return withApiErrors(() => handlePhoneVerifyConfirm(request));
}
