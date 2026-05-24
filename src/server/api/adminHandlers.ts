import { ApiError, jsonCreated, jsonOk, parseJson, skeleton } from "@/server/api/http";
import { requireRole } from "@/server/auth/permissions";
import { requireUser } from "@/server/auth/requireUser";
import { mockNotifications, mockOrders } from "@/server/db/mockData";
import {
  adminProductCreateSchema,
  adminProductPatchSchema,
  adminStandCreateSchema,
  adminStandPatchSchema,
  inventoryUpdateSchema,
} from "@/server/domain/schemas";
import { deliveryPlanningService } from "@/server/services/DeliveryPlanningService";
import { inventoryMutationService } from "@/server/services/InventoryMutationService";
import { productService } from "@/server/services/ProductService";
import { standService } from "@/server/services/StandService";

export async function handleAdminDashboard(request: Request) {
  const user = await requireUser(request);
  requireRole(user, ["producer_admin", "platform_admin"]);

  return jsonOk({
    reservationsToday: mockOrders.length,
    openPickups: mockOrders.filter((order) => order.status === "confirmed" || order.status === "ready_for_pickup").length,
    criticalInventory: 1,
    failedNotifications: mockNotifications.filter((notification) => notification.status === "failed").length,
    scope: user.producerId ?? "platform",
  });
}

export async function handleCreateStand(request: Request) {
  const user = await requireUser(request);
  requireRole(user, ["producer_admin", "platform_admin"]);
  const input = adminStandCreateSchema.parse(await parseJson(request));

  return jsonCreated(await standService.createStand(user, input));
}

export async function handleAdminGetStand(request: Request, standId: string) {
  const user = await requireUser(request);
  requireRole(user, ["producer_admin", "platform_admin"]);
  return jsonOk(await standService.getAdminStand(user, standId));
}

export async function handlePatchStand(request: Request, standId: string) {
  const user = await requireUser(request);
  requireRole(user, ["producer_admin", "platform_admin"]);
  const input = adminStandPatchSchema.parse(await parseJson(request));

  return jsonOk(await standService.patchStand(user, standId, input));
}

export async function handleCreateProduct(request: Request) {
  const user = await requireUser(request);
  requireRole(user, ["producer_admin", "platform_admin"]);
  const input = adminProductCreateSchema.parse(await parseJson(request));

  return jsonCreated(await productService.createProduct(user, input));
}

export async function handleAdminGetProduct(request: Request, productId: string) {
  const user = await requireUser(request);
  requireRole(user, ["producer_admin", "platform_admin"]);
  const product = await productService.getProduct(productId);

  if (user.role !== "platform_admin" && product.producerId !== user.producerId) {
    throw new ApiError("FORBIDDEN", "Produkt ist nicht im erlaubten Produzenten-Scope.", 403, {
      productId,
    });
  }

  return jsonOk(product);
}

export async function handlePatchProduct(request: Request, productId: string) {
  const user = await requireUser(request);
  requireRole(user, ["producer_admin", "platform_admin"]);
  const input = adminProductPatchSchema.parse(await parseJson(request));

  return jsonOk(await productService.patchProduct(user, productId, input));
}

export async function handlePatchInventory(request: Request, standId: string, productId: string) {
  const user = await requireUser(request);
  requireRole(user, ["producer_admin", "platform_admin"]);
  const input = inventoryUpdateSchema.parse(await parseJson(request));

  return jsonOk(await inventoryMutationService.updateInventory({
    user,
    standId,
    productId,
    ...input,
  }));
}

export async function handleAdminOrders(request: Request) {
  const user = await requireUser(request);
  requireRole(user, ["producer_admin", "platform_admin"]);
  const url = new URL(request.url);

  return jsonOk({
    filters: Object.fromEntries(url.searchParams.entries()),
    items: mockOrders,
  });
}

export async function handleAdminOrderNotifications(request: Request, orderId: string) {
  const user = await requireUser(request);
  requireRole(user, ["producer_admin", "platform_admin"]);
  return jsonOk(mockNotifications.filter((notification) => notification.orderId === orderId));
}

export async function handleAdminNotifyOrder(request: Request, orderId: string) {
  const user = await requireUser(request);
  requireRole(user, ["producer_admin", "platform_admin"]);
  const body = await parseJson(request);

  return jsonCreated({
    orderId,
    status: "notification_pending",
    body,
    implementationNote: "Nur freigegebene Templates fuer Lieferverzoegerung oder Statusaenderung zulassen.",
  });
}

export async function handleAdminNotifications(request: Request) {
  const user = await requireUser(request);
  requireRole(user, ["producer_admin", "platform_admin"]);
  return jsonOk(mockNotifications);
}

export async function handleAdminFailedNotifications(request: Request) {
  const user = await requireUser(request);
  requireRole(user, ["producer_admin", "platform_admin"]);
  return jsonOk(mockNotifications.filter((notification) => notification.status === "failed"));
}

export async function handleDemandAnalytics(request: Request) {
  const user = await requireUser(request);
  requireRole(user, ["producer_admin", "platform_admin"]);
  return skeleton("admin.analytics.demand", { producerId: user.producerId ?? "platform" });
}

export async function handleDeliverySuggestions(request: Request) {
  const user = await requireUser(request);
  requireRole(user, ["producer_admin", "platform_admin"]);
  return jsonOk(await deliveryPlanningService.getSuggestions());
}

export async function handleCreateStaff(request: Request) {
  const user = await requireUser(request);
  requireRole(user, ["producer_admin", "platform_admin"]);
  const body = await parseJson(request);

  return jsonCreated({
    status: "skeleton",
    resource: "staff",
    body,
    implementationNote: "Naechster Schritt: User mit Rolle staff und StaffStandAssignment anlegen.",
  });
}

export async function handleAdminStandList(request: Request) {
  const user = await requireUser(request);
  requireRole(user, ["producer_admin", "platform_admin"]);
  return jsonOk(await standService.listAdminStands(user.role === "platform_admin" ? undefined : user.producerId));
}

export async function handleAdminProductList(request: Request) {
  const user = await requireUser(request);
  requireRole(user, ["producer_admin", "platform_admin"]);
  return jsonOk(await productService.listProducerProducts(user.role === "platform_admin" ? undefined : user.producerId));
}
