# Frontend-Plan

Das Frontend wird als Next.js Web-App/PWA umgesetzt. Kunde, Spargelbauer/Admin und Stand-Mitarbeiter nutzen dieselbe Anwendung, aber getrennte Routen, Layouts und Rollenprüfungen.

## Konkrete Frontend-Seitenstruktur

```text
app/
  page.tsx
  stands/
    page.tsx
    [standId]/
      page.tsx
      products/
        [productId]/
          page.tsx
  checkout/
    [orderId]/
      page.tsx
  orders/
    [orderId]/
      page.tsx
      qr/
        page.tsx
  account/
    notifications/
      page.tsx
  admin/
    page.tsx
    stands/
      page.tsx
      [standId]/
        page.tsx
    products/
      page.tsx
    inventory/
      page.tsx
    orders/
      page.tsx
    notifications/
      page.tsx
    delivery/
      page.tsx
    revenue/
      page.tsx
    staff/
      page.tsx
  staff/
    page.tsx
    orders/
      page.tsx
      [orderId]/
        page.tsx
    scan/
      page.tsx
    inventory/
      page.tsx
    delivery/
      page.tsx
```

## Routenplanung

### Customer-Bereich

| Route | Zweck |
| --- | --- |
| `/` | Einstieg mit Standortsuche oder Liste naher Stände |
| `/stands` | Karten- und Listenansicht |
| `/stands/[standId]` | Standdetails, Öffnungszeiten, Produktverfügbarkeit |
| `/stands/[standId]/products/[productId]` | Produktauswahl, Menge, PickupSlot |
| `/checkout/[orderId]` | Weiterleitung oder Einbettung Payment |
| `/orders/[orderId]` | Bestellstatus |
| `/orders/[orderId]/qr` | QR-Code für Abholung |
| `/account/notifications` | Benachrichtigungseinstellungen, WhatsApp Opt-in/Opt-out und Telefonnummer |

### Admin-Bereich

| Route | Zweck |
| --- | --- |
| `/admin` | Dashboard |
| `/admin/stands` | Standliste |
| `/admin/stands/[standId]` | Stand bearbeiten |
| `/admin/products` | Produktverwaltung |
| `/admin/inventory` | Bestandsverwaltung |
| `/admin/orders` | Reservierungsverwaltung |
| `/admin/notifications` | Notification Log und fehlgeschlagene WhatsApp-Nachrichten |
| `/admin/delivery` | Lieferplanung |
| `/admin/revenue` | Umsatzübersicht |
| `/admin/staff` | Mitarbeiterverwaltung |

### Staff-Bereich

| Route | Zweck |
| --- | --- |
| `/staff` | Startseite mit Schnellaktionen |
| `/staff/orders` | Offene Bestellungen |
| `/staff/orders/[orderId]` | Bestelldetail und Pickup-Bestätigung |
| `/staff/scan` | QR-Code-Scanner |
| `/staff/inventory` | Bestand aktualisieren |
| `/staff/delivery` | Lieferung eingetroffen |

## Komponentenstruktur

```text
components/
  customer/
    StandMap.tsx
    StandList.tsx
    StandCard.tsx
    ProductAvailabilityCard.tsx
    QuantitySelector.tsx
    PickupSlotPicker.tsx
    OrderSummary.tsx
    QRCodeDisplay.tsx
    WhatsAppOptIn.tsx
    NotificationPreferenceForm.tsx
  admin/
    DashboardKpiGrid.tsx
    InventoryTable.tsx
    OrdersTable.tsx
    NotificationLogTable.tsx
    DeliverySuggestionTable.tsx
    StandForm.tsx
    ProductForm.tsx
    StaffAssignmentForm.tsx
  staff/
    StaffHomeActions.tsx
    OpenOrdersList.tsx
    QRScanner.tsx
    PickupConfirmation.tsx
    InventoryQuickUpdate.tsx
  shared/
    StatusBadge.tsx
    Money.tsx
    EmptyState.tsx
    ErrorState.tsx
    LoadingState.tsx
```

## State Management

| State-Typ | Empfehlung |
| --- | --- |
| Serverdaten | React Server Components oder TanStack Query |
| Formulare | React Hook Form |
| Validierung | Zod Schemas, geteilt mit API DTOs |
| Auth-Session | Auth-Lösung plus serverseitige Guards |
| Warenkorb/Reservierungsdraft | Lokaler Client State bis Order-Erstellung |
| Admin-Tabellenfilter | URL Query Params |
| Staff-Stand-Auswahl | Session Scope oder lokaler Zustand mit serverseitiger Prüfung |

Für den MVP sollte kein globaler State-Manager eingeführt werden, solange Serverdaten und Formulare damit sauber abgedeckt sind.

## Formulare

| Formular | Validierung |
| --- | --- |
| Menge wählen | Positive Menge, Einheit beachten, maximale verfügbare Menge serverseitig prüfen |
| PickupSlot wählen | Slot gehört zu Stand und ist aktiv |
| Stand bearbeiten | Adresse, Koordinaten, Status, Öffnungszeiten |
| Produkt bearbeiten | Name, Einheit, Preis in Cent, Aktivstatus |
| Bestand ändern | Nichtnegative Mengen, Notiz optional |
| Mitarbeiter anlegen | E-Mail eindeutig, Rolle `staff`, Stand-Zuordnung |
| WhatsApp Opt-in | Telefonnummer plausibilisieren, Einwilligung aktiv bestätigen, Opt-out jederzeit anbieten |
| Benachrichtigungseinstellungen | Kanalwerte `email`, `whatsapp`, später `push`, keine vorausgewählte WhatsApp-Einwilligung ohne Aktion |

Clientseitige Validierung verbessert UX. Verbindliche Validierung findet immer serverseitig statt.

## Kartenintegration

MVP-Optionen:

| Option | Einsatz |
| --- | --- |
| Google Maps | Gute UX und bekannte Navigation, aber API-Kosten beachten |
| Mapbox | Gute Karten-UX und Styling |
| Leaflet/OpenStreetMap | Kostengünstig, mehr Eigenverantwortung |

Für den MVP genügt:

1. Karte mit Markern.
2. Liste nach Entfernung.
3. Filter nach Produkt und Öffnungsstatus.
4. Link zu Google Maps oder Apple Maps für Navigation.

Die Reservierungsprüfung darf nie auf Karten- oder Clientdaten vertrauen.

## QR-Code-Anzeige und Scanner

### QR-Code-Anzeige

| Anforderung | Umsetzung |
| --- | --- |
| Hohe Lesbarkeit | Großer QR-Code, heller Hintergrund |
| Backup | Order-Code unter QR-Code |
| Status sichtbar | Order Status und Abholzeitfenster |
| Keine sensiblen Details im QR | QR enthält nur Token-URL |
| WhatsApp-Deep-Link | QR-Seite kann über sicheren, kurzlebigen Link geöffnet werden, aber QRToken bleibt One-Time-Use |

### WhatsApp Opt-in UI

WhatsApp wird im Checkout und in den Kontoeinstellungen als optionaler Kanal angeboten. Die UI darf nicht suggerieren, dass WhatsApp für die Bestellung notwendig ist.

| Zustand | UI-Anforderung |
| --- | --- |
| Kein Opt-in | Checkbox oder Toggle mit klarer Einwilligung und Telefonnummer-Feld |
| Opt-in aktiv | Status, maskierte Telefonnummer und Deaktivieren-Aktion |
| Telefonnummer fehlt | Eingabe mit Plausibilisierung oder Verifikationsstart |
| Versandfehler | Unaufdringlicher Hinweis, Bestellung bleibt gültig |
| Kein WhatsApp | App/PWA zeigt Bestellstatus und QR-Code vollständig weiter an |

### QR-Code-Scanner

Für die Staff PWA kann eine browserbasierte QR-Scanner-Bibliothek genutzt werden. Wichtig ist ein manueller Fallback-Code.

Scan-Komponente:

| Zustand | UI |
| --- | --- |
| Kamera bereit | Scanner mit klarer Scanfläche |
| Kein Kamerazugriff | Fallback-Codeeingabe |
| Scan erfolgreich | Bestelldetail |
| Token ungültig | Fehler mit erneutem Scan |
| Abholung bestätigt | Erfolgsmeldung |

## Responsive Design / PWA

| Bereich | Anforderung |
| --- | --- |
| Customer | Mobile-first, Karte und Liste gut bedienbar |
| Admin | Desktop-first, Tablet-tauglich |
| Staff | Strikt mobile-first |
| PWA | Installierbar, App-Icon, Manifest |
| Performance | Stand- und Produktdaten schnell laden |
| Accessibility | Tastatur, Labels, Kontrast, Fokuszustände |

## Guarding und Layouts

| Layout | Zugriff |
| --- | --- |
| Public Layout | Standortsuche und Standdetails |
| Customer Auth Layout | Orders und QR-Code |
| Admin Layout | Rolle `producer_admin` |
| Staff Layout | Rolle `staff` und Stand-Zuordnung |
| Platform Layout | Rolle `platform_admin`, falls umgesetzt |

Jede geschützte Route prüft Session serverseitig. Clientseitige Redirects sind nur zusätzlicher Komfort.
