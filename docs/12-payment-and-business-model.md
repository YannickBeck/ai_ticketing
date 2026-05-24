# Payment und Geschäftsmodell

Das Zahlungs- und Geschäftsmodell folgt der MVP-Annahme: Die Plattform verdient primär an der Reservierungsleistung, nicht an einem Produktaufschlag. Der Kunde zahlt für die Garantie, dass Ware im gewählten Abholzeitfenster verfügbar ist.

## Zahlungsmodell

| Bestandteil | Beschreibung |
| --- | --- |
| Warenwert | Preis der Produkte, z. B. 2 kg Spargel |
| Service Fee | Gebühr für garantierte Reservierung und digitalen Prozess |
| Payment Fee | Gebühren des Payment Providers |
| Produzentenauszahlung | Warenwert abzüglich Payment-Kosten je vereinbartem Modell |
| Plattformgebühr | Service Fee oder Anteil davon |

Beispiel:

| Position | Betrag |
| --- | ---: |
| 2 kg Spargel Klasse I | 24,00 EUR |
| Service Fee | 0,99 EUR |
| Gesamtzahlung Kunde | 24,99 EUR |
| Auszahlung Produzent | 24,00 EUR abzüglich vereinbarter Payment-Kosten |
| Plattformmarge | 0,99 EUR abzüglich anteiliger Kosten |

## Service Fee / Reservierungsgebühr

Die Service Fee wird klar als Gebühr für garantierte Reservierung, digitale Zahlung, bequeme Abholinformation und schnellere Abholung kommuniziert.

MVP-Empfehlung:

| Kriterium | Empfehlung |
| --- | --- |
| Höhe | 0,49 EUR bis 0,99 EUR pro erfolgreicher Reservierung |
| Erhebung | Beim Checkout transparent als separate Position |
| Rückerstattung | Bei Lieferproblem vollständig, bei Kunden-No-show nach Regel |
| Reporting | Separat von Warenwert speichern |

### WhatsApp als Komfortbestandteil

WhatsApp Order Updates können die Service Fee argumentativ stärken, weil der Kunde nicht nur für die Reservierung zahlt, sondern für garantierte Verfügbarkeit plus bequeme Abholinformation.

| Nutzen | Wirkung |
| --- | --- |
| Bestellbestätigung direkt im gewohnten Kanal | Kunde findet Bestellung schneller wieder |
| Abholerinnerung | Reduziert No-shows und Supportnachfragen |
| Sicherer QR-Link | Verkürzt Suche nach dem QR-Code am Stand |
| Statusänderung bei Lieferverzögerung | Senkt Unsicherheit und Beschwerderisiko |

WhatsApp ist dabei kein eigener kostenpflichtiger Zusatz im MVP, sondern Teil des Reservierungs- und Komfortversprechens. Die Kosten müssen aber in Service Fee oder Plattformgebühr einkalkuliert werden.

MVP-Kostenannahmen:

| Kostenblock | Relevanz |
| --- | --- |
| WhatsApp-Provider-Kosten | Je nach Provider pro Nachricht oder Conversation |
| Template-Einrichtung | Operativer Aufwand für Freigabe und Pflege |
| Zustellfehler und Support | Monitoring und Fallback nötig |
| Datenschutz/Opt-in | Rechtliche und technische Umsetzung |

Empfehlung: Maximal 2-3 WhatsApp-Nachrichten pro Bestellung im MVP einplanen:

1. Bestell- oder Zahlungsbestätigung.
2. Abholerinnerung mit sicherem QR-Link.
3. Optional Abholabschluss oder Statusänderung.

## Keine Marge auf direkten Warenverkauf

Der Produktpreis bleibt der Preis des Produzenten. Die Plattform soll im MVP keine versteckte Marge auf den Warenverkauf nehmen.

Gründe:

| Grund | Wirkung |
| --- | --- |
| Vertrauen beim Produzenten | Produzent behält Preishoheit |
| Klare Kundenkommunikation | Kunde zahlt sichtbar für Reservierung |
| Einfache Pilotverhandlung | Kein Konflikt über Produktmargen |
| Bessere Auswertbarkeit | Service-Fee-Zahlungsbereitschaft wird messbar |

## Stripe Connect Modell

Stripe Connect ist die primäre Payment-Lösung für das MVP, weil Plattformzahlungen, Gebühren und Produzentenauszahlungen abbildbar sind.

MVP-Zielmodell:

| Element | Umsetzung |
| --- | --- |
| Produzent | Connected Account |
| Plattform | Nimmt Service Fee oder Application Fee |
| Kunde | Zahlt Gesamtbetrag |
| Webhook | Bestätigt Payment und aktualisiert Order |
| Refund | Wird über PaymentService ausgelöst |
| Reporting | Payment-Status, Gebühren und Payout-Status speichern |

## Plattformgebühr

Die Plattformgebühr kann aus der Service Fee bestehen oder als Application Fee gegenüber dem Connected Account abgebildet werden.

Im MVP muss die Gebührenlogik einfach bleiben:

```text
platform_fee = service_fee_cents
product_amount = sum(order_items)
total_amount = product_amount + service_fee
```

Payment Provider Fees werden entweder transparent weitergereicht oder zunächst in der Plattformkalkulation berücksichtigt.

## Produzentenauszahlung

Der Produzent erhält den Warenwert, abzüglich vereinbarter Kosten. Die Auszahlung muss im Dashboard sichtbar, aber nicht mit komplexer Buchhaltung verwechselt werden.

MVP-Dashboard-Felder:

| Feld | Zweck |
| --- | --- |
| Warenumsatz | Summe Produktverkäufe |
| Service Fees | Summe Plattformgebühren |
| Payment Fees | Falls verfügbar |
| Nettoauszahlung | Erwartete Produzentenauszahlung |
| Payout Status | Offen, ausgezahlt oder fehlgeschlagen |

## Refunds

Refunds müssen fachlich klar geregelt und technisch nachvollziehbar sein.

| Situation | Empfehlung |
| --- | --- |
| Stand kann nicht liefern | Volle Erstattung inklusive Service Fee |
| Kunde storniert frühzeitig | Warenwert erstatten, Service Fee optional behalten |
| Kunde storniert kurz vor Abholung | Teilweise oder keine Erstattung nach Pilotregel |
| Kunde erscheint nicht | Keine automatische Erstattung, manuelle Kulanz möglich |
| Produktqualität/Reklamation | Manuelle Erstattung durch Admin oder Plattformadmin |

Technische Regeln:

1. Refunds werden nur über PaymentService ausgelöst.
2. Refunds erzeugen Audit Logs.
3. Payment wechselt auf `refunded`, wenn vollständig erstattet.
4. Order wechselt auf `refunded`, wenn der fachliche Vorgang abgeschlossen ist.
5. Inventory wird bei Storno vor Pickup freigegeben.

## No-show-Regel

Die Garantie gilt nur, wenn der Kunde innerhalb des gewählten Abholfensters plus Kulanzzeit erscheint.

MVP-Empfehlung:

| Fall | Regel |
| --- | --- |
| Erscheint innerhalb Zeitfenster | Normale Abholung |
| Erscheint kurz nach Zeitfenster | Kulanzzeit, z. B. 30-60 Minuten |
| Erscheint nicht | Order läuft operativ aus, Refund nach Pilotregel |
| Stand hat Ware anderweitig verkauft | Lieferproblem des Standes, Kunde erhält Refund |

## Geschäftsmodellvarianten

### Gebühr pro erfolgreicher Reservierung

| Eigenschaft | Bewertung |
| --- | --- |
| Beispiel | 0,49 EUR bis 1,49 EUR pro Reservierung |
| Vorteil | Sehr einfach, niedrige Hürde für Produzenten |
| Nachteil | Umsatz hängt stark vom Reservierungsvolumen ab |
| MVP-Eignung | Sehr hoch |

### Grundgebühr je Produzent

| Eigenschaft | Bewertung |
| --- | --- |
| Beispiel | 29 EUR bis 99 EUR pro Monat |
| Vorteil | Planbarer Plattformumsatz |
| Nachteil | Schwerer vor Nutzenbeweis zu verkaufen |
| MVP-Eignung | Mittel |

### Standortgebühr

| Eigenschaft | Bewertung |
| --- | --- |
| Beispiel | 49 EUR bis 149 EUR pro Stand und Saison |
| Vorteil | Passt zu mehreren Verkaufsständen |
| Nachteil | Kann kleine Betriebe abschrecken |
| MVP-Eignung | Nach Pilot interessant |

### Saisonpaket

| Eigenschaft | Bewertung |
| --- | --- |
| Beispiel | 299 EUR bis 999 EUR pro Saison |
| Vorteil | Passt zu Spargel- und Erdbeersaison |
| Nachteil | Höhere Einstiegshürde |
| MVP-Eignung | Gut nach Validierung |

### Kombination aus SaaS- und Transaktionsmodell

| Eigenschaft | Bewertung |
| --- | --- |
| Beispiel | Saisonpaket plus reduzierte Service Fee |
| Vorteil | Kombiniert planbare Einnahmen und Nutzungserfolg |
| Nachteil | Komplexer zu kommunizieren |
| MVP-Eignung | Phase 2 |

## MVP-Empfehlung

Für den Pilot:

| Komponente | Entscheidung |
| --- | --- |
| Produzent | Keine oder geringe Grundgebühr gegen Feedback |
| Kunde | 0,49 EUR bis 0,99 EUR Service Fee |
| Plattform | Service Fee als primärer Umsatznachweis |
| Payment | Stripe Connect |
| Refunds | Einfache, dokumentierte Regeln |
| Erfolgsmessung | Reservierungen, Pickup-Erfolg, Service-Fee-Akzeptanz |

Nach erfolgreichem Pilot kann das Modell auf Saisonpaket plus nutzungsbasierte Reservierungsgebühr erweitert werden.
