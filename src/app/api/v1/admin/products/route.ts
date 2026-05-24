import { withApiErrors } from "@/server/api/http";
import { handleAdminProductList, handleCreateProduct } from "@/server/api/adminHandlers";

export async function GET(request: Request) {
  return withApiErrors(() => handleAdminProductList(request));
}

export async function POST(request: Request) {
  return withApiErrors(() => handleCreateProduct(request));
}
