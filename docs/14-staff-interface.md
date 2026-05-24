# Mitarbeiteransicht

Die Mitarbeiteransicht ist eine mobile-first Weboberfläche für den Standbetrieb. Sie muss mit wenig Text, großen Bedienelementen und schwankender Netzqualität funktionieren.

## Ziel

Stand-Mitarbeiter sollen drei Aufgaben schnell erledigen:

1. Offene Bestellungen sehen.
2. QR-Code-Abholungen bestätigen.
3. Bestand am Stand aktualisieren.

Die Oberfläche darf keine Admin-Komplexität enthalten. Preise, Produktstammdaten und standübergreifende Auswertungen sind nicht Teil der Mitarbeiteransicht.

## Mobile-first Bedienung

| Prinzip | Umsetzung |
| --- | --- |
| Große Touch-Ziele | Primäre Buttons mindestens 44 px hoch |
| Wenig Text | Kurze Labels, klare Statusfarben |
| Schnelle Aktionen | QR-Scan und offene Bestellungen auf Startseite |
| Ein Stand-Kontext | Mitarbeiter sieht nur zugewiesene Stände |
| Fehler robust behandeln | Fallback-Codeeingabe und Wiederholen-Button |

## Seitenstruktur

| Route | Zweck |
| --- | --- |
| `/staff` | Startseite mit Stand-Auswahl, offenen Abholungen und Schnellaktionen |
| `/staff/orders` | Liste offener Bestellungen |
| `/staff/orders/{orderId}` | Bestelldetail und Abholung bestätigen |
| `/staff/scan` | QR-Code-Scan |
| `/staff/inventory` | Bestand aktualisieren |
| `/staff/delivery` | Lieferung eingetroffen erfassen |

## Offene Bestellungen

Die Liste zeigt nur Orders des zugewiesenen Standes mit Status `confirmed` oder `ready_for_pickup`.

Sortierung:

```text
pickup_slot_start ASC
```

Karteninhalt je Bestellung:

| Element | Inhalt |
| --- | --- |
| Zeitfenster | Start-Ende |
| Order-Code | Kurzer Fallback-Code |
| Produkte | Produktname, Menge, Einheit |
| Status | `confirmed` oder `ready_for_pickup` |
| Aktion | Details öffnen oder Abholung bestätigen |

## QR-Code-Scan

Scan-Ablauf:

1. Mitarbeiter tippt auf `QR scannen`.
2. Browser fragt Kamerazugriff an.
3. QR-Code wird gelesen.
4. App sendet Token an `/api/v1/staff/scan`.
5. Backend prüft Token, Stand-Zuordnung und Order-Status.
6. App zeigt Bestelldetails.
7. Mitarbeiter übergibt Ware.
8. Mitarbeiter bestätigt Abholung.
9. Backend setzt Order auf `picked_up`.

Fehlerzustände:

| Fehler | Anzeige |
| --- | --- |
| Token ungültig | `QR-Code ungültig` |
| Token abgelaufen | `Abholcode abgelaufen` |
| Token schon genutzt | Zeitpunkt der Nutzung anzeigen |
| Falscher Stand | `Bestellung gehört nicht zu diesem Stand` |
| Payment offen | `Bestellung ist nicht bezahlt` |

## Abholung bestätigen

Die Bestätigung muss bewusst erfolgen, aber nicht umständlich sein.

Empfohlene UI:

1. Bestellung mit Produktliste anzeigen.
2. Großer Button `Abholung bestätigen`.
3. Optionaler zweiter Schritt nur bei Abweichung.
4. Erfolgsmeldung mit Status `picked_up`.

Backend-Aktionen:

| Schritt | Aktion |
| --- | --- |
| Order prüfen | Status `confirmed` oder `ready_for_pickup` |
| QRToken prüfen | `active`, nicht abgelaufen, nicht genutzt |
| Bestand ändern | `stock_quantity` und `reserved_quantity` reduzieren |
| Event schreiben | InventoryEvent `pickup` |
| Token schließen | QRToken `used` und `used_at` setzen |

## Bestand aktualisieren

Mitarbeiter dürfen nur Bestand des eigenen Standes ändern.

MVP-Aktionen:

| Aktion | Wirkung |
| --- | --- |
| Bestand setzen | `stock_quantity` auf gezählten Wert setzen |
| Bestand erhöhen | Lieferung oder Korrektur |
| Bestand reduzieren | Bruch, Verderb oder Zählkorrektur |
| Ausverkauft | Produktstatus `out_of_stock`, verfügbare Menge 0 |
| Lieferung eingetroffen | Bestand erhöhen und `next_delivery_at` leeren oder aktualisieren |

Jede Aktion erzeugt ein InventoryEvent mit `actor_id`.

## Out-of-Stock Button

Der Out-of-Stock Button ist wichtig, weil er bei manueller Bestandspflege schnell Fehlreservierungen verhindert.

Regeln:

| Regel | Umsetzung |
| --- | --- |
| Nur eigener Stand | RBAC-Prüfung |
| Bestehende bestätigte Reservierungen bleiben sichtbar | Mitarbeiter muss Abholungen erfüllen oder Admin klärt Problem |
| Neue Reservierungen stoppen | Inventory Status wird `out_of_stock` |
| Ereignis protokollieren | InventoryEvent `out_of_stock` |

## Lieferung eingetroffen

Bei Lieferung kann der Mitarbeiter schnell die neue Menge erfassen.

Formular:

| Feld | Pflicht | Beschreibung |
| --- | --- | --- |
| Produkt | Ja | Produkt des eigenen Standes |
| Menge | Ja | Gelieferte Menge |
| Neuer Gesamtbestand | Optional | Alternative zu Delta |
| Notiz | Optional | z. B. Fahrer, Qualität, Korrektur |

## Schlechte Netzabdeckung berücksichtigen

Der MVP ist nicht vollständig offline-first, muss aber schlechte Netze tolerieren.

| Problem | MVP-Gegenmaßnahme |
| --- | --- |
| QR-Scan lädt langsam | Kurze API-Antworten, Ladezustand, Wiederholen |
| Kamera funktioniert nicht | Manuelle Codeeingabe |
| Verbindung bricht bei Bestätigung ab | Idempotenter Pickup-Endpunkt |
| Bestand kann nicht gespeichert werden | Fehlermeldung und erneuter Speichern-Button |
| Mitarbeiter verliert Kontext | Stand-Auswahl und Session klar anzeigen |

## UX-Anforderungen

| Anforderung | Konkretisierung |
| --- | --- |
| Große Buttons | Primäraktionen über volle Breite |
| Wenig Text | Bestellkarten mit Zeit, Code, Produkten |
| Schnelle Bedienung | Maximal zwei Schritte vom Start zum Scan |
| Klare Statusfarben | Offen, bestätigt, abgeholt, Fehler |
| Keine Admin-Sprache | Keine komplexen Metriken oder Berichte |
| Robustheit | Fallback-Code immer erreichbar |
