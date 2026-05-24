# Spargelstand-App Executive-Konzept

**Dokumenttyp:** Executive-Konzept  
**Zielgruppe:** Gründer, Pilot-Produzenten, Entscheider, Investoren und Fördergespräche  
**Stand:** 22. Mai 2026

## Kurzfassung

Die Spargelstand-App ist ein standortbasierter Preorder- und Pickup-Marktplatz für dezentrale landwirtschaftliche Verkaufsstände. Kunden finden Stände in ihrer Nähe, sehen Produktverfügbarkeiten, reservieren Ware verbindlich, bezahlen digital und holen die Bestellung per QR-Code ab. Optional erhalten sie WhatsApp-Updates zu Bestätigung, Abholung und relevanten Statusänderungen.

Der wichtigste Unterschied zu einer einfachen Stand- oder Produktanzeige ist die Garantie: Eine bezahlte Reservierung muss im gewählten Abholzeitfenster am Stand verfügbar sein. Die App verkauft damit nicht nur Sichtbarkeit, sondern Planungssicherheit für Kunden und Produzenten.

Das MVP soll mit wenigen Pilot-Produzenten und mehreren Ständen beweisen, dass Kunden eine kleine Service Fee für garantierte Reservierung akzeptieren und dass Produzenten durch Reservierungsdaten bessere Lieferentscheidungen treffen können.

## Produktvision

Die App digitalisiert Spargel-, Erdbeer- und andere saisonale Verkaufsstände. Heute fahren Kunden häufig auf gut Glück zum Stand. Ob ein Produkt noch verfügbar ist, erfahren sie oft erst vor Ort. Gleichzeitig planen Produzenten Nachlieferungen häufig aus Erfahrung, Telefonrückmeldungen und Bauchgefühl.

Die Spargelstand-App verbindet lokale Suche, verbindliche Reservierung, digitale Zahlung, QR-Code-Abholung und einfache Lieferplanung. Der MVP fokussiert den kürzesten belastbaren Prozess:

```text
Kunde findet Stand
-> sieht verfügbare Produkte
-> reserviert Menge und Abholzeitfenster
-> bezahlt digital
-> erhält QR-Code
-> erhält optional WhatsApp-Statusupdates
-> holt Ware am Stand ab
-> Produzent sieht Nachfrage und Bestandswirkung
```

## Problem

| Zielgruppe | Heutiges Problem | Auswirkung |
| --- | --- | --- |
| Kunde | Verfügbarkeit am Stand ist unklar | Fehlfahrten, Frust, Bargeldbedarf |
| Produzent | Nachfrage je Stand ist schwer messbar | Unterlieferung, Überbestand, geringe Planbarkeit |
| Stand-Mitarbeiter | Bestellungen und Bestände werden manuell koordiniert | Fehleranfälligkeit und langsame Abholung |
| Plattform | Kein digitaler Prozess von Nachfrage bis Abholung | Keine belastbare Nutzungsabrechnung |

## Lösung

Die Lösung besteht aus drei Oberflächen und einem gemeinsamen Backend:

| Oberfläche | Kernnutzen |
| --- | --- |
| Kunden-App/PWA | Stände finden, Ware reservieren, digital bezahlen, QR-Code erhalten |
| Admin-Dashboard | Stände, Produkte, Bestände, Reservierungen und Lieferempfehlungen steuern |
| Mitarbeiteransicht | Offene Bestellungen sehen, QR-Codes scannen, Abholungen bestätigen, Bestand aktualisieren |
| WhatsApp Order Updates | Kunden optional an Bestellung, Zahlung, Abholung und Statusänderungen erinnern |

Der MVP startet bewusst mit manueller Bestandspflege. WhatsApp ist im MVP nur ein Bestellbegleiter, kein vollständiger Bestellkanal. POS-Integration, KI-Prognosen, native Mitarbeiter-App, komplexes Reporting und WhatsApp-Bestellung folgen erst nach erfolgreichem Pilot.

## USP und Garantieprinzip

Der USP lautet:

```text
Nicht nur anzeigen, was verfügbar ist,
sondern garantieren, dass reservierte Ware bei Abholung vorhanden ist.
```

Diese Garantie entsteht durch eine einfache, aber strenge Bestandslogik:

```text
available_quantity = stock_quantity - reserved_quantity - safety_buffer
```

| Mechanismus | Beitrag zur Garantie |
| --- | --- |
| Inventory Engine | Berechnet verfügbare Menge je Stand und Produkt |
| Temporäre Blockierung | Reserviert Menge während des Checkouts |
| Digitale Zahlung | Macht Reservierung verbindlich und reduziert No-shows |
| QRToken | Verknüpft Abholung eindeutig mit bestätigter Bestellung |
| Mitarbeiterbestätigung | Schließt Übergabe und Bestandsfortschreibung ab |

## Zielgruppen und Rollen

| Rolle | Ziel | MVP-Funktion |
| --- | --- | --- |
| Kunde | Ware sicher bekommen, ohne umsonst zu fahren | Suche, Reservierung, Zahlung, QR-Code |
| Spargelbauer/Admin | Verkauf und Nachlieferung besser steuern | Dashboard, Bestand, Reservierungen, Lieferempfehlung |
| Stand-Mitarbeiter | Abholung schnell abwickeln | QR-Scan, offene Orders, Bestand, Out-of-Stock |
| Plattformadmin | Betrieb und Support sichern | Produzenten, Gebühren, Logs, Supportfälle |

## Kundenerlebnis

Der Kundenprozess muss in wenigen Schritten verständlich sein. Der Kunde soll nicht das Gefühl haben, ein komplexes Marktplatzsystem zu bedienen, sondern eine lokale Ware zuverlässig vorzubestellen.

| Schritt | Kundensicht | Systemwirkung |
| --- | --- | --- |
| Standort öffnen | Nahe Stände werden angezeigt | Geo-Suche filtert Stände nach Entfernung |
| Produkt wählen | Verfügbarkeit je Stand ist sichtbar | Inventory Engine berechnet verfügbare Menge |
| Menge und Zeit wählen | Kunde plant die Abholung | PickupSlot und Bestand werden geprüft |
| Digital bezahlen | Reservierung wird verbindlich | Payment wird gestartet und Bestand blockiert |
| QR-Code erhalten | Kunde hat klaren Abholnachweis | QRToken wird erzeugt |
| WhatsApp-Update erhalten | Kunde findet Bestellung und QR-Link schneller wieder | Notification Service versendet transaktionale Nachricht bei Opt-in |
| Ware abholen | Mitarbeiter scannt Code | Order wird abgeschlossen und Bestand reduziert |

Wichtig für die Kommunikation: Die Service Fee muss als Gebühr für Sicherheit, Komfort und garantierte Reservierung verstanden werden. Sie darf nicht wie ein versteckter Produktaufschlag wirken.

## Produzentennutzen

Für den Produzenten geht es nicht nur um zusätzliche Online-Bestellungen. Der größere operative Nutzen liegt in besseren Nachfrage- und Bestandsdaten pro Standort.

| Nutzen | Konkreter Effekt im MVP |
| --- | --- |
| Weniger Fehlfahrten | Kunden reservieren nur verfügbare Ware |
| Bessere Planbarkeit | Reservierungen zeigen Nachfrage vor der Abholung |
| Weniger Bargeldprozesse | Digitale Zahlung reduziert manuelle Abwicklung |
| Schnellere Übergabe | QR-Code ersetzt mündliche Klärung der Bestellung |
| Sicht auf Standortleistung | Dashboard zeigt Nachfrage und Umsatz je Stand |
| Nachlieferung gezielter steuern | Lieferempfehlungen basieren auf Bestand und Reservierungen |

Der MVP muss deshalb nicht sofort alle Marktplatzfunktionen enthalten. Entscheidend ist, dass der Produzent am Ende des Piloten sagen kann, ob die Reservierungsdaten seine Tagessteuerung verbessern.

## MVP-Funktionsumfang

| Bereich | Im MVP enthalten |
| --- | --- |
| Standortsuche | Karte und Liste mit Ständen in der Nähe |
| Produktverfügbarkeit | Status je Produkt und Stand auf Basis der Inventory Engine |
| Reservierung | Menge, Abholzeitfenster, temporäre Bestandsblockierung |
| Zahlung | Stripe Connect mit Service Fee |
| QR-Abholung | Bestell-QR-Code, Scan durch Mitarbeiter, One-Time-Use |
| Admin-Dashboard | Stände, Produkte, Bestand, Reservierungen, Nachfrage, Umsatz |
| Mitarbeiteransicht | Mobile Webansicht für Standbetrieb |
| WhatsApp Order Updates | Optionaler P1-Pilotkanal für Bestellbestätigung, Abholerinnerung, QR-Link und Statusänderung |
| Betrieb | Rollenrechte, Monitoring, Backups und Payment-Webhooks |

## Operativer Tagesablauf im Pilot

Ein realistischer Pilot braucht klare Routinen. Die App kann die Garantie nur halten, wenn Bestände und Abholungen zuverlässig im System gepflegt werden.

| Zeitpunkt | Aktion | Verantwortlich |
| --- | --- | --- |
| Vor Öffnung | Bestand je Produkt und Stand setzen | Spargelbauer/Admin oder Stand-Mitarbeiter |
| Während Öffnung | Reservierungen und offene Abholungen beobachten | Stand-Mitarbeiter |
| Bei Nachlieferung | Lieferung eingetroffen erfassen | Stand-Mitarbeiter |
| Bei Ausverkauf | Produkt sofort auf `out_of_stock` setzen | Stand-Mitarbeiter |
| Bei Abholung | QR-Code scannen und Übergabe bestätigen | Stand-Mitarbeiter |
| Tagesende | offene Fälle, No-shows und Bestand prüfen | Spargelbauer/Admin |

Diese Routine ist bewusst manuell. Sie ist im Pilot wertvoll, weil sie zeigt, ob Produzenten und Mitarbeiter den Prozess tatsächlich im Alltag nutzen.

## Abgrenzung zu Phase 2

Nicht Teil des MVP:

| Thema | Begründung |
| --- | --- |
| POS-Integration | Für den Pilot reicht manuelle Bestandspflege |
| KI-Prognose | Historische Daten fehlen vor dem Pilot |
| Native Mitarbeiter-App | Eine PWA ist schneller und ausreichend |
| Komplexes Reporting | Operative Tabellen genügen für die erste Saison |
| Buchhaltungs-Export | Rechtlich und fachlich separat zu klären |
| Offener Multi-Produzenten-Marktplatz | Pilot startet mit wenigen ausgewählten Produzenten |
| Vollständige WhatsApp-Bestellung | App/PWA bleibt im MVP der verbindliche Bestell- und Zahlungsort |
| WhatsApp-Chatbot oder KI-Beratung | Für den Pilot zu komplex und nicht notwendig für die Reservierungsgarantie |

## Geschäftsmodell

Die Plattformmarge entsteht primär über eine Reservierungs- oder Service Fee, nicht über Produktaufschläge. Der Produktpreis bleibt der Preis des Produzenten. WhatsApp-Updates können als Komfortbestandteil dieser Fee verstanden werden, weil der Kunde für garantierte Verfügbarkeit plus bequeme Abholinformation zahlt.

Beispiel:

| Position | Betrag |
| --- | ---: |
| 2 kg Spargel Klasse I | 24,00 EUR |
| Service Fee | 0,99 EUR |
| Gesamtzahlung Kunde | 24,99 EUR |
| Auszahlung Produzent | Warenwert abzüglich vereinbarter Payment-Kosten |
| Plattformmarge | Service Fee abzüglich anteiliger Kosten |

MVP-Empfehlung:

| Komponente | Empfehlung |
| --- | --- |
| Kunde | 0,49 EUR bis 0,99 EUR Service Fee pro erfolgreicher Reservierung |
| Produzent | Keine oder geringe Grundgebühr im Pilot |
| Plattform | Service Fee als Nachweis der Zahlungsbereitschaft |
| Payment | Stripe Connect mit späterer Option für PayPal |
| WhatsApp-Kosten | In Service Fee oder Plattformgebühr einkalkulieren, im MVP auf 2-3 Nachrichten pro Bestellung begrenzen |
| Nach Pilot | Saisonpaket plus nutzungsbasierte Reservierungsgebühr |

## Pilotkonzept

Der erste Pilot sollte klein genug sein, um operativ beherrschbar zu bleiben, aber groß genug, um echte Nachfrage- und Abholsignale zu messen.

| Faktor | Empfehlung |
| --- | --- |
| Produzenten | 1 Pilot-Produzent |
| Stände | 3 bis 5 Verkaufsstände |
| Produkte | 3 bis 5 saisonale Produkte |
| Zeitraum | 2 bis 4 Wochen |
| Bestandsupdate | Manuell, 2 bis 4 Mal täglich |
| Mitarbeitergerät | Smartphone mit Browser |
| Kundenkanal | Stand-QR-Codes, Website, Social Media |
| Hauptmessung | Reservierungen, Pickup-Erfolg, Fehlfahrtenreduktion |

## Pilotkommunikation

Die Kommunikation sollte den Nutzen präzise erklären. Es geht nicht um eine allgemeine Liefer-App, sondern um garantierte Abholung lokaler Ware.

Kundenbotschaft:

```text
Reserviere deinen Spargel vorab und hole ihn garantiert am gewünschten Stand ab.
Kein Umweg. Kein Ausverkauft. Kein Bargeld nötig.
```

Produzentenbotschaft:

```text
Sie sehen frühzeitig, welche Produkte an welchem Stand nachgefragt werden,
reduzieren Fehlmengen und verteilen Ware datenbasiert statt nach Bauchgefühl.
```

Kanäle im Pilot:

| Kanal | Zweck |
| --- | --- |
| QR-Code am Stand | Direktnutzer gewinnen und Standdetailseite öffnen |
| Website des Produzenten | Bestehende Kunden informieren |
| Social Media | Saisonale Nachfrage aktivieren |
| Hinweis am Verkaufsstand | Service Fee und Garantie erklären |
| Mitarbeiterhinweis | Kunden bei Fragen durch Prozess führen |
| WhatsApp | Nur bei Opt-in: Bestätigung, Abholerinnerung und sicherer Link zur QR-Code-Seite |

## Roadmap 10 bis 14 Wochen

| Phase | Zeitraum | Ergebnis |
| --- | --- | --- |
| Phase 0 Discovery | Woche 1 bis 2 | Anforderungen, Pilotannahmen, Gebührenmodell |
| Phase 1 UX und Fundament | Woche 3 bis 4 | Klickdummy, Datenmodell, API, Auth, Projektsetup |
| Phase 2 MVP-Core | Woche 5 bis 9 | Reservierung, Payment, QR, Inventory, Admin, Staff |
| Phase 3 Pilotvorbereitung | Woche 10 bis 11 | Reale Stände, Tests, Schulung, Monitoring, WhatsApp-Pilotsetup |
| Phase 4 Pilotbetrieb | Woche 12 bis 14 | Livebetrieb, Metriken, Feedback, WhatsApp-P1-Auswertung, Skalierungsentscheidung |

## Erfolgskennzahlen

| KPI | Ziel für den Pilot |
| --- | ---: |
| Erfolgreiche Reservierungen | Mehr als 100 |
| Pickup-Erfolgsquote | Mehr als 95 Prozent |
| Beschwerden wegen Nichtverfügbarkeit | Nahe 0 |
| Technische Payment-Erfolgsquote | Mehr als 98 Prozent |
| QR-Scan-Erfolgsquote | Mehr als 95 Prozent |
| Zahlungsbereitschaft Service Fee | Durch echte Transaktionen validiert |

## MVP-Abnahmekriterien

Das MVP ist aus Executive-Sicht abnahmefähig, wenn der Garantiekreislauf stabil funktioniert.

| Kriterium | Erwartung |
| --- | --- |
| Standortsuche | Kunde findet nahe Stände und erkennt Öffnungsstatus |
| Verfügbarkeit | Produkte zeigen realistische Statuswerte |
| Reservierung | Menge und Abholzeitfenster können verbindlich gewählt werden |
| Zahlung | Digitale Zahlung wird zuverlässig bestätigt |
| QR-Code | Kunde erhält nach Zahlung einen gültigen Abholcode |
| WhatsApp | Kunde kann Benachrichtigungen aktivieren/deaktivieren und erhält bei Opt-in Bestätigung, Erinnerung und sicheren QR-Link |
| Abholung | Mitarbeiter kann QR-Code scannen und Übergabe bestätigen |
| Bestand | Bestand wird nach Reservierung und Abholung korrekt fortgeschrieben |
| Admin | Produzent sieht Bestände, Reservierungen, Nachfrage und Umsatz |
| Pilotbetrieb | Fehlerfälle wie Zahlungsabbruch, No-show und Lieferproblem sind geregelt |

## Risiken und Gegenmaßnahmen

| Risiko | Auswirkung | Gegenmaßnahme |
| --- | --- | --- |
| Bestand wird nicht gepflegt | Falsche Verfügbarkeit | Einfache Mitarbeiteransicht und Sicherheitsbestand |
| Kunden erscheinen nicht | Blockierter Bestand | Vorkasse, No-show-Regel, Kulanzzeit |
| Schlechte Netzabdeckung | QR-Scan problematisch | Fallback-Code und kurze API-Antworten |
| Payment-Komplexität | Verzögerung | Stripe-first, PayPal später |
| Service Fee wird abgelehnt | Geschäftsmodell unsicher | Kleine Fee testen und klar als Garantie erklären |
| WhatsApp Opt-in oder Provider-Probleme | Datenschutz- und Zustellrisiko | Freiwilliges Opt-in, Fallback über App/PWA und E-Mail, begrenzte Nachrichtenfrequenz |
| Saisonfenster ist kurz | Wenig Testzeit | Pilot früh planen und Scope strikt halten |

## Offene Entscheidungen vor Pilot

| Entscheidung | Warum wichtig |
| --- | --- |
| Exakte Service-Fee-Höhe | Checkout, Kommunikation und Zahlungsbereitschaft |
| Storno- und Refund-Regeln | Support, Recht und Kundenerwartung |
| Kulanzzeit für Abholung | QRToken-Ablauf und No-show-Prozess |
| Pilotprodukte und Einheiten | Produktmodell und UI |
| Bestandsupdate-Frequenz | Operative Garantiequalität |
| Rechtlicher Verkäufer der Ware | AGB, Steuern und Haftung |
| WhatsApp-Provider, Template-Set und Opt-in-Text | Datenschutz, Kosten und Pilotkommunikation |

## Zusammenfassung

Das MVP ist sinnvoll, wenn es den Kernprozess stabil beweist: Kunde findet Stand, reserviert Ware verbindlich, bezahlt digital und holt per QR-Code ab. Für Produzenten entsteht gleichzeitig eine bessere Sicht auf Nachfrage und Bestände je Stand.

Der empfohlene nächste Schritt ist ein fokussierter Pilot mit wenigen Ständen, manueller Bestandspflege, Stripe Connect, QR-Abholung, optionalen WhatsApp Order Updates und klarer Service-Fee-Kommunikation. Erst nach validiertem Betrieb sollten POS-Integration, Prognosen, native Apps, vollständige WhatsApp-Bestellung und komplexes Reporting ergänzt werden.
