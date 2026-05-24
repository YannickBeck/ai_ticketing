import {
  NotificationChannel,
  NotificationStatus,
  NotificationType,
  OrderStatus,
} from "@prisma/client";

import { prisma } from "@/server/db/prisma";

export async function sendPickupRemindersJob(now = new Date()) {
  const reminderWindowEnd = new Date(now.getTime() + 30 * 60 * 1000);
  const orders = await prisma.order.findMany({
    where: {
      status: {
        in: [OrderStatus.CONFIRMED, OrderStatus.READY_FOR_PICKUP],
      },
      pickupSlotStart: {
        gte: now,
        lte: reminderWindowEnd,
      },
    },
    include: {
      customer: true,
      notifications: {
        where: {
          type: NotificationType.PICKUP_REMINDER,
          channel: NotificationChannel.EMAIL,
        },
      },
    },
  });

  let createdCount = 0;

  for (const order of orders) {
    if (order.notifications.length > 0) {
      continue;
    }

    await prisma.notification.create({
      data: {
        userId: order.customerId,
        orderId: order.id,
        channel: NotificationChannel.EMAIL,
        type: NotificationType.PICKUP_REMINDER,
        templateKey: "email.pickup_reminder.v1",
        recipient: order.customer.email,
        status: NotificationStatus.PENDING,
        provider: "email",
        scheduledAt: now,
      },
    });
    createdCount += 1;
  }

  return {
    status: "completed",
    cadence: "every 5-15 minutes",
    responsibility: "faellige Abholerinnerungen als Notification anlegen und optional versenden",
    scannedCount: orders.length,
    createdCount,
  };
}
