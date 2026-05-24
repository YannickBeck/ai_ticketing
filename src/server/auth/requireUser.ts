import { ApiError } from "@/server/api/http";
import { demoUsers } from "@/server/auth/permissions";
import type { SessionUser, UserRole } from "@/server/domain/types";

const roles: UserRole[] = ["customer", "producer_admin", "staff", "platform_admin"];

export async function getCurrentUser(request?: Request): Promise<SessionUser> {
  const requestedRole = request?.headers.get("x-demo-role") as UserRole | null;

  if (requestedRole && roles.includes(requestedRole)) {
    return demoUsers[requestedRole];
  }

  return demoUsers.customer;
}

export async function requireUser(request?: Request): Promise<SessionUser> {
  const user = await getCurrentUser(request);

  if (!user) {
    throw new ApiError("AUTH_REQUIRED", "Authentifizierung erforderlich.", 401);
  }

  return user;
}
