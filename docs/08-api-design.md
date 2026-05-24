# API Design

Die API folgt einem einfachen REST-Design unter `/api/v1`. Der MVP nutzt JSON für Requests und Responses. Alle schreibenden Endpunkte sind authentifiziert, alle rollenbezogenen Zugriffe werden serverseitig geprüft.

## API-Versionierung

| Regel | Umsetzung |
| --- | --- |
| Basisversion | `/api/v1` |
| Breaking Changes | Neue Hauptversion, z. B. `/api/v2` |
| Response-Format | JSON mit stabilen Feldnamen |
| Fehlerformat | Einheitliches `error.code`, `error.message`, `error.details` |
| Idempotenz | Payment Webhooks und kritische Statusänderungen speichern externe Event-IDs |

## Customer API

| Methode | Endpoint | Zweck | Auth | RBAC |
| --- | --- | --- | --- | --- |
| GET | `/api/v1/stands?lat=&lng=&radius=&productId=&openNow=` | Stände in Nähe suchen | Optional | Öffentlich |
| GET | `/api/v1/stands/{standId}` | Standdetails abrufen | Optional | Öffentlich |
| GET | `/api/v1/stands/{standId}/products` | Produkte und Verfügbarkeit | Optional | Öffentlich |
| POST | `/api/v1/orders` | Reservierung anlegen | Ja | Kunde |
| POST | `/api/v1/orders/{orderId}/payment-intent` | Zahlung starten | Ja | Eigene Order |
| GET | `/api/v1/orders/{orderId}` | Bestellung abrufen | Ja | Eigene Order |
| GET | `/api/v1/orders/{orderId}/notifications` | Benachrichtigungen zur Bestellung abrufen | Ja | Eigene Order |
| POST | `/api/v1/orders/{orderId}/cancel` | Storno anfragen | Ja | Eigene Order |
| GET | `/api/v1/orders/{orderId}/qr` | QR-Code abrufen | Ja | Eigene bestätigte Order |
| PATCH | `/api/v1/me/notification-preferences` | E-Mail/WhatsApp/Push-Präferenzen ändern | Ja | Eigener User |
| POST | `/api/v1/me/phone/verify/start` | Telefonverifikation starten | Ja | Eigener User |
| POST | `/api/v1/me/phone/verify/confirm` | Telefonverifikation bestätigen | Ja | Eigener User |

### Beispiel: Stände suchen

Request:

```http
GET /api/v1/stands?lat=49.4875&lng=8.4660&radius=15000&openNow=true
```

Response:

```json
{
  "data": [
    {
      "id": "stand_123",
      "name": "Stand Mannheim Ost",
      "status": "open",
      "distanceMeters": 2400,
      "address": "Beispielstraße 12, 68163 Mannheim",
      "availabilitySummary": {
        "availableProducts": 3,
        "lowStockProducts": 1,
        "outOfStockProducts": 0
      }
    }
  ]
}
```

### Beispiel: Reservierung anlegen

Request:

```http
POST /api/v1/orders
Content-Type: application/json
```

```json
{
  "standId": "stand_123",
  "pickupSlotStart": "2026-05-23T10:00:00.000Z",
  "pickupSlotEnd": "2026-05-23T10:30:00.000Z",
  "items": [
    {
      "productId": "prod_spargel_klasse_1",
      "quantity": 2.5
    }
  ]
}
```

Response:

```json
{
  "data": {
    "orderId": "order_789",
    "status": "pending_payment",
    "expiresAt": "2026-05-22T15:10:00.000Z",
    "productTotalCents": 3000,
    "serviceFeeCents": 99,
    "totalAmountCents": 3099,
    "currency": "EUR"
  }
}
```

## Admin API

| Methode | Endpoint | Zweck | Auth | RBAC |
| --- | --- | --- | --- | --- |
| GET | `/api/v1/admin/dashboard` | Tagesüberblick | Ja | Eigener Produzent |
| GET | `/api/v1/admin/stands` | Stände listen | Ja | Eigener Produzent |
| POST | `/api/v1/admin/stands` | Stand anlegen | Ja | Spargelbauer/Admin |
| GET | `/api/v1/admin/stands/{standId}` | Stand anzeigen | Ja | Eigener Stand |
| PATCH | `/api/v1/admin/stands/{standId}` | Stand bearbeiten | Ja | Eigener Stand |
| GET | `/api/v1/admin/products` | Produkte listen | Ja | Eigener Produzent |
| POST | `/api/v1/admin/products` | Produkt anlegen | Ja | Eigener Produzent |
| GET | `/api/v1/admin/products/{productId}` | Produkt anzeigen | Ja | Eigenes Produkt |
| PATCH | `/api/v1/admin/products/{productId}` | Produkt bearbeiten | Ja | Eigenes Produkt |
| PATCH | `/api/v1/admin/inventory/{standId}/{productId}` | Bestand ändern | Ja | Eigener Stand |
| GET | `/api/v1/admin/orders?standId=&status=&date=` | Reservierungen anzeigen | Ja | Eigene Stände |
| GET | `/api/v1/admin/orders/{orderId}/notifications` | Notification-Historie einer Order anzeigen | Ja | Eigene Stände |
| POST | `/api/v1/admin/orders/{orderId}/notify` | Freigegebene Statusnachricht, z. B. Lieferverzögerung, auslösen | Ja | Eigene Stände |
| GET | `/api/v1/admin/notifications` | Notification-Log filtern | Ja | Eigener Produzent oder Plattformadmin |
| GET | `/api/v1/admin/notifications/failed` | Fehlgeschlagene Benachrichtigungen anzeigen | Ja | Eigener Produzent oder Plattformadmin |
| GET | `/api/v1/admin/analytics/demand` | Nachfrageübersicht | Ja | Eigener Produzent |
| GET | `/api/v1/admin/delivery-suggestions` | Lieferempfehlungen | Ja | Eigener Produzent |
| POST | `/api/v1/admin/staff` | Mitarbeiter anlegen | Ja | Eigener Produzent |

### Beispiel: Bestand ändern

Request:

```http
PATCH /api/v1/admin/inventory/stand_123/prod_spargel_klasse_1
Content-Type: application/json
```

```json
{
  "stockQuantity": 30,
  "safetyBuffer": 3,
  "lowStockThreshold": 5,
  "nextDeliveryAt": "2026-05-23T12:00:00.000Z",
  "note": "Morgendliche Bestandsaufnahme"
}
```

Response:

```json
{
  "data": {
    "standId": "stand_123",
    "productId": "prod_spargel_klasse_1",
    "stockQuantity": 30,
    "reservedQuantity": 8,
    "safetyBuffer": 3,
    "availableQuantity": 19,
    "status": "available"
  }
}
```

## Staff API

| Methode | Endpoint | Zweck | Auth | RBAC |
| --- | --- | --- | --- | --- |
| GET | `/api/v1/staff/orders?standId=&status=` | Offene Bestellungen | Ja | Zugewiesener Stand |
| POST | `/api/v1/staff/scan` | QR-Code prüfen | Ja | Zugewiesener Stand |
| POST | `/api/v1/staff/orders/{orderId}/pickup` | Abholung bestätigen | Ja | Zugewiesener Stand |
| PATCH | `/api/v1/staff/inventory` | Bestand ändern | Ja | Zugewiesener Stand |
| POST | `/api/v1/staff/products/{productId}/out-of-stock` | Ausverkauft markieren | Ja | Zugewiesener Stand |
| POST | `/api/v1/staff/deliveries` | Lieferung eingetroffen | Ja | Zugewiesener Stand |

### Beispiel: QR-Code prüfen

Request:

```http
POST /api/v1/staff/scan
Content-Type: application/json
```

```json
{
  "standId": "stand_123",
  "token": "signed.order.token"
}
```

Response:

```json
{
  "data": {
    "valid": true,
    "order": {
      "id": "order_789",
      "orderNumber": "A7K4Q2",
      "status": "confirmed",
      "pickupSlotStart": "2026-05-23T10:00:00.000Z",
      "pickupSlotEnd": "2026-05-23T10:30:00.000Z",
      "items": [
        {
          "name": "Spargel Klasse I",
          "quantity": 2.5,
          "unit": "kg"
        }
      ]
    }
  }
}
```

### Beispiel: Abholung bestätigen

Request:

```http
POST /api/v1/staff/orders/order_789/pickup
Content-Type: application/json
```

```json
{
  "standId": "stand_123",
  "token": "signed.order.token"
}
```

Response:

```json
{
  "data": {
    "orderId": "order_789",
    "status": "picked_up",
    "pickedUpAt": "2026-05-23T10:12:33.000Z"
  }
}
```

## Webhooks

| Methode | Endpoint | Zweck | Auth | Sicherheitsregel |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/webhooks/stripe` | Payment-Status synchronisieren | Nein | Stripe-Signatur prüfen |
| POST | `/api/v1/webhooks/paypal` | Optional PayPal synchronisieren | Nein | PayPal-Signatur prüfen |
| POST | `/api/v1/webhooks/whatsapp` | Eingehende WhatsApp-Nachrichten vorbereiten | Nein | Provider-Signatur prüfen |
| POST | `/api/v1/webhooks/whatsapp/status` | Delivery-Status für WhatsApp aktualisieren | Nein | Provider-Signatur und Idempotenz prüfen |

Webhook-Verarbeitung:

1. Signatur prüfen.
2. Provider Event ID idempotent speichern.
3. Payment laden.
4. Statusübergang validieren.
5. Order aktualisieren.
6. Inventory bei Fehler/Timeout freigeben.
7. QRToken nach erfolgreicher Zahlung erzeugen.
8. Order Event für Notification Service veröffentlichen.

WhatsApp-Webhook-Verarbeitung:

1. Provider-Signatur prüfen.
2. Provider Message ID idempotent verarbeiten.
3. Notification anhand `provider_message_id` laden.
4. Status auf `sent`, `delivered` oder `failed` aktualisieren.
5. Fehler ohne vollständige Provider-Payload speichern.
6. Eingehende Nachrichten im MVP höchstens protokollieren oder mit Standardhinweis beantworten.

## Interne Events

Order- und Payment-Services lösen interne Events aus. Der Notification Service reagiert darauf und entscheidet anhand der Nutzerpräferenzen, ob eine E-Mail, WhatsApp oder später Push-Nachricht erzeugt wird.

| Event | Typischer Auslöser | Notification-Relevanz |
| --- | --- | --- |
| `order.confirmed` | Order nach Zahlung bestätigt | Bestellbestätigung |
| `payment.succeeded` | Payment Webhook erfolgreich | Zahlungsbestätigung |
| `pickup.reminder_due` | Geplanter Reminder-Job | Abholerinnerung |
| `order.ready_for_pickup` | Mitarbeiter/Admin markiert Order bereit | Statusmeldung |
| `order.changed` | Lieferverzögerung oder operative Änderung | Statusänderung |
| `order.picked_up` | Abholung bestätigt | Optionale Abschlussnachricht |
| `order.cancelled` | Storno oder Ablauf | Storno-/Statusmeldung |

## Fehlercodes

| HTTP | Code | Bedeutung |
| --- | --- | --- |
| 400 | `VALIDATION_ERROR` | Request ist fachlich oder syntaktisch ungültig |
| 401 | `AUTH_REQUIRED` | Nutzer ist nicht authentifiziert |
| 403 | `FORBIDDEN` | Rolle oder Ressourcenbesitz reicht nicht aus |
| 404 | `NOT_FOUND` | Ressource existiert nicht oder ist nicht im erlaubten Scope |
| 409 | `INSUFFICIENT_INVENTORY` | Gewünschte Menge ist nicht verfügbar |
| 409 | `INVALID_STATUS_TRANSITION` | Statuswechsel ist nicht erlaubt |
| 409 | `QR_TOKEN_ALREADY_USED` | QRToken wurde bereits verwendet |
| 410 | `RESERVATION_EXPIRED` | Temporäre Reservierung ist abgelaufen |
| 422 | `PAYMENT_NOT_CONFIRMED` | Bestellung ist noch nicht bezahlt |
| 422 | `WHATSAPP_OPT_IN_REQUIRED` | WhatsApp-Versand ist ohne aktive Einwilligung nicht erlaubt |
| 422 | `PHONE_VERIFICATION_REQUIRED` | Telefonnummer fehlt oder ist nicht verifiziert/plausibilisiert |
| 429 | `RATE_LIMITED` | Zu viele Anfragen |
| 500 | `INTERNAL_ERROR` | Unerwarteter Fehler |

Fehlerformat:

```json
{
  "error": {
    "code": "INSUFFICIENT_INVENTORY",
    "message": "Die gewünschte Menge ist nicht mehr verfügbar.",
    "details": {
      "productId": "prod_spargel_klasse_1",
      "requestedQuantity": 5,
      "availableQuantity": 3.5
    }
  }
}
```

## Auth- und RBAC-Anforderungen

| Endpunktgruppe | Anforderung |
| --- | --- |
| Public Customer Read | Öffentlich lesbar, aber rate-limited |
| Customer Orders | Authentifizierter Kunde, `customer_id` muss Session-User sein |
| Admin | Rolle `producer_admin`, `producer_id` muss passen |
| Staff | Rolle `staff`, `stand_id` muss zugeordnet sein |
| Platform Admin | Rolle `platform_admin`, zusätzliche Audit-Logs |
| Webhooks | Keine User-Session, Provider-Signatur und Idempotenz |
