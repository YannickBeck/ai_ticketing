# Admin-Dashboard

Das Admin-Dashboard ist die operative Oberfläche für den Spargelbauer/Admin. Es muss Bestände, Reservierungen und Nachfrage schnell verständlich machen, ohne ein komplexes BI-System zu werden.

## Ziel

Der Spargelbauer/Admin soll täglich entscheiden können:

| Frage | Dashboard-Antwort |
| --- | --- |
| Welche Stände laufen gut? | Reservierungen und Umsatz je Stand |
| Wo wird Ware knapp? | Kritische Bestände und `low_stock` Produkte |
| Welche Bestellungen sind noch offen? | Offene Abholungen nach Zeitfenster |
| Wohin soll nachgeliefert werden? | Regelbasierte Lieferempfehlungen |
| Welche Produkte verkaufen sich? | Nachfrage je Produkt und Zeitraum |

## Seitenstruktur

| Route | Seite | Zweck |
| --- | --- | --- |
| `/admin` | Dashboard | Tagesübersicht |
| `/admin/stands` | Stände | Standorte, Öffnungszeiten, Status |
| `/admin/products` | Produkte | Sortiment, Preise, Einheiten, Sichtbarkeit |
| `/admin/inventory` | Bestand | Bestand je Stand und Produkt pflegen |
| `/admin/orders` | Reservierungen | Bestellungen, Zahlung, Abholung |
| `/admin/notifications` | Benachrichtigungen | Versandstatus, Fehler und Opt-in-Auswertung |
| `/admin/delivery` | Lieferplanung | Lieferempfehlungen und geplante Lieferungen |
| `/admin/revenue` | Umsätze | Warenumsatz, Service Fee, Payment Status |
| `/admin/staff` | Mitarbeiter | Benutzer, Rollen und Stand-Zuordnung |

## Kernansichten

### Dashboard

Kennzahlen:

| Kennzahl | Beschreibung |
| --- | --- |
| Reservierungen heute | Anzahl, Warenwert, Service Fees |
| Offene Abholungen | Bestellungen in `confirmed` oder `ready_for_pickup` |
| Kritisch niedrige Bestände | Inventory Status `low_stock` |
| Ausverkaufte Produkte | Inventory Status `out_of_stock` |
| Nächste Lieferempfehlungen | Priorisierte Stand-Produkt-Kombinationen |
| Digitale Umsätze | Summe nach Zeitraum |
| Payment-Probleme | Zahlungen in `failed` oder ungewöhnlich lange `pending` |
| Notification-Probleme | Fehlgeschlagene WhatsApp- oder E-Mail-Nachrichten |

Layout:

1. Obere KPI-Leiste.
2. Linke Tabelle: offene Abholungen nach Zeit.
3. Rechte Tabelle: kritische Bestände.
4. Unterer Bereich: Lieferempfehlungen und Umsatztrend.

### Stände

Tabelle:

| Spalte | Inhalt |
| --- | --- |
| Name | Standname |
| Adresse | Kurzadresse |
| Status | `open`, `closed`, `seasonal_pause` |
| Öffnungszeiten | Heute und nächster Öffnungstag |
| Offene Orders | Anzahl |
| Kritische Produkte | Anzahl `low_stock` und `out_of_stock` |
| Aktionen | Bearbeiten, Status ändern, QR-Code anzeigen |

Formularfelder:

| Feld | Anforderung |
| --- | --- |
| Name | Pflicht |
| Adresse | Pflicht |
| Latitude/Longitude | Pflicht, aus Adresse oder manuell |
| Öffnungszeiten | Wochenplan |
| Status | Einer der Stand-Statuswerte |
| Öffentliche Notiz | Optional |

### Produkte

Tabelle:

| Spalte | Inhalt |
| --- | --- |
| Name | Produktname |
| Kategorie | Spargel, Erdbeeren usw. |
| Einheit | kg, Schale, Bund |
| Preis | Cent-basiert gespeichert, in EUR angezeigt |
| Aktiv | Sichtbarkeit |
| Stände | Anzahl aktiver Inventory-Zuordnungen |

### Bestand

Die Bestandsansicht ist die wichtigste Admin-Arbeitsfläche im MVP.

Tabelle:

| Spalte | Inhalt |
| --- | --- |
| Stand | Standname |
| Produkt | Produktname |
| Gemeldeter Bestand | `stock_quantity` |
| Reserviert | `reserved_quantity` |
| Sicherheitsbestand | `safety_buffer` |
| Verfügbar | Berechnete `available_quantity` |
| Status | `available`, `low_stock`, `out_of_stock`, `next_delivery_expected` |
| Nächste Lieferung | `next_delivery_at` |
| Aktionen | Bestand ändern, Lieferung erfassen, ausverkauft |

Bestandsupdate:

1. Admin öffnet Bearbeitung.
2. Admin gibt neuen Bestand oder Delta ein.
3. System zeigt berechnete verfügbare Menge.
4. Admin bestätigt.
5. InventoryEvent wird gespeichert.
6. Status wird neu berechnet.

### Reservierungen

Filter:

| Filter | Werte |
| --- | --- |
| Datum | Heute, morgen, Zeitraum |
| Stand | Eigene Stände |
| Status | Alle Order-Statuswerte |
| Payment | Alle Payment-Statuswerte |
| Produkt | Produktliste |

Tabellenspalten:

| Spalte | Inhalt |
| --- | --- |
| Order | `order_number` |
| Kunde | Name oder gekürzte E-Mail |
| Stand | Abholstand |
| Zeitfenster | Start und Ende |
| Produkte | Kompakte Positionsliste |
| Order Status | Status |
| Payment Status | Status |
| QR Status | Aktiv, genutzt, abgelaufen |
| WhatsApp Opt-in | Aktiv, deaktiviert oder nicht vorhanden |
| Notification Status | Letzte Nachricht und Fehlerstatus |
| Aktionen | Details, Storno, Refund bei Berechtigung, Statusnachricht bei Lieferverzögerung |

### Benachrichtigungen

Die Benachrichtigungsansicht ist im MVP kein Marketingtool, sondern ein operatives Log für transaktionale Nachrichten.

Filter:

| Filter | Werte |
| --- | --- |
| Kanal | `email`, `whatsapp`, später `push` |
| Status | `pending`, `sent`, `delivered`, `failed`, `cancelled` |
| Typ | Bestätigung, Abholerinnerung, Statusänderung, Abholabschluss |
| Stand | Eigene Stände |
| Zeitraum | Heute, morgen, frei wählbar |

Tabellenspalten:

| Spalte | Inhalt |
| --- | --- |
| Zeitpunkt | `created_at`, `scheduled_at`, `sent_at` |
| Order | `order_number` |
| Kanal | E-Mail oder WhatsApp |
| Template | `template_key` |
| Empfänger | Maskierte E-Mail oder Telefonnummer |
| Status | Versand- und Zustellstatus |
| Fehler | Gekürzte Fehlermeldung |

Admins sehen nur Benachrichtigungen zu eigenen Ständen. Plattformadmins können kanalübergreifend Fehler analysieren und Template-Keys dokumentieren.

### Lieferplanung

Die Lieferplanung bleibt im MVP regelbasiert.

Input:

| Datenpunkt | Quelle |
| --- | --- |
| Bestätigte Reservierungen | Orders mit `confirmed` oder `ready_for_pickup` |
| Offene Abholfenster | PickupSlot und Order |
| Aktueller Bestand | Inventory |
| Sicherheitsbestand | Inventory |
| Nächste Lieferung | `next_delivery_at` |

Empfehlungsformel:

```text
recommended_quantity =
confirmed_reservations_until_time
+ expected_walk_in_buffer
+ safety_buffer
- stock_quantity
```

Im MVP kann `expected_walk_in_buffer` ein einfacher konfigurierbarer Wert je Stand und Produkt sein.

### Umsätze

Kennzahlen:

| Kennzahl | Beschreibung |
| --- | --- |
| Warenumsatz | Summe `product_total_cents` |
| Service Fee | Summe `service_fee_cents` |
| Gesamtumsatz | Summe `total_amount_cents` |
| Erfolgreiche Zahlungen | Payment `succeeded` |
| Erstattungen | Payment `refunded` |
| Umsatz je Stand | Gruppiert nach Stand |
| Umsatz je Produkt | Gruppiert nach OrderItem |

### Mitarbeiter

Funktionen:

| Funktion | MVP-Umfang |
| --- | --- |
| Mitarbeiter anlegen | Name, E-Mail, Rolle `staff` |
| Stand zuweisen | Ein oder mehrere Stände |
| Zugriff deaktivieren | `active=false` |
| Passwort/Magic-Link-Prozess | Über Auth-Lösung |

## Tabellen und Kennzahlen

Die wichtigsten Tabellen im Dashboard:

| Tabelle | Primärer Nutzerzweck |
| --- | --- |
| Offene Abholungen | Standbetrieb steuern |
| Kritische Bestände | Nachlieferung entscheiden |
| Reservierungen | Support und operative Kontrolle |
| Notifications | Versandstatus und WhatsApp-Fehler nachvollziehen |
| Inventory Events | Änderungen nachvollziehen |
| Umsätze | Pilotmetriken auswerten |

## MVP vs. Phase 2

| Thema | MVP | Phase 2 |
| --- | --- | --- |
| Nachfrage | Einfache Aggregation nach Stand, Produkt, Zeitraum | Erweiterte Analytics und Prognose |
| Lieferplanung | Regelbasiert | Prognosegestützt mit historischen Daten |
| Umsätze | Basisübersicht | Buchhaltungs- und DATEV-Export |
| Bestände | Manuelle Pflege | POS-Integration |
| Reporting | Operative Tabellen | Data Warehouse und Dashboards |
| Benachrichtigung | E-Mail-Bestätigung plus optionale WhatsApp Order Updates als P1 | Push, Statusabfrage und Conversational Commerce |

## UX-Anforderungen

| Anforderung | Umsetzung |
| --- | --- |
| Schnelle Tagessteuerung | Dashboard zeigt operative Probleme zuerst |
| Keine überfrachtete BI-Oberfläche | Fokus auf Reservierungen, Bestand, Lieferempfehlung |
| Tablet-tauglich | Tabellen mit horizontaler Scroll-Unterstützung |
| Fehler sichtbar machen | Payment- und Inventory-Probleme prominent markieren |
| Benachrichtigungsfehler sichtbar machen | Fehlgeschlagene WhatsApp-Nachrichten in der Order und im Notification Log markieren |
| Auditierbarkeit | Kritische Aktionen zeigen letzten Änderer und Zeitpunkt |
