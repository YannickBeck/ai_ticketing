import { jsonCreated, jsonOk, parseJson, skeleton } from "@/server/api/http";
import { requireRole } from "@/server/auth/permissions";
import { requireUser } from "@/server/auth/requireUser";
import { mockNotifications, mockOrders, mockStands } from "@/server/db/mockData";
import { inventoryUpdateSchema } from "@/server/domain/schemas";
import { deliveryPlanningService } from "@/server/services/DeliveryPlanningService";
import { inventoryMutationService } from "@/server/services/InventoryMutationService";
import { productService } from "@/server/services/ProductService";

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
  const body = await parseJson(request);

  return jsonCreated({
    status: "skeleton",
    resource: "stand",
    body,
    implementationNote: "Naechster Schritt: Zod-Schema und Prisma Stand.create.",
  });
}

export async function handlePatchStand(request: Request, standId: string) {
  const user = await requireUser(request);
  requireRole(user, ["producer_admin", "platform_admin"]);
  const body = await parseJson(request);

  return jsonOk({ status: "skeleton", standId, body });
}

export async function handleCreateProduct(request: Request) {
  const user = await requireUser(request);
  requireRole(user, ["producer_admin", "platform_admin"]);
  const body = await parseJson(request);

  return jsonCreated({ status: "skeleton", resource: "product", body });
}

export async function handlePatchProduct(request: Request, productId: string) {
  const user = await requireUser(request);
  requireRole(user, ["producer_admin", "platform_admin"]);
  const body = await parseJson(request);

  return jsonOk({ status: "skeleton", productId, body });
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
  return jsonOk(mockStands);
}

export async function handleAdminProductList(request: Request) {
  const user = await requireUser(request);
  requireRole(user, ["producer_admin", "platform_admin"]);
  return jsonOk(await productService.listProducerProducts(user.producerId ?? "producer_sonnenhof"));
}
