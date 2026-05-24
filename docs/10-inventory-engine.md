# Inventory Engine

Die Inventory Engine ist das technische Kernmodul der Reservierungsgarantie. Sie entscheidet, ob ein Produkt reservierbar ist, blockiert Mengen während der Zahlung und schreibt Bestand bei Abholung oder Storno korrekt fort.

## Logik der Bestandsführung

Je Kombination aus Stand und Produkt existiert eine Inventory-Zeile. Diese Zeile enthält den gemeldeten Bestand, die bereits reservierte Menge und einen Sicherheitsbestand.

```text
available_quantity = stock_quantity - reserved_quantity - safety_buffer
```

| Feld | Bedeutung |
| --- | --- |
| `stock_quantity` | Manuell gemeldeter physischer Bestand am Stand |
| `reserved_quantity` | Menge, die durch offene oder bestätigte Orders geblockt ist |
| `safety_buffer` | Nicht in der App verkaufbarer Puffer |
| `available_quantity` | Für neue Reservierungen nutzbare Menge |

Beispiel:

| Produkt | stock_quantity | reserved_quantity | safety_buffer | available_quantity |
| --- | ---: | ---: | ---: | ---: |
| Spargel Klasse I | 30 kg | 8 kg | 3 kg | 19 kg |

## Statusberechnung

| Inventory Status | Regel |
| --- | --- |
| `available` | `available_quantity > low_stock_threshold` |
| `low_stock` | `available_quantity > 0` und `available_quantity <= low_stock_threshold` |
| `out_of_stock` | `available_quantity <= 0` oder manuell ausverkauft markiert |
| `next_delivery_expected` | `out_of_stock` oder `low_stock` plus `next_delivery_at` gesetzt |

## Reservierungsprüfung

Eine Reservierung ist nur zulässig, wenn alle Bedingungen erfüllt sind:

```text
stand.status == open
product.active == true
requested_quantity > 0
requested_quantity <= available_quantity
pickup_slot is active
pickup_slot belongs to stand
```

Die Prüfung muss unmittelbar vor der Blockierung in derselben Datenbanktransaktion passieren. Die UI-Anzeige ist nicht verbindlich, weil sich Bestand zwischen Anzeige und Checkout ändern kann.

## Temporäre Bestandsblockierung

Beim Erstellen einer Order im Status `pending_payment` wird `reserved_quantity` erhöht. Die Blockierung hat ein Ablaufdatum, z. B. 10 Minuten.

| Ereignis | Aktion |
| --- | --- |
| Order wird `pending_payment` | `reserved_quantity += quantity` |
| Payment wird `succeeded` | Blockierung bleibt bestehen |
| Payment wird `failed` | `reserved_quantity -= quantity` |
| Checkout läuft ab | Order `expired`, `reserved_quantity -= quantity` |
| Kunde storniert vor Zahlung | Order `cancelled`, `reserved_quantity -= quantity` |

## Finale Bestandsreduktion bei Abholung

Bei bestätigter Abholung wird die reservierte Menge physisch aus dem Bestand entfernt:

```text
stock_quantity = stock_quantity - picked_up_quantity
reserved_quantity = reserved_quantity - picked_up_quantity
```

Diese Änderung geschieht in einer Transaktion mit:

1. Validierung der Order.
2. Validierung des QRToken.
3. Statuswechsel auf `picked_up`.
4. Markierung des QRToken als verwendet.
5. Aktualisierung der Inventory-Zeilen.
6. Erstellung von InventoryEvents.

## Storno- und Freigabelogik

| Situation | Order-Status | Payment-Status | Inventory-Wirkung |
| --- | --- | --- | --- |
| Kunde storniert vor Zahlung | `cancelled` | `pending` oder `failed` | Reservierte Menge freigeben |
| Kunde storniert früh nach Zahlung | `cancelled` oder `refunded` | `refunded` nach Regel | Reservierte Menge freigeben |
| Reservierung läuft vor Zahlung ab | `expired` | `pending` | Reservierte Menge freigeben |
| Kunde erscheint nicht | `expired` oder manuelle Entscheidung | abhängig von No-show-Regel | Reservierte Menge freigeben oder Bestand manuell korrigieren |
| Stand kann nicht liefern | `refunded` | `refunded` | Bestand per Korrektur-Event dokumentieren |

## Inventory Events

Jede fachlich relevante Bestandsänderung erzeugt ein InventoryEvent.

| Event-Typ | Auslöser | quantity_delta |
| --- | --- | --- |
| `manual_update` | Admin oder Mitarbeiter ändert Bestand | Differenz zum vorherigen Bestand |
| `reservation_hold` | Order wird `pending_payment` | Negative oder separat dokumentierte reservierte Menge |
| `reservation_release` | Order wird `expired` oder `cancelled` | Freigegebene reservierte Menge |
| `pickup` | Order wird `picked_up` | Negative physische Menge |
| `delivery` | Lieferung eingetroffen | Positive physische Menge |
| `correction` | Admin korrigiert Fehler | Differenz |
| `out_of_stock` | Mitarbeiter markiert Produkt ausverkauft | Setzt verfügbare Menge faktisch auf 0 |

Empfehlung: `stock_after` und `reserved_after` immer speichern. So bleiben spätere Fehleranalysen möglich.

## Sicherheitsbestand

Der Sicherheitsbestand verhindert, dass die App die letzte Ware verkauft, wenn manuelle Zählung, Bruch, Qualitätsaussortierung oder spontane Standverkäufe Abweichungen erzeugen.

| Produkt-/Stand-Situation | Empfohlener Sicherheitsbestand |
| --- | --- |
| Hohe spontane Nachfrage | Höherer Puffer |
| Sehr zuverlässige Bestandspflege | Niedrigerer Puffer |
| Kleine Restmengen | Produkt früher auf `low_stock` oder `out_of_stock` setzen |
| Schlechte Netzabdeckung | Höherer Puffer |

## Manuelle Bestandsupdates im MVP

Im MVP werden Bestände manuell gepflegt:

| Nutzer | Aktion |
| --- | --- |
| Spargelbauer/Admin | Bestand, Sicherheitsbestand, Schwellenwert und nächste Lieferung pflegen |
| Stand-Mitarbeiter | Bestand erhöhen/reduzieren, Lieferung erfassen, ausverkauft markieren |
| Plattformadmin | Nur Support- oder Korrekturfälle |

Bedienprinzip:

1. Bestehenden Wert anzeigen.
2. Neue Menge oder Delta erfassen.
3. Änderung bestätigen.
4. InventoryEvent speichern.
5. Status neu berechnen.

## Concurrency-Anforderungen

Die Inventory Engine muss parallele Reservierungen korrekt behandeln.

| Risiko | Gegenmaßnahme |
| --- | --- |
| Zwei Kunden reservieren letzte Menge | Transaktion mit Sperre auf Inventory-Zeile |
| Webhook kommt mehrfach | Idempotenz über Provider Event ID |
| Cronjob und Webhook ändern dieselbe Order | Statusübergänge transaktional validieren |
| Mitarbeiter bestätigt Pickup doppelt | QRToken One-Time-Use und Order-Status prüfen |

## Spätere POS-Integration

POS-Integration ist Phase 2. Die MVP-Domain sollte sie vorbereiten, indem externe Verkäufe später als InventoryEvents importiert werden können.

Mögliches Phase-2-Modell:

```text
POS sale event
-> POS adapter
-> InventoryEvent(type = external_sale)
-> stock_quantity aktualisieren
-> Status neu berechnen
```

Wichtig: POS-Integration ersetzt nicht die Reservierungslogik. Reservierte Mengen müssen weiterhin gegenüber dem frei verkäuflichen Bestand geschützt bleiben.
