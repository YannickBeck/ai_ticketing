# Admin API

Basis: `/api/v1/admin`

| Methode | Endpoint | Zweck | Status |
| --- | --- | --- | --- |
| GET | `/dashboard` | Tagesüberblick | Skeleton |
| GET | `/stands` | Stände listen | DB-backed |
| POST | `/stands` | Stand anlegen | DB-backed |
| GET | `/stands/{standId}` | Stand anzeigen | DB-backed |
| PATCH | `/stands/{standId}` | Stand bearbeiten | DB-backed |
| GET | `/products` | Produkte listen | DB-backed |
| POST | `/products` | Produkt anlegen | DB-backed |
| GET | `/products/{productId}` | Produkt anzeigen | DB-backed |
| PATCH | `/products/{productId}` | Produkt bearbeiten | DB-backed |
| PATCH | `/inventory/{standId}/{productId}` | Bestand ändern | DB-backed |
| GET | `/orders?standId=&status=&date=` | Reservierungen anzeigen | Skeleton |
| GET | `/orders/{orderId}/notifications` | Notification-Historie | Skeleton |
| POST | `/orders/{orderId}/notify` | Freigegebene Statusnachricht | Skeleton |
| GET | `/notifications` | Notification Log | Skeleton |
| GET | `/notifications/failed` | Fehlgeschlagene Nachrichten | Skeleton |
| GET | `/analytics/demand` | Nachfrageübersicht | Skeleton |
| GET | `/delivery-suggestions` | Lieferempfehlungen | Skeleton |
| POST | `/staff` | Mitarbeiter anlegen | Skeleton |

Admins sind auf den eigenen `producer_id`-Scope begrenzt. Plattformadmins müssen bei Create-Operationen explizit `producerId` übergeben. Plattformweite Support- und Audit-Sichten bleiben ein späterer Schritt.
