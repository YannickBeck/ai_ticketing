import { ApiError } from "@/server/api/http";
import { prisma } from "@/server/db/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SessionUser } from "@/server/domain/types";

export async function getCurrentUser(_request?: Request): Promise<SessionUser | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: {
      id: true,
      role: true,
      producerId: true,
      staffStandAssignments: { select: { standId: true } },
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    role: user.role as SessionUser["role"],
    producerId: user.producerId ?? undefined,
    standIds: user.staffStandAssignments.map((a) => a.standId),
  };
}

export async function requireUser(_request?: Request): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new ApiError("AUTH_REQUIRED", "Authentifizierung erforderlich.", 401);
  }
  return user;
}
