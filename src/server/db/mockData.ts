import type {
  InventorySnapshot,
  InventoryStatus,
  NotificationChannel,
  NotificationStatus,
  OrderStatus,
  StandStatus,
} from "@/server/domain/types";

export type MockStand = {
  id: string;
  producerId: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  status: StandStatus;
  distanceMeters: number;
  publicNote?: string;
};

export type MockProduct = {
  id: string;
  producerId: string;
  name: string;
  category: string;
  unit: string;
  priceCents: number;
  currency: "EUR";
  active: boolean;
};

export type MockInventory = InventorySnapshot & {
  id: string;
  standId: string;
  productId: string;
  status: InventoryStatus;
};

export type MockOrder = {
  id: string;
  orderNumber: string;
  customerId: string;
  producerId: string;
  standId: string;
  status: OrderStatus;
  pickupSlotStart: string;
  pickupSlotEnd: string;
  productTotalCents: number;
  serviceFeeCents: number;
  totalAmountCents: number;
  currency: "EUR";
};

export type MockProducer = {
  id: string;
  name: string;
  paymentAccountId?: string;
};

export type MockNotification = {
  id: string;
  userId: string;
  orderId: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  templateKey: string;
  createdAt: string;
};

export const mockStands: MockStand[] = [
  {
    id: "stand_mannheim_ost",
    producerId: "producer_sonnenhof",
    name: "Sonnenhof Mannheim Ost",
    address: "Beispielstrasse 12",
    city: "Mannheim",
    latitude: 49.4875,
    longitude: 8.466,
    status: "open",
    distanceMeters: 2400,
    publicNote: "Heute frischer Spargel und Erdbeeren.",
  },
  {
    id: "stand_ladenburg",
    producerId: "producer_sonnenhof",
    name: "Sonnenhof Ladenburg",
    address: "Hauptstrasse 7",
    city: "Ladenburg",
    latitude: 49.4732,
    longitude: 8.6087,
    status: "open",
    distanceMeters: 8200,
  },
];

export const mockProducers: MockProducer[] = [
  {
    id: "producer_sonnenhof",
    name: "Sonnenhof",
    paymentAccountId: process.env.STRIPE_CONNECTED_ACCOUNT_ID,
  },
];

export const mockProducts: MockProduct[] = [
  {
    id: "prod_spargel_klasse_1",
    producerId: "producer_sonnenhof",
    name: "Spargel Klasse I",
    category: "Spargel",
    unit: "kg",
    priceCents: 1200,
    currency: "EUR",
    active: true,
  },
  {
    id: "prod_erdbeeren_schale",
    producerId: "producer_sonnenhof",
    name: "Erdbeeren",
    category: "Erdbeeren",
    unit: "Schale",
    priceCents: 450,
    currency: "EUR",
    active: true,
  },
];

export const mockInventory: MockInventory[] = [
  {
    id: "inv_mannheim_spargel",
    standId: "stand_mannheim_ost",
    productId: "prod_spargel_klasse_1",
    stockQuantity: 30,
    reservedQuantity: 8,
    safetyBuffer: 3,
    lowStockThreshold: 5,
    status: "available",
    nextDeliveryAt: null,
  },
  {
    id: "inv_mannheim_erdbeeren",
    standId: "stand_mannheim_ost",
    productId: "prod_erdbeeren_schale",
    stockQuantity: 18,
    reservedQuantity: 12,
    safetyBuffer: 2,
    lowStockThreshold: 5,
    status: "low_stock",
    nextDeliveryAt: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString(),
  },
];

export const mockOrders: MockOrder[] = [
  {
    id: "order_demo_1",
    orderNumber: "A7K4Q2",
    customerId: "user_customer_demo",
    producerId: "producer_sonnenhof",
    standId: "stand_mannheim_ost",
    status: "confirmed",
    pickupSlotStart: new Date(Date.now() + 1000 * 60 * 45).toISOString(),
    pickupSlotEnd: new Date(Date.now() + 1000 * 60 * 75).toISOString(),
    productTotalCents: 2400,
    serviceFeeCents: 99,
    totalAmountCents: 2499,
    currency: "EUR",
  },
];

export const mockNotifications: MockNotification[] = [
  {
    id: "notification_demo_1",
    userId: "user_customer_demo",
    orderId: "order_demo_1",
    channel: "whatsapp",
    status: "sent",
    templateKey: "spargel_order_confirmed_v1",
    createdAt: new Date().toISOString(),
  },
];
