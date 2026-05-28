import { UserRole } from "@prisma/client";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/server/db/prisma";

const roleMap: Record<UserRole, string> = {
  [UserRole.CUSTOMER]: "customer",
  [UserRole.PRODUCER_ADMIN]: "producer_admin",
  [UserRole.STAFF]: "staff",
  [UserRole.PLATFORM_ADMIN]: "platform_admin",
};

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) return Response.json(null);

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { id: true, role: true },
    });

    if (!user) return Response.json(null);

    return Response.json({
      id: user.id,
      role: roleMap[user.role],
      email: authUser.email ?? "",
    });
  } catch {
    return Response.json(null);
  }
}
