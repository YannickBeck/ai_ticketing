import {
  InventoryStatus,
  OrderStatus,
  PaymentProvider,
  PaymentStatus,
  ProducerStatus,
  QRTokenType,
  StandStatus,
  UserRole,
} from "@prisma/client";

import { prisma } from "../src/server/db/prisma";

async function main() {
  const producer = await prisma.producer.upsert({
    where: { id: "producer_sonnenhof" },
    create: {
      id: "producer_sonnenhof",
      name: "Sonnenhof",
      legalName: "Sonnenhof Demo GmbH",
      billingEmail: "billing@example.local",
      paymentAccountId: process.env.STRIPE_CONNECTED_ACCOUNT_ID || null,
      status: ProducerStatus.ACTIVE,
      serviceFeeConfig: { flatFeeCents: 99 },
    },
    update: {
      paymentAccountId: process.env.STRIPE_CONNECTED_ACCOUNT_ID || null,
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "kunde@example.local" },
    create: {
      id: "user_customer_demo",
      name: "Demo Kunde",
      email: "kunde@example.local",
      role: UserRole.CUSTOMER,
      whatsappOptIn: false,
    },
    update: {},
  });

  await prisma.user.upsert({
    where: { email: "admin@example.local" },
    create: {
      id: "user_admin_demo",
      name: "Demo Admin",
      email: "admin@example.local",
      role: UserRole.PRODUCER_ADMIN,
      producerId: producer.id,
    },
    update: {
      producerId: producer.id,
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: "staff@example.local" },
    create: {
      id: "user_staff_demo",
      name: "Demo Staff",
      email: "staff@example.local",
      role: UserRole.STAFF,
      producerId: producer.id,
    },
    update: {
      producerId: producer.id,
    },
  });

  const stand = await prisma.stand.upsert({
    where: { id: "stand_mannheim_ost" },
    create: {
      id: "stand_mannheim_ost",
      producerId: producer.id,
      name: "Sonnenhof Mannheim Ost",
      addressLine: "Beispielstrasse 12",
      postalCode: "68163",
      city: "Mannheim",
      latitude: "49.4875000",
      longitude: "8.4660000",
      openingHours: { monday: "08:00-18:00", saturday: "08:00-14:00" },
      status: StandStatus.OPEN,
      publicNote: "Heute frischer Spargel und Erdbeeren.",
    },
    update: {},
  });

  await prisma.staffStandAssignment.upsert({
    where: {
      userId_standId: {
        userId: staff.id,
        standId: stand.id,
      },
    },
    create: {
      userId: staff.id,
      standId: stand.id,
    },
    update: {},
  });

  const product = await prisma.product.upsert({
    where: { id: "prod_spargel_klasse_1" },
    create: {
      id: "prod_spargel_klasse_1",
      producerId: producer.id,
      name: "Spargel Klasse I",
      category: "Spargel",
      unit: "kg",
      priceCents: 1200,
      currency: "EUR",
      active: true,
    },
    update: {},
  });

  const inventory = await prisma.inventory.upsert({
    where: {
      standId_productId: {
        standId: stand.id,
        productId: product.id,
      },
    },
    create: {
      id: "inv_mannheim_spargel",
      standId: stand.id,
      productId: product.id,
      stockQuantity: "30",
      reservedQuantity: "2",
      safetyBuffer: "3",
      lowStockThreshold: "5",
      status: InventoryStatus.AVAILABLE,
    },
    update: {
      stockQuantity: "30",
      reservedQuantity: "2",
      safetyBuffer: "3",
      lowStockThreshold: "5",
      status: InventoryStatus.AVAILABLE,
    },
  });

  const pickupStart = new Date(Date.now() + 1000 * 60 * 45);
  const pickupEnd = new Date(Date.now() + 1000 * 60 * 75);

  const order = await prisma.order.upsert({
    where: { orderNumber: "A7K4Q2" },
    create: {
      id: "order_demo_1",
      orderNumber: "A7K4Q2",
      customerId: customer.id,
      producerId: producer.id,
      standId: stand.id,
      pickupSlotStart: pickupStart,
      pickupSlotEnd: pickupEnd,
      status: OrderStatus.PENDING_PAYMENT,
      productTotalCents: 2400,
      serviceFeeCents: 99,
      totalAmountCents: 2499,
      currency: "EUR",
      expiresAt: new Date(Date.now() + 1000 * 60 * 10),
    },
    update: {
      status: OrderStatus.PENDING_PAYMENT,
      pickupSlotStart: pickupStart,
      pickupSlotEnd: pickupEnd,
      expiresAt: new Date(Date.now() + 1000 * 60 * 10),
    },
  });

  await prisma.orderItem.upsert({
    where: { id: "order_item_demo_1" },
    create: {
      id: "order_item_demo_1",
      orderId: order.id,
      productId: product.id,
      standProductId: inventory.id,
      quantity: "2",
      unit: "kg",
      unitPriceCents: 1200,
      totalPriceCents: 2400,
    },
    update: {
      quantity: "2",
      totalPriceCents: 2400,
    },
  });

  await prisma.paymentEvent.deleteMany({
    where: { orderId: order.id },
  });

  await prisma.qRToken.deleteMany({
    where: {
      type: QRTokenType.ORDER,
      referenceId: order.id,
    },
  });

  await prisma.payment.upsert({
    where: { orderId: order.id },
    create: {
      orderId: order.id,
      provider: PaymentProvider.STRIPE,
      status: PaymentStatus.PENDING,
      amountTotalCents: 2499,
      productAmountCents: 2400,
      serviceFeeCents: 99,
    },
    update: {
      providerPaymentId: null,
      providerEventId: null,
      status: PaymentStatus.PENDING,
      amountTotalCents: 2499,
      productAmountCents: 2400,
      serviceFeeCents: 99,
      providerFeeCents: null,
      payoutStatus: null,
      refundedAmountCents: 0,
    },
  });
}

main()
  .catch(async (error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
