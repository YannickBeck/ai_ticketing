import { ApiError, jsonCreated, jsonOk, parseJson, skeleton } from "@/server/api/http";
import { requireRole } from "@/server/auth/permissions";
import { requireUser } from "@/server/auth/requireUser";
import {
  adminNotificationFiltersSchema,
  adminNotifyOrderSchema,
  adminOrderFiltersSchema,
  adminProductCreateSchema,
  adminProductPatchSchema,
  adminStaffCreateSchema,
  adminStandCreateSchema,
  adminStandPatchSchema,
  inventoryUpdateSchema,
} from "@/server/domain/schemas";
import { prisma } from "@/server/db/prisma";
import { adminQueryService } from "@/server/services/AdminQueryService";
import { deliveryPlanningService } from "@/server/services/DeliveryPlanningService";
import { inventoryMutationService } from "@/server/services/InventoryMutationService";
import { productService } from "@/server/services/ProductService";
import { standService } from "@/server/services/StandService";

export async function handleAdminDashboard(request: Request) {
  const user = await requireUser(request);
  requireRole(user, ["producer_admin", "platform_admin"]);

  return jsonOk(await adminQueryService.getDashboard(user));
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
  const filters = adminOrderFiltersSchema.parse(Object.fromEntries(url.searchParams.entries()));

  return jsonOk({
    filters,
    items: await adminQueryService.listOrders(user, filters),
  });
}

export async function handleAdminOrderNotifications(request: Request, orderId: string) {
  const user = await requireUser(request);
  requireRole(user, ["producer_admin", "platform_admin"]);
  return jsonOk(await adminQueryService.listNotifications(user, { orderId }));
}

export async function handleAdminNotifyOrder(request: Request, orderId: string) {
  const user = await requireUser(request);
  requireRole(user, ["producer_admin", "platform_admin"]);
  const input = adminNotifyOrderSchema.parse(await parseJson(request));

  return jsonCreated(await adminQueryService.queueOrderNotification(user, orderId, input));
}

export async function handleAdminNotifications(request: Request) {
  const user = await requireUser(request);
  requireRole(user, ["producer_admin", "platform_admin"]);
  const url = new URL(request.url);
  const filters = adminNotificationFiltersSchema.parse(Object.fromEntries(url.searchParams.entries()));

  return jsonOk(await adminQueryService.listNotifications(user, filters));
}

export async function handleAdminFailedNotifications(request: Request) {
  const user = await requireUser(request);
  requireRole(user, ["producer_admin", "platform_admin"]);
  return jsonOk(await adminQueryService.listNotifications(user, { status: "failed" }));
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
  const input = adminStaffCreateSchema.parse(await parseJson(request));

  const stand = await prisma.stand.findUnique({
    where: { id: input.standId },
    select: { id: true, producerId: true },
  });

  if (!stand) {
    throw new ApiError("NOT_FOUND", "Stand nicht gefunden.", 404);
  }

  if (user.role !== "platform_admin" && stand.producerId !== user.producerId) {
    throw new ApiError("FORBIDDEN", "Stand liegt nicht im eigenen Produzenten-Scope.", 403);
  }

  const existing = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true, role: true },
  });

  const staffUser = await prisma.$transaction(async (tx) => {
    const newUser = existing
      ? await tx.user.update({
          where: { id: existing.id },
          data: { role: "STAFF", producerId: stand.producerId },
        })
      : await tx.user.create({
          data: {
            email: input.email,
            name: input.name,
            role: "STAFF",
            producerId: stand.producerId,
          },
        });

    await tx.staffStandAssignment.upsert({
      where: { userId_standId: { userId: newUser.id, standId: input.standId } },
      create: { userId: newUser.id, standId: input.standId },
      update: {},
    });

    return newUser;
  });

  return jsonCreated({
    id: staffUser.id,
    email: staffUser.email,
    name: staffUser.name,
    role: staffUser.role,
    standId: input.standId,
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
