# Data Model Entities

| Entity | Zweck |
| --- | --- |
| User | Authentifizierter Nutzer mit Rolle und Notification-Präferenzen |
| Producer | Landwirtschaftlicher Betrieb |
| Stand | Physischer Verkaufsstand mit Standort und Öffnungsdaten |
| Product | Produkt des Produzenten |
| Inventory | Bestand je Stand und Produkt |
| Order | Reservierung und Bestellung |
| OrderItem | Position einer Bestellung |
| Payment | Zahlungsstatus und Provider-Referenzen |
| PaymentEvent | Idempotentes Provider-Event-Log für Webhooks |
| QRToken | Signierter, gehashter Abhol- oder Standtoken |
| InventoryEvent | Auditierbare Bestandsänderung |
| Notification | Versandauftrag und Versandstatus |
| NotificationPreference | Kanalpräferenz pro Nutzer |
| PickupSlot | Buchbares Abholzeitfenster |
| DeliveryPlan | Regelbasierte Lieferplanung |
| StaffStandAssignment | Staff-Zuordnung zu Ständen |

## Statuswerte

| Entity | Werte |
| --- | --- |
| Order | `draft`, `pending_payment`, `confirmed`, `ready_for_pickup`, `picked_up`, `cancelled`, `expired`, `refunded` |
| Payment | `pending`, `succeeded`, `failed`, `refunded` |
| Inventory | `available`, `low_stock`, `out_of_stock`, `next_delivery_expected` |
| QRToken | `active`, `used`, `expired`, `revoked` |
| Notification | `pending`, `sent`, `delivered`, `failed`, `cancelled` |
