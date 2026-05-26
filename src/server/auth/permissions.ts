import { ApiError } from "@/server/api/http";
import type { SessionUser, UserRole } from "@/server/domain/types";

export function requireRole(user: SessionUser, allowed: UserRole[]) {
  if (!allowed.includes(user.role)) {
    throw new ApiError("FORBIDDEN", "Rolle ist fuer diese Aktion nicht berechtigt.", 403, {
      role: user.role,
      allowed,
    });
  }
}

export function requireProducerScope(user: SessionUser, producerId: string) {
  if (user.role === "platform_admin") {
    return;
  }

  if (user.producerId !== producerId) {
    throw new ApiError("FORBIDDEN", "Ressource gehoert nicht zum erlaubten Produzenten.", 403);
  }
}

export function requireStandScope(user: SessionUser, standId: string) {
  if (user.role === "platform_admin" || user.role === "producer_admin") {
    return;
  }

  if (!user.standIds?.includes(standId)) {
    throw new ApiError("FORBIDDEN", "Stand ist nicht dem Mitarbeiter zugeordnet.", 403);
  }
}

export function canReadOwnOrder(user: SessionUser, customerId: string) {
  return user.role === "platform_admin" || user.id === customerId;
}
