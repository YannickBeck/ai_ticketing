import { withApiErrors } from "@/server/api/http";
import { handleAdminStandList, handleCreateStand } from "@/server/api/adminHandlers";

export async function GET(request: Request) {
  return withApiErrors(() => handleAdminStandList(request));
}

export async function POST(request: Request) {
  return withApiErrors(() => handleCreateStand(request));
}
