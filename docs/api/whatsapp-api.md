# WhatsApp And Notification API

WhatsApp ist P1/Pilot und optional. Bestellung, Zahlung und QR-Abholung funktionieren ohne WhatsApp.

| Methode | Endpoint | Zweck | Status |
| --- | --- | --- | --- |
| PATCH | `/api/v1/me/notification-preferences` | WhatsApp Opt-in/Opt-out | Skeleton |
| POST | `/api/v1/me/phone/verify/start` | Telefonnummer prüfen | Skeleton |
| POST | `/api/v1/me/phone/verify/confirm` | Telefonnummer bestätigen | Skeleton |
| GET | `/api/v1/orders/{orderId}/notifications` | Eigene Notification-Historie | Skeleton |
| GET | `/api/v1/admin/notifications` | Admin Notification Log | Skeleton |
| GET | `/api/v1/admin/notifications/failed` | Fehlgeschlagene Nachrichten | Skeleton |
| POST | `/api/v1/webhooks/whatsapp/status` | Delivery-Status verarbeiten | Skeleton |
| POST | `/api/v1/webhooks/whatsapp` | Eingehende Nachrichten vorbereiten | Skeleton |

## MVP-Grenzen

- Maximal 2-3 WhatsApp-Nachrichten pro Bestellung.
- Nur genehmigte Templates.
- Kein Roh-QRToken in WhatsApp.
- Kein WhatsApp-Warenkorb, kein Chatbot, keine KI-Beratung.
