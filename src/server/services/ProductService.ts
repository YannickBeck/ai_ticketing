import { type Prisma, type PrismaClient } from "@prisma/client";

import { ApiError } from "@/server/api/http";
import { requireProducerScope } from "@/server/auth/permissions";
import { prisma } from "@/server/db/prisma";
import type { SessionUser } from "@/server/domain/types";

type ProductCreateInput = {
  producerId?: string;
  name: string;
  category: string;
  unit: string;
  priceCents: number;
  currency: "EUR";
  active: boolean;
  description?: string | null;
};

type ProductPatchInput = Partial<Omit<ProductCreateInput, "producerId">>;

export class ProductService {
  constructor(private readonly db: PrismaClient = prisma) {}

  async listProducerProducts(producerId?: string) {
    const products = await this.db.product.findMany({
      where: producerId ? { producerId } : undefined,
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    return products.map((product) => this.toProductDto(product));
  }

  async getProduct(productId: string) {
    const product = await this.db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new ApiError("NOT_FOUND", "Produkt wurde nicht gefunden.", 404);
    }

    return this.toProductDto(product);
  }

  async createProduct(user: SessionUser, input: ProductCreateInput) {
    const producerId = this.resolveWritableProducerId(user, input.producerId);

    const product = await this.db.product.create({
      data: {
        producerId,
        name: input.name,
        category: input.category,
        unit: input.unit,
        priceCents: input.priceCents,
        currency: input.currency,
        active: input.active,
        description: input.description ?? null,
      },
    });

    return this.toProductDto(product);
  }

  async patchProduct(user: SessionUser, productId: string, input: ProductPatchInput) {
    const existing = await this.db.product.findUnique({
      where: { id: productId },
    });

    if (!existing) {
      throw new ApiError("NOT_FOUND", "Produkt wurde nicht gefunden.", 404);
    }

    requireProducerScope(user, existing.producerId);

    const data: Prisma.ProductUpdateInput = {};

    if (input.name !== undefined) data.name = input.name;
    if (input.category !== undefined) data.category = input.category;
    if (input.unit !== undefined) data.unit = input.unit;
    if (input.priceCents !== undefined) data.priceCents = input.priceCents;
    if (input.currency !== undefined) data.currency = input.currency;
    if (input.active !== undefined) data.active = input.active;
    if (input.description !== undefined) data.description = input.description;

    const product = await this.db.product.update({
      where: { id: productId },
      data,
    });

    return this.toProductDto(product);
  }

  private resolveWritableProducerId(user: SessionUser, requestedProducerId?: string) {
    if (user.role === "platform_admin") {
      if (!requestedProducerId) {
        throw new ApiError("VALIDATION_ERROR", "producerId ist fuer Plattformadmins erforderlich.", 400);
      }

      return requestedProducerId;
    }

    if (!user.producerId) {
      throw new ApiError("FORBIDDEN", "Produzenten-Scope fehlt.", 403);
    }

    if (requestedProducerId && requestedProducerId !== user.producerId) {
      throw new ApiError("FORBIDDEN", "Produkt darf nur im eigenen Produzenten-Scope angelegt werden.", 403);
    }

    return user.producerId;
  }

  private toProductDto(product: {
    id: string;
    producerId: string;
    name: string;
    category: string;
    unit: string;
    priceCents: number;
    currency: string;
    active: boolean;
    description: string | null;
  }) {
    return {
      id: product.id,
      producerId: product.producerId,
      name: product.name,
      category: product.category,
      unit: product.unit,
      priceCents: product.priceCents,
      currency: product.currency as "EUR",
      active: product.active,
      description: product.description,
    };
  }
}

export const productService = new ProductService();
