import {
  InventoryStatus,
  ProducerStatus,
  StandStatus,
  UserRole,
} from "@prisma/client";

import { prisma } from "../src/server/db/prisma";
import { PaymentRepository } from "../src/server/repositories/PaymentRepository";
import { ReservationService } from "../src/server/services/ReservationService";
import type { SessionUser } from "../src/server/domain/types";

const producerId = "producer_smoke";
const standId = "stand_smoke";
const productId = "prod_smoke_spargel";
const inventoryId = "inv_smoke_spargel";
const customerId = "user_smoke_customer";
const staffId = "user_smoke_staff";
const providerPaymentId = `pi_smoke_${Date.now()}`;
const providerEventId = `evt_smoke_${Date.now()}`;

const customer: SessionUser = {
  id: customerId,
  role: "customer",
};

const staff: SessionUser = {
  id: staffId,
  role: "staff",
  producerId,
  standIds: [standId],
};

function assertLocalDatabase() {
  const databaseUrl =
    process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/spargelstand_app?schema=public";

  if (process.env.ALLOW_NON_LOCAL_SMOKE_DB === "1") {
    return;
  }

  if (!databaseUrl.includes("localhost") && !databaseUrl.includes("127.0.0.1")) {
    throw new Error("smoke:p0 verweigert nicht-lokale DATABASE_URL ohne ALLOW_NON_LOCAL_SMOKE_DB=1.");
  }
}

async function assertDatabaseReachable() {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    throw new Error(
      "Lokale PostgreSQL-Datenbank ist nicht erreichbar. Starte `npm run db:up` oder stelle die DATABASE_URL aus .env.example manuell bereit, dann `npm run prisma:migrate`, `npm run prisma:seed` und erneut `npm run smoke:p0` ausfuehren.",
    );
  }
}

async function ensureSmokeData() {
  const producer = await prisma.producer.upsert({
    where: { id: producerId },
    create: {
      id: producerId,
      name: "Smoke Hof",
      legalName: "Smoke Hof Demo GmbH",
      billingEmail: "smoke-billing@example.local",
      status: ProducerStatus.ACTIVE,
      serviceFeeConfig: { flatFeeCents: 99 },
    },
    update: {
      status: ProducerStatus.ACTIVE,
    },
  });

  await prisma.user.upsert({
    where: { id: customerId },
    create: {
      id: customerId,
      name: "Smoke Kunde",
      email: "smoke-customer@example.local",
      role: UserRole.CUSTOMER,
    },
    update: {
      active: true,
      role: UserRole.CUSTOMER,
    },
  });

  await prisma.user.upsert({
    where: { id: staffId },
    create: {
      id: staffId,
      name: "Smoke Staff",
      email: "smoke-staff@example.local",
      role: UserRole.STAFF,
      producerId: producer.id,
    },
    update: {
      active: true,
      role: UserRole.STAFF,
      producerId: producer.id,
    },
  });

  await prisma.stand.upsert({
    where: { id: standId },
    create: {
      id: standId,
      producerId: producer.id,
      name: "Smoke Stand",
      addressLine: "Smoke Weg 1",
      postalCode: "68163",
      city: "Mannheim",
      latitude: "49.4875000",
      longitude: "8.4660000",
      openingHours: { monday: "08:00-18:00" },
      status: StandStatus.OPEN,
      publicNote: "Lokaler Smoke-Test-Stand.",
    },
    update: {
      status: StandStatus.OPEN,
    },
  });

  await prisma.staffStandAssignment.upsert({
    where: {
      userId_standId: {
        userId: staffId,
        standId,
      },
    },
    create: {
      userId: staffId,
      standId,
    },
    update: {},
  });

  await prisma.product.upsert({
    where: { id: productId },
    create: {
      id: productId,
      producerId: producer.id,
      name: "Smoke Spargel",
      category: "Spargel",
      unit: "kg",
      priceCents: 1200,
      currency: "EUR",
      active: true,
    },
    update: {
      active: true,
      priceCents: 1200,
    },
  });

  await prisma.inventory.upsert({
    where: {
      standId_productId: {
        standId,
        productId,
      },
    },
    create: {
      id: inventoryId,
      standId,
      productId,
      stockQuantity: "5",
      reservedQuantity: "0",
      safetyBuffer: "1",
      lowStockThreshold: "2",
      status: InventoryStatus.AVAILABLE,
    },
    update: {
      stockQuantity: "5",
      reservedQuantity: "0",
      safetyBuffer: "1",
      lowStockThreshold: "2",
      status: InventoryStatus.AVAILABLE,
    },
  });
}

async function runSmoke() {
  assertLocalDatabase();
  await assertDatabaseReachable();
  await ensureSmokeData();

  const reservationService = new ReservationService(prisma);
  const paymentRepository = new PaymentRepository(prisma);
  const pickupSlotStart = new Date(Date.now() + 1000 * 60 * 45);
  const pickupSlotEnd = new Date(Date.now() + 1000 * 60 * 75);

  const reservation = await reservationService.createReservation({
    user: customer,
    standId,
    pickupSlotStart: pickupSlotStart.toISOString(),
    pickupSlotEnd: pickupSlotEnd.toISOString(),
    items: [{ productId, quantity: 1 }],
  });

  const paymentContext = await paymentRepository.getOrderForPaymentIntent(reservation.id, customer);
  await paymentRepository.ensurePendingPayment(paymentContext);
  await paymentRepository.recordPaymentIntentCreated(paymentContext, providerPaymentId);
  await paymentRepository.processStripePaymentEvent({
    provider: "stripe",
    providerEventId,
    providerPaymentId,
    status: "succeeded",
    orderId: reservation.id,
    rawType: "payment_intent.succeeded",
    handled: true,
  });

  const qr = await reservationService.getOrderQr(reservation.id);
  const qrUrl = new URL(qr.qrLink);
  const token = qrUrl.searchParams.get("token");

  if (!token) {
    throw new Error("Smoke QR-Link enthaelt keinen Token.");
  }

  await reservationService.scanOrderToken({ standId, token });
  const pickedUp = await reservationService.confirmPickup(reservation.id, {
    user: staff,
    standId,
    token,
  });

  const inventory = await prisma.inventory.findUniqueOrThrow({
    where: { id: inventoryId },
  });

  if (pickedUp.status !== "picked_up") {
    throw new Error(`Unerwarteter Orderstatus nach Pickup: ${pickedUp.status}`);
  }

  if (Number(inventory.stockQuantity) !== 4 || Number(inventory.reservedQuantity) !== 0) {
    throw new Error(
      `Unerwarteter Bestand nach Pickup: stock=${inventory.stockQuantity}, reserved=${inventory.reservedQuantity}`,
    );
  }

  console.log(
    JSON.stringify(
      {
        status: "ok",
        orderId: pickedUp.id,
        orderNumber: pickedUp.orderNumber,
        orderStatus: pickedUp.status,
        paymentStatus: pickedUp.paymentStatus,
        qrTokenHashPreview: qr.tokenHashPreview,
        inventory: {
          stockQuantity: Number(inventory.stockQuantity),
          reservedQuantity: Number(inventory.reservedQuantity),
        },
      },
      null,
      2,
    ),
  );
}

runSmoke()
  .catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`smoke:p0 failed: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
