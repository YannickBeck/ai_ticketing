# Backend-Plan

Das Backend wird als modularer Domain-Layer innerhalb von Next.js umgesetzt. API-Handler bleiben dünn, validieren Requests, prüfen Auth/RBAC und delegieren an Services.

## Backend-Module

```text
server/
  auth/
    requireUser.ts
    requireRole.ts
    permissions.ts
  services/
    AuthService.ts
    StandService.ts
    ProductService.ts
    InventoryService.ts
    ReservationService.ts
    PaymentService.ts
    QRCodeService.ts
    DeliveryPlanningService.ts
    NotificationService.ts
  repositories/
    StandRepository.ts
    ProductRepository.ts
    InventoryRepository.ts
    OrderRepository.ts
    PaymentRepository.ts
    NotificationRepository.ts
  jobs/
    expireReservations.ts
    expireQRTokens.ts
    sendPickupReminders.ts
  webhooks/
    stripeWebhookHandler.ts
    whatsappWebhookHandler.ts
```

## Services

### AuthService

Verantwortung:

| Aufgabe | Beschreibung |
| --- | --- |
| Session lesen | Nutzer aus Auth-Provider laden |
| Rolle prüfen | `customer`, `producer_admin`, `staff`, `platform_admin` |
| Ressourcenbesitz prüfen | `producer_id`, `stand_id`, `customer_id` |
| Staff-Scope prüfen | Stand-Zuordnung validieren |

### StandService

Verantwortung:

| Aufgabe | Beschreibung |
| --- | --- |
| Stände suchen | Radius, Öffnungsstatus, Produktfilter |
| Standdetails liefern | Öffnungszeiten, Adresse, Status |
| Stand verwalten | Anlegen, ändern, Status setzen |
| Stand-QR-Daten liefern | Öffentliche URL oder QRToken |

### ProductService

Verantwortung:

| Aufgabe | Beschreibung |
| --- | --- |
| Produkte listen | Je Produzent oder Stand |
| Produkt pflegen | Name, Einheit, Preis, Aktivstatus |
| Verfügbarkeit mitliefern | Kombination mit InventoryService |
| Preis-Snapshot erzeugen | Preis für OrderItem speichern |

### InventoryService

Verantwortung:

| Aufgabe | Beschreibung |
| --- | --- |
| `available_quantity` berechnen | `stock_quantity - reserved_quantity - safety_buffer` |
| Reservierung prüfen | Menge, Stand, Produkt, Status |
| Menge blockieren | `reserved_quantity` erhöhen |
| Menge freigeben | `reserved_quantity` reduzieren |
| Pickup finalisieren | `stock_quantity` und `reserved_quantity` reduzieren |
| InventoryEvent schreiben | Jede relevante Änderung protokollieren |
| Status berechnen | `available`, `low_stock`, `out_of_stock`, `next_delivery_expected` |

### ReservationService

Verantwortung:

| Aufgabe | Beschreibung |
| --- | --- |
| Order erstellen | Produkte, Menge, PickupSlot, Beträge |
| Statusübergänge validieren | Order-State-Machine |
| Storno ausführen | Freigabe und optional Refund anstoßen |
| Ablauf behandeln | `pending_payment` zu `expired` |
| Orderdetails liefern | Kunde, Admin und Staff mit passenden Sichten |

### PaymentService

Verantwortung:

| Aufgabe | Beschreibung |
| --- | --- |
| Payment erzeugen | Stripe Checkout oder Payment Intent |
| Service Fee berechnen | Separat vom Warenwert |
| Webhook verarbeiten | Signatur, Idempotenz, Status |
| Refund auslösen | Nach Storno- oder Supportregel |
| Payment Status synchronisieren | `pending`, `succeeded`, `failed`, `refunded` |

### QRCodeService

Verantwortung:

| Aufgabe | Beschreibung |
| --- | --- |
| QRToken erzeugen | Signiert, gehasht gespeichert |
| QR-Code rendern | Serverseitig als Bild oder Data URL |
| Token validieren | Signatur, Hash, Ablauf, Status |
| One-Time-Use setzen | Bei Pickup `used_at` speichern |
| Fallback-Code unterstützen | Order-Code-Suche im Staff-Kontext |

### DeliveryPlanningService

Verantwortung:

| Aufgabe | Beschreibung |
| --- | --- |
| Lieferempfehlungen berechnen | Regelbasiert aus Reservierungen und Bestand |
| Kritische Stände identifizieren | `low_stock` und `out_of_stock` |
| DeliveryPlan verwalten | Geplante Lieferung speichern |
| Lieferung buchen | InventoryService mit Event `delivery` aufrufen |

### NotificationService

Verantwortung:

| Aufgabe | Beschreibung |
| --- | --- |
| Order Events verarbeiten | `order.confirmed`, `payment.succeeded`, `pickup.reminder_due`, `order.ready_for_pickup`, `order.changed`, `order.picked_up`, `order.cancelled` |
| Kanalpräferenzen prüfen | E-Mail, WhatsApp und später Push anhand Opt-in und Nutzerpräferenz |
| Bestellbestätigung senden | Nach Order `confirmed` oder Payment `succeeded` |
| WhatsApp-Abholerinnerung senden | Vor dem Abholfenster mit sicherem Link zur QR-Code-Seite |
| QR-Link senden | Nur als sicherer Link, nicht als unsicherer Roh-Token |
| Versandstatus speichern | Notification mit Provider-ID, Status und Fehlern pflegen |
| Storno/Refund informieren | Kunde und Admin über transaktionale Kanäle |
| Fehler intern melden | Payment/Webhook- und Notification-Probleme |

Provider-Adapter:

| Adapter | MVP-Rolle |
| --- | --- |
| EmailProvider | Bestell- und Zahlungsbestätigung |
| WhatsAppProvider | Optionale P1-Pilotnachrichten per genehmigtem Template |
| PushProvider | Interface vorbereiten, Umsetzung später |

## Domainlogik

Statuswerte sind zentrale Domainregeln und dürfen nicht beliebig gesetzt werden.

Order:

```text
draft, pending_payment, confirmed, ready_for_pickup, picked_up, cancelled, expired, refunded
```

Payment:

```text
pending, succeeded, failed, refunded
```

Inventory:

```text
available, low_stock, out_of_stock, next_delivery_expected
```

Stand:

```text
open, closed, seasonal_pause
```

Notification:

```text
pending, sent, delivered, failed, cancelled
```

## Transaktionen

Transaktionen sind Pflicht für:

| Vorgang | Enthaltene Änderungen |
| --- | --- |
| Reservierung erstellen | Inventory prüfen, `reserved_quantity` erhöhen, Order und OrderItems erstellen |
| Payment Success | Payment setzen, Order bestätigen, QRToken erstellen |
| Payment Failed/Expired | Payment/Order setzen, reservierte Menge freigeben |
| Pickup bestätigen | Order setzen, QRToken nutzen, Inventory reduzieren, InventoryEvent schreiben |
| Storno | Order setzen, Inventory freigeben, optional Refund starten |

Notification-Erstellung kann direkt nach erfolgreichem Domain-Statuswechsel erfolgen, sollte aber die eigentliche Reservierungs-, Payment- oder Pickup-Transaktion nicht durch Provider-Latenz blockieren. Der sichere Ansatz ist: Domainstatus speichern, Notification als `pending` persistieren, Versand asynchron oder in einem kurzen Folgejob ausführen.

Bei Inventory-Zeilen sollte entweder Row-Level Locking oder ein robustes optimistisches Update genutzt werden.

## Webhooks

Stripe Webhook-Anforderungen:

| Anforderung | Umsetzung |
| --- | --- |
| Signatur prüfen | Vor JSON-Verarbeitung mit Raw Body |
| Idempotenz | Provider Event ID speichern |
| Reihenfolge beachten | Statusübergang validieren, nicht blind überschreiben |
| Fehler sichtbar machen | Fehler loggen und Monitoring alarmieren |
| Retry-tauglich | Handler darf bei Wiederholung keinen Schaden verursachen |

WhatsApp Webhook-Anforderungen:

| Anforderung | Umsetzung |
| --- | --- |
| Signatur prüfen | Provider-spezifische Signatur vor Verarbeitung validieren |
| Delivery Status idempotent speichern | `provider_message_id` und Statuswechsel kontrollieren |
| Eingehende Nachrichten begrenzen | Im MVP keine Chatbot-Logik, nur vorbereiten oder Standardantwort |
| Fehler sichtbar machen | Notification auf `failed` setzen und Adminansicht versorgen |
| Datenschutz | Rohpayloads nicht vollständig speichern, Telefonnummern minimieren |

## Cronjobs

| Job | Rhythmus | Aufgabe |
| --- | --- | --- |
| `expireReservations` | Alle 1-5 Minuten | `pending_payment` Orders nach `expires_at` auf `expired` setzen und Bestand freigeben |
| `expireQRTokens` | Alle 15-60 Minuten | Abgelaufene QRToken auf `expired` setzen |
| `sendPickupReminders` | Alle 5-15 Minuten | Fällige Abholerinnerungen als Notification `pending` anlegen oder versenden |
| `markNoShows` | Mehrmals täglich oder manuell | Orders nach Abholfenster plus Kulanzzeit prüfen |
| `dailySummary` | Täglich | Admin-Kennzahlen und Monitoring-Checks |

Cronjobs können im MVP über Azure WebJobs, GitHub Actions Scheduler, einen App-Service-Hintergrundprozess oder einen einfachen Worker umgesetzt werden.

## Logging und Monitoring

| Bereich | Log-Inhalt |
| --- | --- |
| Auth | Login-Fehler, unberechtigte Zugriffsversuche |
| Inventory | Reservierung, Freigabe, Pickup, manuelle Änderung |
| Payment | Provider Event ID, Payment Status, Webhook-Ergebnis |
| Notification | Kanal, Template-Key, Status, Provider Message ID, gekürzte Fehler |
| QR | Scan-Erfolg, abgelehnte Tokens, doppelte Nutzung |
| API | Fehlerstatus, Latenz, Rate Limit |

Keine Klartext-Tokens, Zahlungsdaten, vollständigen Telefonnummern oder unnötigen personenbezogenen Daten loggen.

## API-Handler-Prinzip

Jeder Handler folgt demselben Muster:

```text
1. Request validieren
2. Session laden
3. Rolle und Ressourcenbesitz prüfen
4. Service aufrufen
5. Fehler in standardisiertes API-Format übersetzen
6. Response zurückgeben
```

Dadurch bleibt fachliche Logik testbar und unabhängig von Next.js-spezifischem Code.
