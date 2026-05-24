# WhatsApp Notifications

## Implementierungsstatus im MVP-Grundgerüst

WhatsApp ist als P1-/Pilot-Feature eingeordnet. Das aktuelle Grundgerüst enthält Datenmodellfelder, Notification-API-Skeletons, einen `NotificationService`, einen `WhatsAppProvider`-Adapter und Webhook-Skeletons. Es enthält bewusst keinen WhatsApp-Bestellkanal, keinen Chatbot und keine KI-Beratung.

P0-Abnahme bleibt ohne WhatsApp möglich: Reservierung, Zahlung, QR-Code und Abholung muessen vollständig in App/PWA funktionieren.

## Ziel des Features

WhatsApp Order Updates ergänzen die Spargelstand-App um einen optionalen Kommunikationskanal für Kunden. Der Kanal soll wichtige Bestellinformationen schnell auffindbar machen, Unsicherheit reduzieren und No-shows senken.

Wichtig: WhatsApp ist im MVP ein Bestellbegleiter, kein vollständiger Bestellkanal. Reservierung, Zahlung und QR-Abholung bleiben in der App/PWA.

## MVP-Scope

| Funktion | Beschreibung |
| --- | --- |
| WhatsApp Opt-in | Kunde aktiviert WhatsApp-Benachrichtigungen freiwillig im Checkout oder Konto |
| Telefonnummer speichern | Normalisiert, datensparsam und mit Opt-in-Zeitpunkt |
| Bestellbestätigung | Versand nach bestätigter Zahlung oder bestätigter Order |
| Zahlungsbestätigung | Kann mit Bestellbestätigung kombiniert werden |
| Abholerinnerung | Versand vor dem gewählten Abholzeitfenster |
| QR-Link | Sicherer Link zur Bestellung oder QR-Code-Seite |
| Statusänderung | Bei Lieferverzögerung oder `ready_for_pickup` |
| Abholbestätigung | Optional nach erfolgreicher Übergabe |
| Notification Log | Versandstatus, Provider-ID und Fehler speichern |

Für den MVP sollten maximal 2-3 WhatsApp-Nachrichten pro Bestellung versendet werden: Bestätigung, Abholerinnerung und optional Abschluss- oder Statusnachricht.

## Nicht-Ziele

| Nicht-Ziel | Begründung |
| --- | --- |
| Vollständiger WhatsApp-Chatbot | Zu viel Scope für den Pilot |
| Vollständige Bestellung per WhatsApp | App/PWA bleibt verbindlicher Bestell- und Zahlungsort |
| KI-basierte WhatsApp-Beratung | Keine MVP-Relevanz für Reservierungsgarantie |
| Automatische Produktempfehlung per WhatsApp | Benötigt Datenbasis und separates Einwilligungskonzept |
| Komplexe Storno-, Umbuchungs- oder Reklamationsflows | Erhöht Support- und Compliance-Aufwand |

## User Stories

| Rolle | User Story | Priorität |
| --- | --- | --- |
| Kunde | Als Kunde möchte ich optional WhatsApp-Benachrichtigungen aktivieren, damit ich wichtige Bestellinformationen direkt erhalte. | P1 |
| Kunde | Als Kunde möchte ich nach der Reservierung eine WhatsApp-Bestätigung erhalten, damit ich meine Bestellung schnell wiederfinde. | P1 |
| Kunde | Als Kunde möchte ich vor meinem Abholfenster per WhatsApp erinnert werden, damit ich die Ware rechtzeitig abhole. | P1 |
| Kunde | Als Kunde möchte ich einen Link zu meinem QR-Code per WhatsApp erhalten, damit ich ihn am Stand schnell öffnen kann. | P1 |
| Kunde | Als Kunde möchte ich über relevante Änderungen per WhatsApp informiert werden, z. B. bei Lieferverzögerung. | P1 |
| Produzent/Admin | Als Produzent möchte ich sehen können, ob Kunden WhatsApp-Benachrichtigungen aktiviert haben. | P1 |
| Produzent/Admin | Als Produzent möchte ich, dass Kunden automatisch an Abholungen erinnert werden, damit No-shows reduziert werden. | P1 |
| Produzent/Admin | Als Produzent möchte ich bei Lieferverzögerungen Kunden informieren können. | P1 |
| Plattformadmin | Als Plattformadmin möchte ich WhatsApp-Templates verwalten oder dokumentieren können. | P1 |
| Plattformadmin | Als Plattformadmin möchte ich Versandfehler einsehen können. | P1 |
| Plattformadmin | Als Plattformadmin möchte ich nachvollziehen können, welche Benachrichtigungen zu einer Bestellung versendet wurden. | P1 |

## Technischer Ablauf

```text
Kunde reserviert Produkt
    ↓
Kunde aktiviert WhatsApp Opt-in
    ↓
Kunde bezahlt Bestellung
    ↓
Payment Webhook bestätigt Zahlung
    ↓
Order wird auf Confirmed gesetzt
    ↓
Order Event löst Notification Service aus
    ↓
WhatsApp-Bestätigung wird versendet
    ↓
Abholerinnerung wird vor dem Zeitfenster geplant
    ↓
Kunde erhält Link zur QR-Code-Seite
    ↓
Nach Abholung erhält Kunde optional Abschlussnachricht
```

Architekturfluss:

```text
Order Management
    ↓
Order Event
    ↓
Notification Service
    ↓
WhatsApp Provider
    ↓
Kunde
```

## Datenmodell-Erweiterung

### User / Customer

| Feld | Typ |
| --- | --- |
| phone_number | string? |
| phone_verified_at | datetime? |
| whatsapp_opt_in | boolean |
| whatsapp_opt_in_at | datetime? |
| whatsapp_opt_out_at | datetime? |
| preferred_notification_channel | enum? |

### Notification

| Feld | Typ |
| --- | --- |
| id | uuid |
| user_id | uuid |
| order_id | uuid? |
| channel | `email` \| `whatsapp` \| `push` |
| type | `order_confirmed` \| `payment_confirmed` \| `pickup_reminder` \| `order_ready` \| `order_changed` \| `picked_up` |
| template_key | string |
| recipient | string |
| status | `pending` \| `sent` \| `delivered` \| `failed` \| `cancelled` |
| provider | string |
| provider_message_id | string? |
| error_message | string? |
| scheduled_at | datetime? |
| sent_at | datetime? |
| delivered_at | datetime? |
| created_at | datetime |

### NotificationPreference

| Feld | Typ |
| --- | --- |
| id | uuid |
| user_id | uuid |
| channel | string |
| enabled | boolean |
| created_at | datetime |
| updated_at | datetime |

### Optional für spätere Phasen: WhatsAppConversation

| Feld | Typ |
| --- | --- |
| id | uuid |
| user_id | uuid? |
| phone_number | string |
| provider_conversation_id | string? |
| last_message_at | datetime? |
| status | string |

## API-Erweiterung

### Customer API

| Methode | Endpoint | Zweck |
| --- | --- | --- |
| PATCH | `/api/v1/me/notification-preferences` | Kanalpräferenzen ändern |
| POST | `/api/v1/me/phone/verify/start` | Telefonverifikation starten |
| POST | `/api/v1/me/phone/verify/confirm` | Telefonverifikation bestätigen |
| GET | `/api/v1/orders/{id}/notifications` | Notifications einer eigenen Bestellung abrufen |

### Admin API

| Methode | Endpoint | Zweck |
| --- | --- | --- |
| GET | `/api/v1/admin/orders/{id}/notifications` | Notifications einer Order anzeigen |
| POST | `/api/v1/admin/orders/{id}/notify` | Statusnachricht über freigegebenes Template auslösen |
| GET | `/api/v1/admin/notifications` | Notification Log filtern |
| GET | `/api/v1/admin/notifications/failed` | Fehlgeschlagene Nachrichten anzeigen |

### Webhook API

| Methode | Endpoint | Zweck |
| --- | --- | --- |
| POST | `/api/v1/webhooks/whatsapp` | Eingehende Nachrichten vorbereiten |
| POST | `/api/v1/webhooks/whatsapp/status` | Delivery Status aktualisieren |

### Interne Events

`order.confirmed`, `payment.succeeded`, `pickup.reminder_due`, `order.ready_for_pickup`, `order.changed`, `order.picked_up`, `order.cancelled`

## Provider-Optionen

| Option | Bewertung für MVP |
| --- | --- |
| WhatsApp Business Platform / Cloud API | Direkte Kontrolle, mehr Eigenverantwortung |
| Twilio | Gute Entwickler-Tools, zusätzliche Provider-Kosten |
| Bird/MessageBird | Provider-Abstraktion und Messaging-Fokus |
| 360dialog | WhatsApp-fokussierter Anbieter |

Die Entscheidung sollte Kosten, Datenschutz, Template-Freigabe, Sandbox, Webhook-Support und Betriebsaufwand vergleichen.

## Datenschutz- und Opt-in-Anforderungen

| Anforderung | Umsetzung |
| --- | --- |
| Freiwilliges Opt-in | Keine WhatsApp-Nachricht ohne aktive Einwilligung |
| Opt-in protokollieren | `whatsapp_opt_in_at` speichern |
| Opt-out jederzeit | Konto, Checkout oder Link zur Deaktivierung |
| Telefonnummer minimieren | Normalisiert speichern, maskiert anzeigen |
| Fallback | App/PWA und E-Mail bleiben verfügbar |
| Datenschutzhinweise | WhatsApp-Provider und Zweck transparent nennen |
| Logging | Keine vollständigen Telefonnummern oder Rohpayloads in Logs |

## Risiken

| Risiko | Gegenmaßnahme |
| --- | --- |
| Opt-in wird unsauber eingeholt | Explizite Einwilligung und Auditierbarkeit |
| Telefonnummern sind personenbezogene Daten | Datensparsamkeit, RBAC und Datenschutzhinweise |
| Kunden empfinden Nachrichten als störend | Begrenzte Frequenz und klarer Opt-out |
| Provider-Kosten steigen | Maximal 2-3 Nachrichten pro Bestellung im MVP |
| Templates werden nicht genehmigt | Frühe Template-Definition und E-Mail-Fallback |
| Zustellung ist nicht garantiert | WhatsApp nie als einzigen Informationskanal nutzen |
| Unsicherer QR-Link wird weitergeleitet | Kurzlebiger signierter Link oder authentifizierte Session |

## Roadmap

| Phase | Umfang |
| --- | --- |
| MVP / Pilot P1 | Opt-in, Bestellbestätigung, Abholerinnerung, QR-Link, Notification Logs |
| Phase 1.5 | Statusabfrage, Storno-Link, Wiederbestellen-Link, Lieferverzögerung aktiv kommunizieren |
| Phase 2 | WhatsApp Bot, Conversational Ordering, Payment Link, Wiederverfügbarkeit, KI-Antwortlogik, CRM-/Support-Integration |
