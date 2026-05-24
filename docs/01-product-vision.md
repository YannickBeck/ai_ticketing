# Produktvision

Die Spargelstand-App digitalisiert dezentrale landwirtschaftliche Verkaufsstände, zuerst für Spargel- und Erdbeerstände. Kunden sollen vor der Fahrt sehen, welcher Stand geöffnet ist, welche Produkte verfügbar sind und ob eine gewünschte Menge verbindlich reserviert werden kann.

Der Produktkern ist keine reine Verfügbarkeitsanzeige. Der zentrale Wert ist die garantierte Reservierung: Wenn ein Kunde bezahlt und ein Abholzeitfenster erhält, muss die reservierte Ware am Stand verfügbar sein.

## Problem

| Zielgruppe | Heutiges Problem | Auswirkung |
| --- | --- | --- |
| Kunde | Verfügbarkeit am Stand ist unklar | Fehlfahrten, Bargeldbedarf, Wartezeit und Frust |
| Produzent | Nachfrage je Standort ist nur grob sichtbar | Unterlieferung an starken Ständen und Überbestand an schwachen Ständen |
| Stand-Mitarbeiter | Reservierungen und Bestände werden manuell oder uneinheitlich verwaltet | Hohe Fehleranfälligkeit und wenig Transparenz |
| Plattformbetreiber | Keine digitale Prozesskette von Nachfrage bis Abholung | Kein belastbares Nutzungs- und Gebührenmodell |

## Lösung

Die App verbindet fünf Kernfunktionen zu einem durchgängigen Pickup-Prozess:

1. Standortsuche mit Karte, Liste und Öffnungsstatus.
2. Produktverfügbarkeit je Stand auf Basis der Inventory Engine.
3. Verbindliche Reservierung mit Abholzeitfenster.
4. Digitale Zahlung inklusive Service Fee.
5. QR-Code-Abholung mit One-Time-Use-Validierung.

Für Produzenten entsteht zusätzlich ein Admin-Dashboard für Stände, Produkte, Bestände, Reservierungen, Nachfrage und einfache Lieferempfehlungen. Stand-Mitarbeiter erhalten eine mobile Webansicht für QR-Scan, offene Bestellungen und schnelle Bestandsupdates.

WhatsApp wird im MVP als optionaler Bestellbegleiter ergänzt. Kunden können aktiv einwilligen, transaktionale Informationen zu ihrer Bestellung per WhatsApp zu erhalten, zum Beispiel Bestellbestätigung, Zahlungsbestätigung, Abholerinnerung, einen sicheren Link zur QR-Code-Seite, relevante Statusänderungen und eine Abholbestätigung nach erfolgreicher Übergabe. Die Reservierung, Zahlung und QR-Abholung bleiben vollständig in der App/PWA. WhatsApp ist im MVP kein vollständiger Bestellkanal.

## Zielgruppen

| Zielgruppe | Hauptziel | MVP-Anforderung |
| --- | --- | --- |
| Kunde | Ware sicher bekommen, ohne umsonst zu fahren | Standortsuche, Produktverfügbarkeit, Reservierung, Zahlung, QR-Code |
| Spargelbauer/Admin | Standorte und Ware besser steuern | Admin-Dashboard, manuelle Bestandspflege, Reservierungsübersicht, Lieferempfehlung |
| Stand-Mitarbeiter | Abholungen schnell und korrekt bearbeiten | Mobile-first Mitarbeiteransicht, QR-Scan, Bestand aktualisieren |
| Plattformadmin | Betrieb, Support und Gebührenmodell steuern | Produzentenverwaltung, Supporteinsicht, Payment- und Audit-Logs |

## USP

Der USP ist die garantierte Reservierung lokaler Ware:

```text
Nicht nur anzeigen, was wahrscheinlich verfügbar ist,
sondern verbindlich sicherstellen, dass bezahlte Ware bei Abholung vorhanden ist.
```

Diese Garantie entsteht technisch durch:

| Mechanismus | Beitrag zur Garantie |
| --- | --- |
| Inventory Engine | Berechnet `available_quantity = stock_quantity - reserved_quantity - safety_buffer` |
| Temporäre Blockierung | Verhindert Überbuchung während des Checkouts |
| Digitale Zahlung | Macht Reservierung verbindlich und reduziert No-shows |
| QRToken | Verknüpft Abholung eindeutig mit einer bestätigten Bestellung |
| Mitarbeiterbestätigung | Schließt den Prozess am Stand nachvollziehbar ab |

WhatsApp unterstützt diesen Garantieprozess kommunikativ, ersetzt ihn aber nicht. Der Kanal reduziert Unsicherheit beim Kunden, erinnert an das Abholfenster und macht den QR-Code schneller auffindbar, ohne Bestellungen außerhalb der App/PWA anzunehmen.

## MVP-Erfolgshypothese

Wenn Kunden lokale Verkaufsstände mit belastbarer Verfügbarkeit sehen und Produkte verbindlich reservieren können, sinkt die Zahl erfolgloser Fahrten. Gleichzeitig erhält der Produzent Reservierungs- und Nachfragedaten, mit denen er Ware besser auf Stände verteilen kann.

Messbare Signale für den Pilot:

| KPI | MVP-Ziel |
| --- | --- |
| Erfolgreiche Reservierungen | Mehr als 100 im Pilotzeitraum |
| Pickup-Erfolgsquote | Mehr als 95 % |
| Beschwerden wegen Nichtverfügbarkeit bei Reservierungen | Nahe 0 |
| Technische Payment-Erfolgsquote | Mehr als 98 % |
| QR-Scan-Erfolgsquote | Mehr als 95 % |
| Zahlungsbereitschaft Service Fee | Validiert durch echte Transaktionen |

## Nicht-Ziele des MVP

| Nicht-Ziel | Begründung |
| --- | --- |
| Vollständige POS-/Kassenintegration | Für den ersten Pilot reicht manuelle Bestandspflege |
| KI-basierte Nachfrageprognose | Historische Daten fehlen im MVP |
| Offener Multi-Produzenten-Marktplatz | Pilot startet mit 1-3 ausgewählten Produzenten |
| Native Mitarbeiter-App | Mobile Web-App/PWA genügt zunächst |
| Komplexes Reporting und Buchhaltungsexport | Phase 2 nach validiertem Betrieb |
| Lieferung an Endkunden | MVP fokussiert Pickup am Stand |
| Loyalty, Gutscheine, dynamische Preise | Nicht erforderlich für Garantie-Flow |
| Vollständiger Offline-first Betrieb | Schlechte Netzabdeckung wird berücksichtigt, aber nicht vollständig gelöst |
| Vollständiger WhatsApp-Chatbot | Im MVP reicht ein transaktionaler Benachrichtigungskanal |
| Vollständige Bestellung per WhatsApp | Reservierung, Zahlung und QR-Code bleiben im App/PWA-Flow |
| KI-basierte WhatsApp-Beratung | Kein MVP-Beitrag zur Reservierungsgarantie |
| Automatische Produktempfehlungen per WhatsApp | Erst nach Datenbasis und Opt-in-Konzept sinnvoll |
| Komplexe WhatsApp-Flows für Storno, Umbuchung oder Reklamation | Erhöht Support- und Compliance-Komplexität im Pilot |
