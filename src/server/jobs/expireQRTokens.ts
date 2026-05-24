import { QRTokenStatus } from "@prisma/client";

import { prisma } from "@/server/db/prisma";

export async function expireQRTokensJob(now = new Date()) {
  const result = await prisma.qRToken.updateMany({
    where: {
      status: QRTokenStatus.ACTIVE,
      expiresAt: {
        lte: now,
      },
    },
    data: {
      status: QRTokenStatus.EXPIRED,
    },
  });

  return {
    status: "completed",
    cadence: "every 15-60 minutes",
    responsibility: "abgelaufene QRToken auf expired setzen",
    expiredCount: result.count,
  };
}
