# Customer API

Basis: `/api/v1`

| Methode | Endpoint | Zweck | Status |
| --- | --- | --- | --- |
| GET | `/stands?lat=&lng=&radius=&productId=&openNow=` | Stände suchen | Skeleton |
| GET | `/stands/{standId}` | Standdetails | Skeleton |
| GET | `/stands/{standId}/products` | Produkte und Verfügbarkeit | Skeleton |
| POST | `/orders` | Reservierung anlegen | Skeleton |
| POST | `/orders/{orderId}/payment-intent` | Zahlung starten | Skeleton |
| GET | `/orders/{orderId}` | Eigene Bestellung abrufen | Skeleton |
| GET | `/orders/{orderId}/qr` | QR-Code abrufen | Skeleton |
| POST | `/orders/{orderId}/cancel` | Storno anfragen | Skeleton |
| GET | `/orders/{orderId}/notifications` | Notification-Historie eigener Order | Skeleton |
| PATCH | `/me/notification-preferences` | E-Mail/WhatsApp/Push-Präferenzen | Skeleton |
| POST | `/me/phone/verify/start` | Telefonverifikation starten | Skeleton |
| POST | `/me/phone/verify/confirm` | Telefonverifikation bestätigen | Skeleton |

## Fehlerformat

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request ist ungueltig.",
    "details": {}
  }
}
```
