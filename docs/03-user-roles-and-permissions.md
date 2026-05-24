# Rollen und Berechtigungen

Das Rollenmodell muss serverseitig durchgesetzt werden. UI-Ausblendungen sind nur Komfort, aber keine Sicherheitsgrenze. Jede API-Anfrage prüft Authentifizierung, Rolle und Ressourcenbesitz.

## Rollen

### Kunde

Kunden nutzen die öffentliche Produktsuche und verwalten nur eigene Reservierungen.

| Recht | Umfang |
| --- | --- |
| Stände ansehen | Alle aktiven Stände mit Status `open`, `closed` oder `seasonal_pause` |
| Produkte ansehen | Sichtbare Produkte je Stand |
| Reservierung erstellen | Nur für sich selbst |
| Zahlung starten | Nur für eigene Bestellung |
| QR-Code abrufen | Nur für eigene bestätigte Bestellung |
| Benachrichtigungseinstellungen ändern | Nur eigene Präferenzen, inklusive WhatsApp Opt-in/Opt-out |
| Bestellbenachrichtigungen sehen | Nur eigene Bestellung |
| Storno anfragen | Nur eigene Bestellungen nach Stornoregel |
| Bestand ändern | Nicht erlaubt |
| Lieferplanung sehen | Nicht erlaubt |

### Spargelbauer/Admin

Der Spargelbauer/Admin verwaltet Daten des eigenen Produzenten.

| Recht | Umfang |
| --- | --- |
| Stände verwalten | Nur Stände des eigenen `producer_id` |
| Produkte und Preise verwalten | Nur Produkte des eigenen `producer_id` |
| Bestände ändern | Nur eigene Stände und Produkte |
| Reservierungen einsehen | Nur Reservierungen eigener Stände |
| Notification-Status sehen | Nur Benachrichtigungen zu Orders eigener Stände |
| Kunden über Lieferverzögerung informieren | Nur über freigegebene Templates und eigene Orders |
| Mitarbeiter verwalten | Nur Mitarbeiter des eigenen Betriebs |
| Lieferplanung sehen | Nur eigene Stände |
| Umsätze sehen | Nur eigene Transaktionen und Gebührenanteile |
| Plattformweite Daten sehen | Nicht erlaubt |

### Stand-Mitarbeiter

Stand-Mitarbeiter arbeiten am konkreten Stand und erhalten bewusst wenige Rechte.

| Recht | Umfang |
| --- | --- |
| Eigener Stand einsehen | Nur zugewiesene Stände |
| Offene Bestellungen sehen | Nur Bestellungen des eigenen Standes |
| QR-Code scannen | Nur Bestell-QRToken für eigenen Stand |
| Abholung bestätigen | Nur gültige Bestellungen im passenden Status |
| Bestand aktualisieren | Nur Produkte des eigenen Standes |
| Produkt als ausverkauft markieren | Nur eigener Stand |
| Preise ändern | Nicht erlaubt im MVP |
| Umsätze gesamt sehen | Nicht erlaubt |

### Plattformadmin

Der Plattformadmin ist für Betrieb, Support und Konfiguration zuständig. Diese Rolle sollte nur für interne Benutzer existieren und besonders geschützt sein.

| Recht | Umfang |
| --- | --- |
| Produzenten verwalten | Alle Produzenten |
| Gebührenmodell konfigurieren | Plattformweite Service Fee und Pilotkonditionen |
| Supportfälle prüfen | Bestellungen, Payments und QRToken mit Audit Log |
| Payment- und Fehlerlogs sehen | Technische und operative Diagnose |
| Notification Templates dokumentieren | Plattformweite WhatsApp- und E-Mail-Template-Keys |
| Notification Logs sehen | Plattformweite Versandstatus und Fehlerdiagnose |
| Refunds auslösen | Nach dokumentierter Supportentscheidung |
| Systemmonitoring sehen | Plattformweit |

## Zugriffsmatrix

| Funktion | Kunde | Spargelbauer/Admin | Stand-Mitarbeiter | Plattformadmin |
| --- | --- | --- | --- | --- |
| Stände suchen | Ja | Ja | Eingeschränkt | Ja |
| Standdetails ansehen | Ja | Eigene | Zugewiesene | Alle |
| Stand anlegen/bearbeiten | Nein | Eigene | Nein | Alle |
| Produkte ansehen | Ja | Eigene | Zugewiesene | Alle |
| Produkte anlegen/bearbeiten | Nein | Eigene | Nein | Alle |
| Preise ändern | Nein | Eigene | Nein | Alle |
| Bestand ändern | Nein | Eigene | Zugewiesene | Alle |
| Bestellung erstellen | Eigene | Nein | Nein | Supportfall |
| Eigene Bestellungen sehen | Ja | Nein | Nein | Supportfall |
| Stand-Bestellungen sehen | Nein | Eigene Stände | Zugewiesene Stände | Alle |
| Zahlung starten | Eigene | Nein | Nein | Nein |
| Notification-Präferenzen ändern | Eigene | Nein | Nein | Supportfall |
| Notification Logs sehen | Eigene Order | Eigene Stände | Nein | Alle |
| WhatsApp-Statusnachricht auslösen | Nein | Eigene Orders | Nein | Alle |
| Refund auslösen | Nein | Anfrage/optional | Nein | Ja |
| QR-Code anzeigen | Eigene Bestellung | Supportansicht | Scan-Ergebnis | Supportansicht |
| QR-Code scannen | Nein | Optional | Ja | Ja |
| Abholung bestätigen | Nein | Optional | Ja | Ja |
| Lieferempfehlungen sehen | Nein | Eigene Stände | Optional nur eigener Stand | Alle |
| Mitarbeiter verwalten | Nein | Eigene | Nein | Alle |
| Gebührenmodell verwalten | Nein | Nein | Nein | Ja |
| Audit Logs sehen | Nein | Eigene Ereignisse optional | Nein | Alle |

## Sicherheitsregeln für rollenbasierte Zugriffe

| Regel | Umsetzung |
| --- | --- |
| Authentifizierung ist Pflicht für geschützte Endpunkte | Session/JWT wird serverseitig validiert |
| Ressourcenbesitz wird immer geprüft | `producer_id`, `stand_id`, `customer_id` werden gegen Session Claims geprüft |
| Staff-Zugriff ist standgebunden | Mitarbeiter erhalten eine Liste erlaubter `stand_id` oder eine Zuordnungstabelle |
| Plattformadmin ist getrennt von Produzentenrolle | Keine automatische Plattformberechtigung für Admins |
| Payment Webhooks verwenden keine Benutzerrolle | Webhook-Signatur und Provider-Event-ID sind die Sicherheitsgrenze |
| WhatsApp Webhooks verwenden keine Benutzerrolle | Provider-Signatur, Idempotenz und minimale Payload-Speicherung sind Pflicht |
| QRToken geben keine sensiblen Daten preis | QR enthält nur Token, keine Kundendaten oder Warenkorbinhalte |
| WhatsApp-Links sind sicher begrenzt | Nachrichten enthalten nur signierte, zeitlich begrenzte Links oder Links, die eine authentifizierte Session erfordern |
| Schreibaktionen erzeugen Audit Logs | Bestand, Pickup, Refund, Rollenänderungen und Payment-Status werden protokolliert |
| Statusübergänge sind eingeschränkt | Order- und Payment-Status dürfen nur über definierte Services geändert werden |
| Mandantentrennung ist Pflicht | Jede Admin-Query filtert nach `producer_id`, bevor Daten zurückgegeben werden |
| Rate Limiting schützt öffentliche und QR-Endpunkte | Besonders Login, Bestellung, Scan und Webhooks |

## Statuswerte

| Objekt | Erlaubte Statuswerte |
| --- | --- |
| Order | `draft`, `pending_payment`, `confirmed`, `ready_for_pickup`, `picked_up`, `cancelled`, `expired`, `refunded` |
| Payment | `pending`, `succeeded`, `failed`, `refunded` |
| Inventory | `available`, `low_stock`, `out_of_stock`, `next_delivery_expected` |
| Stand | `open`, `closed`, `seasonal_pause` |
| Notification | `pending`, `sent`, `delivered`, `failed`, `cancelled` |
