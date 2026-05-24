# User Stories

Die User Stories priorisieren den garantierten Reservierungsflow und die operative Erfüllung am Stand. Prioritäten werden als `Must`, `Should`, `Could` und `Later` geführt.

## Kunde

| ID | User Story | Priorität |
| --- | --- | --- |
| K-01 | Als Kunde möchte ich Stände in meiner Nähe sehen, damit ich weiß, wo ich einkaufen kann. | Must |
| K-02 | Als Kunde möchte ich Produkte je Stand sehen, damit ich weiß, was angeboten wird. | Must |
| K-03 | Als Kunde möchte ich sehen, ob ein Produkt verfügbar ist, damit ich nicht umsonst fahre. | Must |
| K-04 | Als Kunde möchte ich eine Menge reservieren, damit die Ware für mich zurückgelegt wird. | Must |
| K-05 | Als Kunde möchte ich ein Abholzeitfenster wählen, damit ich meine Abholung planen kann. | Must |
| K-06 | Als Kunde möchte ich digital bezahlen, damit die Reservierung verbindlich ist und ich kein Bargeld brauche. | Must |
| K-07 | Als Kunde möchte ich einen QR-Code erhalten, damit ich die Ware schnell abholen kann. | Must |
| K-08 | Als Kunde möchte ich meine Bestellung ansehen, damit ich Status, Zeitfenster und Abholcode finde. | Must |
| K-09 | Als Kunde möchte ich frühzeitig stornieren können, falls ich nicht kommen kann. | Should |
| K-10 | Als Kunde möchte ich zur Karten-App wechseln können, damit ich den Stand finde. | Should |
| K-11 | Als Kunde möchte ich benachrichtigt werden, wenn Ware wieder verfügbar ist. | Later |
| K-12 | Als Kunde möchte ich optional WhatsApp-Benachrichtigungen aktivieren, damit ich wichtige Bestellinformationen direkt erhalte. | Should |
| K-13 | Als Kunde möchte ich nach der Reservierung eine WhatsApp-Bestätigung erhalten, damit ich meine Bestellung schnell wiederfinde. | Should |
| K-14 | Als Kunde möchte ich vor meinem Abholfenster per WhatsApp erinnert werden, damit ich die Ware rechtzeitig abhole. | Should |
| K-15 | Als Kunde möchte ich einen Link zu meinem QR-Code per WhatsApp erhalten, damit ich ihn am Stand schnell öffnen kann. | Should |
| K-16 | Als Kunde möchte ich über relevante Änderungen per WhatsApp informiert werden, z. B. bei Lieferverzögerung. | Should |

## Spargelbauer/Admin

| ID | User Story | Priorität |
| --- | --- | --- |
| A-01 | Als Spargelbauer/Admin möchte ich Stände anlegen und bearbeiten. | Must |
| A-02 | Als Spargelbauer/Admin möchte ich Produkte und Preise pflegen. | Must |
| A-03 | Als Spargelbauer/Admin möchte ich Bestände je Stand aktualisieren. | Must |
| A-04 | Als Spargelbauer/Admin möchte ich Reservierungen je Standort sehen. | Must |
| A-05 | Als Spargelbauer/Admin möchte ich Nachfrage je Produkt und Zeitraum sehen. | Must |
| A-06 | Als Spargelbauer/Admin möchte ich einfache Lieferempfehlungen erhalten. | Should |
| A-07 | Als Spargelbauer/Admin möchte ich Umsätze nach Standort sehen. | Should |
| A-08 | Als Spargelbauer/Admin möchte ich Mitarbeiter je Stand verwalten. | Should |
| A-09 | Als Spargelbauer/Admin möchte ich Buchhaltungsdaten exportieren. | Later |
| A-10 | Als Spargelbauer/Admin möchte ich sehen können, ob Kunden WhatsApp-Benachrichtigungen aktiviert haben. | Should |
| A-11 | Als Spargelbauer/Admin möchte ich, dass Kunden automatisch an Abholungen erinnert werden, damit No-shows reduziert werden. | Should |
| A-12 | Als Spargelbauer/Admin möchte ich bei Lieferverzögerungen Kunden informieren können. | Should |

## Stand-Mitarbeiter

| ID | User Story | Priorität |
| --- | --- | --- |
| S-01 | Als Stand-Mitarbeiter möchte ich offene Bestellungen meines Standes sehen. | Must |
| S-02 | Als Stand-Mitarbeiter möchte ich QR-Codes scannen, um Abholungen zu prüfen. | Must |
| S-03 | Als Stand-Mitarbeiter möchte ich Abholungen bestätigen, damit Bestellungen abgeschlossen werden. | Must |
| S-04 | Als Stand-Mitarbeiter möchte ich Bestand manuell ändern. | Must |
| S-05 | Als Stand-Mitarbeiter möchte ich Produkte als ausverkauft markieren. | Must |
| S-06 | Als Stand-Mitarbeiter möchte ich eine Lieferung als eingetroffen erfassen. | Should |
| S-07 | Als Stand-Mitarbeiter möchte ich Bestellungen per manuellem Code finden, falls der QR-Scan nicht funktioniert. | Should |

## Plattformadmin

| ID | User Story | Priorität |
| --- | --- | --- |
| P-01 | Als Plattformadmin möchte ich Produzenten verwalten. | Should |
| P-02 | Als Plattformadmin möchte ich Supportfälle zu Bestellungen und Zahlungen prüfen. | Should |
| P-03 | Als Plattformadmin möchte ich Plattformgebühren konfigurieren. | Should |
| P-04 | Als Plattformadmin möchte ich Payment- und Webhook-Fehler sehen. | Should |
| P-05 | Als Plattformadmin möchte ich WhatsApp-Templates verwalten oder dokumentieren können. | Should |
| P-06 | Als Plattformadmin möchte ich Versandfehler einsehen können. | Should |
| P-07 | Als Plattformadmin möchte ich nachvollziehen können, welche Benachrichtigungen zu einer Bestellung versendet wurden. | Should |

## Akzeptanzkriterien zentraler User Stories

### K-01 Standortsuche

Akzeptanzkriterien:

1. Die App fragt den Standort an oder erlaubt manuelle Standortsuch-Eingabe.
2. Stände werden nach Entfernung sortiert.
3. Jeder Stand zeigt Name, Status, Entfernung und zentrale Verfügbarkeitsindikatoren.
4. Geschlossene Stände werden erkennbar als `closed` angezeigt.
5. Stände in `seasonal_pause` sind auffindbar, aber nicht reservierbar.

### K-03 Produktverfügbarkeit

Akzeptanzkriterien:

1. Produktverfügbarkeit wird je StandProduct berechnet.
2. Die Anzeige verwendet die Statuswerte `available`, `low_stock`, `out_of_stock`, `next_delivery_expected`.
3. Die verfügbare Menge basiert auf `stock_quantity - reserved_quantity - safety_buffer`.
4. Produkte mit `out_of_stock` können nicht reserviert werden.
5. Bei `next_delivery_expected` wird die nächste gepflegte Lieferzeit angezeigt.

### K-04/K-05 Reservierung

Akzeptanzkriterien:

1. Kunde kann Produkt, Menge und Abholzeitfenster auswählen.
2. Das Backend prüft verfügbare Menge unmittelbar vor Erstellung der Reservierung.
3. Bei ausreichender Menge entsteht eine Order mit Status `pending_payment`.
4. Die gewünschte Menge erhöht `reserved_quantity` temporär.
5. Bei unzureichender Menge gibt die API einen fachlichen Fehler zurück.

### K-06 Zahlung

Akzeptanzkriterien:

1. Checkout wird nur für eigene Orders im Status `pending_payment` gestartet.
2. Payment wird mit `pending` gespeichert.
3. Der Stripe Webhook setzt Payment auf `succeeded` oder `failed`.
4. Bei `succeeded` wechselt die Order auf `confirmed`.
5. Bei `failed` oder abgelaufenem Checkout wird die reservierte Menge freigegeben.

### K-07 QR-Code-Abholung

Akzeptanzkriterien:

1. QRToken wird erst nach erfolgreicher Zahlung erzeugt.
2. QR-Code enthält keine Kundendaten und keine Produktdetails.
3. QRToken ist signiert, gehasht gespeichert, zeitlich begrenzt und nur einmal nutzbar.
4. Nach erfolgreichem Scan sieht der Stand-Mitarbeiter die Bestellung.
5. Nach Bestätigung wird Order auf `picked_up` gesetzt.

### K-12 bis K-16 WhatsApp Order Updates

Akzeptanzkriterien:

1. Kunde kann WhatsApp-Benachrichtigungen aktivieren oder deaktivieren.
2. Telefonnummer wird validiert oder mindestens plausibilisiert.
3. WhatsApp-Opt-in wird mit Zeitpunkt gespeichert.
4. Nach erfolgreicher Zahlung wird bei aktivem Opt-in eine WhatsApp-Bestätigung versendet.
5. Vor dem Abholfenster wird bei aktivem Opt-in eine Abholerinnerung geplant und versendet.
6. WhatsApp-Nachricht enthält einen sicheren Link zur Bestellung oder QR-Code-Seite.
7. Der Link enthält keinen unsicheren Roh-Token.
8. Versandstatus wird gespeichert.
9. Fehlgeschlagene Nachrichten sind für Admins sichtbar.
10. Bestellung, Zahlung und QR-Abholung funktionieren vollständig ohne WhatsApp.

### A-10 bis A-12 WhatsApp im Admin-Kontext

Akzeptanzkriterien:

1. Admin sieht in der Bestelldetailansicht, ob WhatsApp-Opt-in aktiv ist.
2. Admin sieht keine vollständigen Telefonnummern, wenn sie für den operativen Zweck nicht nötig sind.
3. Automatische Abholerinnerungen werden aus Order Events oder geplanten Jobs ausgelöst.
4. Bei Lieferverzögerung kann der Admin eine dokumentierte Statusnachricht auslösen.
5. Jede ausgelöste Benachrichtigung erzeugt einen Notification-Eintrag.

### P-05 bis P-07 Notification Governance

Akzeptanzkriterien:

1. Plattformadmin kann dokumentierte WhatsApp-Template-Keys einsehen.
2. Plattformadmin sieht fehlgeschlagene Benachrichtigungen kanalübergreifend.
3. Benachrichtigungen sind je Order nachvollziehbar.
4. Provider-Fehler werden ohne unnötige personenbezogene Daten gespeichert.

### A-03 Admin-Dashboard Bestand

Akzeptanzkriterien:

1. Admin sieht Bestand je Stand und Produkt.
2. Admin kann `stock_quantity`, `safety_buffer` und `next_delivery_at` pflegen.
3. Jede Änderung erzeugt ein InventoryEvent.
4. Admin kann Produkte als `out_of_stock` markieren.
5. Änderungen wirken sofort auf Kundensuche und Reservierungsprüfung.

### S-01/S-02 Mitarbeiteransicht

Akzeptanzkriterien:

1. Mitarbeiter sieht nur Bestellungen der zugewiesenen Stände.
2. Offene Bestellungen sind nach Abholzeit sortiert.
3. QR-Scan validiert Token und Status serverseitig.
4. Bereits verwendete QRToken werden abgelehnt.
5. Manuelle Codeeingabe ist als Fallback möglich.
