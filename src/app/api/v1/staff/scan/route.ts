import { withApiErrors } from "@/server/api/http";
import { handleStaffScan } from "@/server/api/staffHandlers";

export async function POST(request: Request) {
  return withApiErrors(() => handleStaffScan(request));
}
