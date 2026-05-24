import type { NotificationChannel, NotificationType, OrderEvent } from "@/server/domain/types";
import { createEmailProvider } from "@/server/providers/EmailProvider";
import { createWhatsAppProvider } from "@/server/providers/WhatsAppProvider";

export type NotificationCustomer = {
  id: string;
  email: string;
  phoneNumber?: string | null;
  whatsappOptIn: boolean;
};

export type NotificationPlan = {
  channel: NotificationChannel;
  type: NotificationType;
  templateKey: string;
  recipient: string;
  scheduledAt?: Date;
};

const eventToNotificationType: Record<OrderEvent["type"], NotificationType> = {
  "order.confirmed": "order_confirmed",
  "payment.succeeded": "payment_confirmed",
  "pickup.reminder_due": "pickup_reminder",
  "order.ready_for_pickup": "order_ready",
  "order.changed": "order_changed",
  "order.picked_up": "picked_up",
  "order.cancelled": "order_cancelled",
};

export class NotificationService {
  constructor(
    private readonly whatsappProvider = createWhatsAppProvider(),
    private readonly emailProvider = createEmailProvider(),
  ) {}

  buildPlans(event: OrderEvent, customer: NotificationCustomer): NotificationPlan[] {
    const type = eventToNotificationType[event.type];
    const plans: NotificationPlan[] = [
      {
        channel: "email",
        type,
        templateKey: `email.${type}.v1`,
        recipient: customer.email,
      },
    ];

    if (this.canSendWhatsApp(customer)) {
      plans.push({
        channel: "whatsapp",
        type,
        templateKey: `whatsapp.${type}.v1`,
        recipient: customer.phoneNumber ?? "",
      });
    }

    return plans;
  }

  canSendWhatsApp(customer: NotificationCustomer) {
    return Boolean(customer.whatsappOptIn && customer.phoneNumber);
  }

  async send(plan: NotificationPlan) {
    if (plan.channel === "whatsapp") {
      return this.whatsappProvider.sendTemplate({
        to: plan.recipient,
        templateKey: plan.templateKey,
        variables: {},
      });
    }

    return this.emailProvider.send({
      to: plan.recipient,
      subject: "Spargelstand Bestellung",
      templateKey: plan.templateKey,
      variables: {},
    });
  }
}

export const notificationService = new NotificationService();
