# Admin API

Basis: `/api/v1/admin`

| Methode | Endpoint | Zweck | Status |
| --- | --- | --- | --- |
| GET | `/dashboard` | Tagesüberblick | Skeleton |
| POST | `/stands` | Stand anlegen | Skeleton |
| PATCH | `/stands/{standId}` | Stand bearbeiten | Skeleton |
| POST | `/products` | Produkt anlegen | Skeleton |
| PATCH | `/products/{productId}` | Produkt bearbeiten | Skeleton |
| PATCH | `/inventory/{standId}/{productId}` | Bestand ändern | Skeleton |
| GET | `/orders?standId=&status=&date=` | Reservierungen anzeigen | Skeleton |
| GET | `/orders/{orderId}/notifications` | Notification-Historie | Skeleton |
| POST | `/orders/{orderId}/notify` | Freigegebene Statusnachricht | Skeleton |
| GET | `/notifications` | Notification Log | Skeleton |
| GET | `/notifications/failed` | Fehlgeschlagene Nachrichten | Skeleton |
| GET | `/analytics/demand` | Nachfrageübersicht | Skeleton |
| GET | `/delivery-suggestions` | Lieferempfehlungen | Skeleton |
| POST | `/staff` | Mitarbeiter anlegen | Skeleton |

Admins sind auf den eigenen `producer_id`-Scope begrenzt. Plattformadmins erhalten später erweiterte Support- und Audit-Sichten.
