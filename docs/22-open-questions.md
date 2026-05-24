# Offene Fragen

Dieses Dokument sammelt Fragen, Annahmen, Risiken und Entscheidungen, die vor oder während der MVP-Umsetzung geklärt werden müssen. Die Fragen sind bewusst konkret, weil sie direkte Auswirkungen auf Datenmodell, Payment, UX und Betrieb haben.

## Offene Produktfragen

| Frage | Warum relevant | Entscheidung nötig bis |
| --- | --- | --- |
| Welche Produkte sind im Pilot wirklich verfügbar? | Produktmodell, Einheiten und Preise | Phase 0 |
| Welche Einheiten werden verkauft: kg, Schale, Bund, Stück? | Mengenvalidierung und UI | Phase 0 |
| Wie groß ist die minimale und maximale Reservierungsmenge je Produkt? | Reservierungsformular und Inventory-Regeln | Phase 1 |
| Welche Abholzeitfenster sind realistisch? | PickupSlot-Modell und Staff-Prozess | Phase 1 |
| Gibt es eine Kulanzzeit nach Abholfenster? | No-show-Regel und QRToken-Ablauf | Phase 1 |
| Welche Service Fee akzeptieren Kunden? | Payment und Geschäftsmodell | Phase 0/Pilot |
| Wird Storno durch Kunden im MVP erlaubt? | Order-Statusmodell und Refunds | Phase 1 |
| Welche Informationen braucht der Mitarbeiter bei Abholung wirklich? | DSGVO und Staff UI | Phase 1 |
| Wie oft können Bestände realistisch gepflegt werden? | Sicherheitsbestand und Liefergarantie | Phase 0 |
| Wie wird dem Kunden die Garantie formuliert? | Recht, UX und Erwartungsmanagement | Phase 0 |
| Soll WhatsApp im Pilot angeboten werden oder erst nach P0-Stabilisierung? | Scope, Opt-in und Kommunikationsversprechen | Phase 1/Pilot |
| Welche WhatsApp-Nachrichten sind pro Bestellung wirklich nötig? | Kosten, Kundenerlebnis und No-show-Reduktion | Phase 1 |
| Wie wird Opt-out für WhatsApp sichtbar angeboten? | Vertrauen und Compliance | Vor Pilot |

## Offene technische Fragen

| Frage | Warum relevant | Entscheidung nötig bis |
| --- | --- | --- |
| Auth.js oder Supabase Auth? | Login, Session, Betrieb | Phase 1 |
| Next.js API Routes bleiben ausreichend oder NestJS nötig? | Projektstruktur und Geschwindigkeit | Phase 1 |
| Wird PostGIS direkt genutzt? | Geo-Suche und DB-Setup | Phase 1 |
| Welcher Kartenanbieter wird verwendet? | Kosten, UX, API Keys | Phase 1 |
| Stripe Checkout oder Payment Element? | Checkout UX und Implementierung | Phase 1 |
| Welche Cronjob-Infrastruktur auf Azure? | Expiry von Reservierungen und QRToken | Phase 2 |
| Wie wird QR-Code-Scanning im Browser umgesetzt? | Staff UX und Gerätekompatibilität | Phase 2 |
| Wie werden lokale und produktive Webhooks getestet? | Payment-Stabilität | Phase 2 |
| Wie werden Inventory-Transaktionen technisch gesperrt? | Überbuchungsschutz | Phase 2 |
| Wie werden Stand-Mitarbeiter mehreren Ständen zugeordnet? | RBAC-Modell | Phase 1 |
| Welcher WhatsApp-Provider wird genutzt? | Kosten, Template-Freigabe, Webhooks und Datenschutz | Phase 1 |
| Wird Telefonnummer nur plausibilisiert oder verifiziert? | UX, Sicherheit und Kosten | Phase 1 |
| Wie werden sichere QR-Links in WhatsApp umgesetzt? | QRToken-Sicherheit und Missbrauchsschutz | Phase 2 |
| Wie wird Notification-Versand asynchron verarbeitet? | Latenz, Retry und Provider-Ausfälle | Phase 2 |

## Offene rechtliche/steuerliche Fragen

| Frage | Warum relevant | Entscheidung nötig bis |
| --- | --- | --- |
| Wer ist rechtlicher Verkäufer der Ware? | AGB, Rechnung, Haftung | Phase 0 |
| Wie wird die Service Fee steuerlich behandelt? | Rechnung und Umsatzsteuer | Phase 0 |
| Muss der Kunde eine digitale Quittung erhalten? | Phase-2-Planung, Payment-Kommunikation | Phase 1 |
| Welche Refund-Regeln sind rechtlich zulässig? | Storno, No-show, Lieferproblem | Phase 0 |
| Welche Angaben braucht die Datenschutzerklärung? | DSGVO | Vor Pilot |
| Welche Auftragsverarbeitungsverträge sind nötig? | Stripe, Hosting, E-Mail | Vor Pilot |
| Welche Auftragsverarbeitung oder Datenschutzprüfung ist für WhatsApp-Provider nötig? | Telefonnummern und Nachrichtenzustellung | Vor Pilot |
| Welche Einwilligungsformulierung ist für WhatsApp zulässig? | Opt-in und Transparenz | Vor Pilot |
| Darf Service Fee bei No-show behalten werden? | Geschäftsmodell und Rechtssicherheit | Phase 0 |
| Wie werden Reklamationen dokumentiert? | Support und Refunds | Phase 3 |

## Annahmen

| Annahme | Auswirkung |
| --- | --- |
| Bestände werden im MVP manuell gepflegt | POS-Integration ist nicht erforderlich |
| Ein Produzent mit 3-5 Ständen genügt für ersten Pilot | Multi-Produzenten-Onboarding kann warten |
| Kunden akzeptieren kleine Service Fee | Plattformmarge entsteht über Reservierung |
| Stand-Mitarbeiter nutzen Smartphone-Browser | Native App ist nicht erforderlich |
| Netzabdeckung ist ausreichend für Online-Scan mit Fallback-Code | Kein vollständiger Offline-first-Modus |
| Stripe Connect ist für Pilot verfügbar | Payment-Architektur baut auf Stripe auf |
| Sicherheitsbestand reduziert operative Fehlmengen | Inventory Engine muss Puffer unterstützen |
| QR-Abholung ist für Mitarbeiter akzeptabel | Staff UI muss extrem einfach sein |
| WhatsApp wird freiwillig genutzt | App/PWA und E-Mail bleiben Fallback |
| Im MVP reichen 2-3 WhatsApp-Nachrichten je Bestellung | Provider-Kosten und Kundenerlebnis bleiben kontrollierbar |
| Proaktive WhatsApp-Nachrichten benötigen freigegebene Templates | Template-Planung muss vor Pilot abgeschlossen sein |

## Risiken

| Risiko | Auswirkung | Gegenmaßnahme |
| --- | --- | --- |
| Bestand wird nicht gepflegt | Falsche Verfügbarkeit und Garantiebruch | Einfache Staff UI, Sicherheitsbestand, Erinnerungsprozess |
| Kunden holen Ware nicht ab | Blockierter Bestand | Vorkasse, No-show-Regel, Kulanzzeit |
| Mitarbeiter umgehen QR-Prozess | Abholstatus unvollständig | UI vereinfachen, Schulung, offene Orders klar sichtbar |
| Internet am Stand schlecht | Scan oder Pickup scheitert | Fallback-Code, kurze API-Antworten, Retry |
| Payment-Integration verzögert | MVP-Kernflow blockiert | Stripe-first, PayPal verschieben |
| Service Fee wird abgelehnt | Geschäftsmodell unsicher | Fee klein testen, klar als Garantie kommunizieren |
| Produzent sieht zu viel manuellen Aufwand | Pilot scheitert operativ | Bestandspflege auf wenige Aktionen reduzieren |
| Überbuchung durch Concurrency | USP beschädigt | Transaktionale Inventory-Prüfung und Tests |
| Rechtliche Klärung verzögert Pilot | Kein Livebetrieb | Fragen in Phase 0 priorisieren |
| Saisonfenster ist kurz | Wenig Testzeit | Früh vor Saison starten |
| WhatsApp Opt-in ist unklar oder fehlerhaft | Datenschutz- und Vertrauensrisiko | Einwilligung explizit, protokolliert und freiwillig gestalten |
| Telefonnummern werden unnötig breit sichtbar | Datenschutzrisiko | Maskierung, RBAC und Zweckbindung |
| Kunden empfinden WhatsApp als störend | Opt-out oder geringere Akzeptanz | Frequenz begrenzen und klare Abmeldung anbieten |
| WhatsApp Provider ist teuer oder unzuverlässig | Marge und Kundenerlebnis leiden | Kosten monitoren, Fallback über App/PWA und E-Mail |
| Templates werden verspätet genehmigt | Pilotkommunikation verzögert sich | Templates früh definieren und E-Mail-Fallback behalten |
| Zustellung ist nicht garantiert | Kunde verpasst Erinnerung | WhatsApp nie als einzigen Informationskanal nutzen |

## Entscheidungen vor Entwicklungsstart

| Entscheidung | Empfohlene Wahl | Begründung |
| --- | --- | --- |
| Frontend | Next.js PWA | Eine Codebase für Kunde, Admin und Staff |
| Backend | Next.js API Routes als modularer Monolith | Schnell und ausreichend für MVP |
| Datenbank | PostgreSQL + Prisma | Relationale Domäne und gute Entwicklerproduktivität |
| Geo | PostGIS, Fallback Lat/Lng | Robuste Standortsuche |
| Payment | Stripe Connect | Plattformgebühr und Produzentenauszahlung |
| Hosting | Azure App Service | Bevorzugte Zielplattform mit Azure PostgreSQL und Monitoring |
| Mitarbeiter-App | Mobile Web/PWA | Schnell und ausreichend für Pilot |
| POS | Nicht im MVP | Manuelle Bestände genügen für Validierung |
| WhatsApp | P1-Benachrichtigungskanal, nicht P0-Bestellkanal | Ergänzt den App/PWA-Flow, ohne Kernscope zu verdrängen |
| Nachfrageprognose | Nicht im MVP | Regelbasierte Lieferempfehlung reicht |
| Geschäftsmodell | Service Fee pro erfolgreicher Reservierung | Validiert Zahlungsbereitschaft direkt |

## Entscheidungen vor Pilotstart

| Entscheidung | Benötigt für |
| --- | --- |
| Exakte Service-Fee-Höhe | Checkout und Kommunikation |
| Storno- und Refund-Regeln | Support und Payment |
| Kulanzzeit für Abholung | QRToken-Ablauf und No-show |
| Pilotprodukte und Einheiten | Datenmodell und UI |
| Bestandsupdate-Frequenz | Operativer Prozess |
| Mitarbeiter-Schulung | Staff-Nutzung |
| Datenschutzerklärung/AGB | Livebetrieb |
| Stripe Live-Konfiguration | Produktion |
| Monitoring-Alarmkanal | Betrieb während Öffnungszeiten |
| WhatsApp-Provider und Template-Set | Pilotkommunikation |
| WhatsApp Opt-in-Text und Datenschutzpassage | Compliance |
| Kostenlimit für WhatsApp-Nachrichten pro Bestellung | Service-Fee-Kalkulation |
