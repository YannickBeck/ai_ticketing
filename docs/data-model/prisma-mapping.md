# Prisma Mapping

## Grundregeln

| Thema | Umsetzung |
| --- | --- |
| IDs | `String @id @default(uuid())` |
| Geld | Integer in Cent |
| Mengen | `Decimal` |
| Status | Prisma Enums |
| Geo | Lat/Lng im MVP, PostGIS später per SQL-Migration |
| QRToken | Nur Hash und Nonce speichern, Klartext nie persistieren |
| WhatsApp | Telefonnummer minimieren, Opt-in-Zeitpunkt speichern |

## Prisma 7 Config

Die Datasource-URL liegt fuer CLI-Kommandos in `prisma.config.ts`, nicht im `datasource`-Block der Schema-Datei. Der Runtime-Client in `src/server/db/prisma.ts` nutzt wegen Prisma 7 explizit `@prisma/adapter-pg`; lokale Defaults koennen durch `DATABASE_URL` überschrieben werden.

## Kritische Constraints

| Constraint | Zweck |
| --- | --- |
| `User.email` unique | Login und Identität |
| `Order.order_number` unique | Fallback-Code |
| `Inventory(stand_id, product_id)` unique | Eine Bestandszeile je Stand/Produkt |
| `Payment.provider_event_id` optional unique | Letzte angewendete Provider-Referenz |
| `PaymentEvent.provider_event_id` unique | Webhook-Idempotenz und Audit Trail |
| `Notification.provider_message_id` optional unique | Provider-Status idempotent zuordnen |
| `NotificationPreference(user_id, channel)` unique | Eine Präferenz je Kanal |

## Kritische Indizes

`producer_id`, `stand_id`, `status`, `pickup_slot_start`, `created_at`, `Notification(order_id, channel, status)`, `Notification(scheduled_at)`.
