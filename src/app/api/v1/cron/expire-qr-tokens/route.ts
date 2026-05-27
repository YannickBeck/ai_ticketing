import { NextResponse } from "next/server";

import { jsonOk, withApiErrors } from "@/server/api/http";
import { expireQRTokensJob } from "@/server/jobs/expireQRTokens";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const expectedSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return withApiErrors(async () => jsonOk(await expireQRTokensJob()));
}
