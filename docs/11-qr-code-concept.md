# QR-Code-Konzept

QR-Codes sind ein zentrales MVP-Feature. Sie verbinden physische Verkaufsstände mit digitaler Standdetailseite und ermöglichen die sichere Abholung bezahlter Reservierungen.

## QR-Code-Typen

| Typ | Zweck | MVP-Relevanz |
| --- | --- | --- |
| Stand-QR-Code | Öffnet die Standdetailseite | Hoch |
| Produkt-/Stand-QR-Code | Öffnet Produktauswahl für konkretes Produkt an konkretem Stand | Optional im MVP |
| Bestell-QR-Code | Dient zur Abholung einer bezahlten Reservierung | Kritisch |
| Mitarbeiter-QR | Optionaler Login- oder Stand-Kontext für Mitarbeiter | Später oder Pilotkomfort |

## Stand-QR-Code

Stand-QR-Codes werden physisch am Stand ausgehängt. Sie führen Kunden direkt zur Standdetailseite.

Beispiel:

```text
https://app.example.com/stands/stand_123
```

Eigenschaften:

| Punkt | Entscheidung |
| --- | --- |
| Sensible Daten | Keine |
| Ablauf | Kein Ablauf nötig, aber widerrufbar über Stand-Status |
| Nutzung | Öffentlich |
| Tracking | Optional über UTM oder Scan-Event |

## Produkt-/Stand-QR-Code

Produkt-/Stand-QR-Codes können direkt zu einem Produkt an einem Stand führen.

Beispiel:

```text
https://app.example.com/stands/stand_123/products/prod_spargel_klasse_1
```

Dieser QR-Code ist nützlich für Preisschilder oder Social-Media-Kampagnen, aber nicht kritisch für den MVP.

## Bestell-QR-Code

Der Bestell-QR-Code ist sicherheitskritisch. Er wird erst erzeugt, wenn Payment `succeeded` ist und die Order `confirmed` wurde.

Beispiel:

```text
https://app.example.com/pickup/scan?token=<signed-token>
```

Eigenschaften:

| Punkt | Entscheidung |
| --- | --- |
| Enthaltene Daten | Nur signierter Token, keine Kundendaten, keine Produktdetails |
| Speicherung | Nur Hash des Tokens in `QRToken.token_hash` |
| Ablauf | Spätestens nach Abholfenster plus Kulanzzeit |
| Nutzung | One-Time-Use |
| Status | `active`, `used`, `expired`, `revoked` |

## QR-Code-Link in WhatsApp

Der QR-Code bleibt in der App/PWA verfügbar. WhatsApp enthält im MVP nur einen sicheren Link zur Bestellung oder zur QR-Code-Seite, damit der Kunde den QR-Code am Stand schneller öffnen kann.

Regeln:

| Regel | Umsetzung |
| --- | --- |
| Kein Roh-Token in WhatsApp | Die Nachricht enthält keinen wiederverwendbaren Klartext-QRToken |
| Sicherer Zugriff | Link nutzt eine authentifizierte Session oder einen separat signierten, zeitlich begrenzten Zugriffstoken |
| Kurze Gültigkeit | Deep-Link-Token läuft deutlich vor oder spätestens mit dem Abholfenster plus Kulanz ab |
| Keine sensiblen Daten | Nachricht enthält keine Produktdetails, Zahlungsdaten oder vollständigen Kundendaten |
| QR bleibt One-Time-Use | Der eigentliche Bestell-QRToken kann nach Abholung nicht erneut verwendet werden |

Beispiel für einen sicheren Link:

```text
https://app.example.com/orders/order_789/qr?access=<short-lived-signed-access-token>
```

Der Link ist nicht identisch mit dem QRToken, der am Stand validiert wird. Wird der Link weitergeleitet, müssen Ablaufzeit, Signatur, optional Login und Order-Status verhindern, dass ein QR-Code beliebig wiederverwendet werden kann.

## Optionaler Mitarbeiter-QR

Ein Mitarbeiter-QR kann später genutzt werden, um ein Gerät schnell in den Kontext eines Standes zu bringen. Für den MVP ist Login mit Rolle `staff` und Stand-Zuordnung sicherer und ausreichend.

## Sicherheitskonzept

### Signierte Tokens

Der Token muss serverseitig signiert werden, z. B. als zufälliger Token mit HMAC-Signatur oder als kurzlebiger signierter Payload. Der Client darf Token nicht selbst erzeugen können.

Mindestinhalt der signierten Payload:

| Feld | Zweck |
| --- | --- |
| `token_id` | Datenbankreferenz |
| `type` | `order`, `stand`, `stand_product`, `staff` |
| `reference_id` | Referenz auf Order oder Stand |
| `exp` | Ablaufzeit |
| `nonce` | Zufälligkeit gegen Erraten |

### Ablaufzeit

Bestell-QRToken laufen nach Abholfenster plus Kulanzzeit ab. Beispiel:

```text
expires_at = pickup_slot_end + 2 hours
```

Stand-QR-Codes können ohne Ablauf funktionieren, müssen aber über Stand-Status oder Token-Revocation deaktivierbar sein.

### One-Time-Use

Bei erfolgreicher Abholung wird `used_at` gesetzt. Jeder weitere Scan wird abgelehnt.

### Hash-Speicherung

Der Klartext-Token wird nie gespeichert. Gespeichert wird nur:

```text
token_hash = sha256(token + server_secret_pepper)
```

Bei Scan wird der erhaltene Token erneut gehasht und mit der Datenbank verglichen.

### Keine sensiblen Daten im QR-Code

Der QR-Code enthält nicht:

| Nicht enthalten | Grund |
| --- | --- |
| Name des Kunden | DSGVO und Missbrauchsschutz |
| Telefonnummer | Nicht für Abholung nötig |
| Produktliste | Kann am Stand nach erfolgreicher Validierung aus API geladen werden |
| Zahlungsdaten | Werden nie in der App gespeichert |
| Preisdetails | Nicht für Tokenvalidierung nötig |

## Scan-Prozess

1. Stand-Mitarbeiter öffnet Staff UI.
2. Mitarbeiter wählt oder hat seinen Stand-Kontext.
3. Mitarbeiter scannt QR-Code.
4. Staff UI sendet Token und `standId` an Backend.
5. Backend prüft Signatur.
6. Backend hasht Token und sucht QRToken.
7. Backend prüft Typ `order`.
8. Backend prüft Ablauf, Status und One-Time-Use.
9. Backend lädt Order.
10. Backend prüft Order-Status `confirmed` oder `ready_for_pickup`.
11. Backend prüft, dass Order zum Stand des Mitarbeiters gehört.
12. Staff UI zeigt Bestellung.
13. Mitarbeiter übergibt Ware.
14. Mitarbeiter bestätigt Abholung.
15. Backend setzt Order auf `picked_up` und QRToken auf `used`.

## Manuelle Fallback-Codeeingabe

Jede Order erhält zusätzlich eine kurze `order_number`, z. B. `A7K4Q2`. Diese Nummer ist kein Ersatz für den sicheren QRToken, sondern ein Fallback für Support und schlechte Kameras.

Fallback-Regel:

| Schritt | Verhalten |
| --- | --- |
| Mitarbeiter gibt Code ein | Backend sucht Order im eigenen Stand-Kontext |
| Order gefunden | Staff UI zeigt Bestellung mit zusätzlicher Bestätigung |
| Order nicht eindeutig | Fehler und Supporthinweis |
| Abholung bestätigt | Gleiche Status- und Inventory-Logik wie beim QR-Scan |

## Missbrauchsrisiken und Gegenmaßnahmen

| Risiko | Gegenmaßnahme |
| --- | --- |
| QR-Code wird fotografiert und weitergegeben | One-Time-Use, Order-Status, Abholzeitfenster |
| QRToken wird geraten | Hohe Entropie, Signatur, Rate Limiting |
| Verwendeter QR-Code wird erneut genutzt | `used_at` prüfen und ablehnen |
| Mitarbeiter scannt fremden Stand | Staff-Stand-Zuordnung serverseitig prüfen |
| Token taucht in Logs auf | Token nicht vollständig loggen, nur gekürzte Hashes |
| WhatsApp-Link wird weitergeleitet | Kurzlebiger Zugriffstoken, optional Session-Pflicht, QRToken bleibt One-Time-Use |
| QR-Code enthält Kundendaten | Keine sensiblen Daten im Token oder QR-Inhalt |
| Abholung ohne Zahlung | QRToken erst nach Payment `succeeded` erzeugen |
| Manipulierter Token | Signaturprüfung und Hashvergleich |
