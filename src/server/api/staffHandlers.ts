import { ApiError, jsonOk, parseJson } from "@/server/api/http";
import { requireRole, requireStandScope } from "@/server/auth/permissions";
import { requireUser } from "@/server/auth/requireUser";
import {
  pickupConfirmSchema,
  staffDeliverySchema,
  staffInventoryUpdateSchema,
  staffOutOfStockSchema,
  staffScanSchema,
} from "@/server/domain/schemas";
import { inventoryMutationService } from "@/server/services/InventoryMutationService";
import { reservationService } from "@/server/services/ReservationService";

export async function handleStaffOrders(request: Request) {
  const user = await requireUser(request);
  requireRole(user, ["staff", "platform_admin"]);
  const url = new URL(request.url);
  const standId = url.searchParams.get("standId") ?? user.standIds?.[0];
  if (!standId) {
    throw new ApiError("FORBIDDEN", "Kein Stand zugewiesen.", 403);
  }
  requireStandScope(user, standId);

  return jsonOk(await reservationService.listStaffOrders(standId));
}

export async function handleStaffScan(request: Request) {
  const user = await requireUser(request);
  requireRole(user, ["staff", "platform_admin"]);
  const input = staffScanSchema.parse(await parseJson(request));
  requireStandScope(user, input.standId);

  return jsonOk(await reservationService.scanOrderToken(input));
}

export async function handleStaffPickup(request: Request, orderId: string) {
  const user = await requireUser(request);
  requireRole(user, ["staff", "platform_admin"]);
  const input = pickupConfirmSchema.parse(await parseJson(request));
  requireStandScope(user, input.standId);

  return jsonOk(await reservationService.confirmPickup(orderId, { user, ...input }));
}

export async function handleStaffInventory(request: Request) {
  const user = await requireUser(request);
  requireRole(user, ["staff", "platform_admin"]);
  const input = staffInventoryUpdateSchema.parse(await parseJson(request));
  requireStandScope(user, input.standId);

  return jsonOk(await inventoryMutationService.updateInventory({
    user,
    standId: input.standId,
    productId: input.productId,
    stockQuantity: input.stockQuantity,
    quantityDelta: input.quantityDelta,
    safetyBuffer: input.safetyBuffer,
    lowStockThreshold: input.lowStockThreshold,
    nextDeliveryAt: input.nextDeliveryAt,
    note: input.note,
  }));
}

export async function handleStaffOutOfStock(request: Request, productId: string) {
  const user = await requireUser(request);
  requireRole(user, ["staff", "platform_admin"]);
  const input = staffOutOfStockSchema.parse(await parseJson(request));
  requireStandScope(user, input.standId);

  return jsonOk(await inventoryMutationService.markOutOfStock({
    user,
    standId: input.standId,
    productId,
    note: input.note,
    nextDeliveryAt: input.nextDeliveryAt,
  }));
}

export async function handleStaffDelivery(request: Request) {
  const user = await requireUser(request);
  requireRole(user, ["staff", "platform_admin"]);
  const input = staffDeliverySchema.parse(await parseJson(request));
  requireStandScope(user, input.standId);

  return jsonOk(await inventoryMutationService.recordDelivery({ user, ...input }));
}
