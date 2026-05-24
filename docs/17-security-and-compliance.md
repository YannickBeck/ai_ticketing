# Sicherheit und Compliance

Das MVP verarbeitet personenbezogene Daten, Zahlungsabläufe und abholrelevante QRToken. Sicherheit und DSGVO-Grundlagen müssen von Beginn an berücksichtigt werden, auch wenn das System bewusst einfach bleibt.

## DSGVO-Grundlagen

| Grundsatz | MVP-Umsetzung |
| --- | --- |
| Zweckbindung | Daten werden für Reservierung, Zahlung, Abholung, transaktionale Benachrichtigung und Support genutzt |
| Datensparsamkeit | Nur notwendige Kunden- und Bestelldaten speichern |
| Transparenz | Datenschutzhinweise, klare Service-Fee-Kommunikation und freiwilliges WhatsApp Opt-in |
| Löschbarkeit | Kundenkonto und personenbezogene Daten nach Regeln löschen/anonymisieren |
| Zugriffsbeschränkung | Rollenrechte und Mandantentrennung |
| Nachvollziehbarkeit | Audit Logs für kritische Aktionen |

## Datensparsamkeit

MVP-Daten sollten auf das Nötige reduziert werden.

| Datenart | Speichern? | Begründung |
| --- | --- | --- |
| Name | Ja | Abholung und Support |
| E-Mail | Ja | Login, Bestätigung, Support |
| Telefonnummer | Optional | Nur für Telefonverifikation oder freiwillige WhatsApp-Benachrichtigungen |
| Standort des Kunden | Nicht dauerhaft im MVP | Suche kann ohne Speicherung funktionieren |
| Zahlungsdaten | Nein | Ausschließlich beim Payment Provider |
| QRToken Klartext | Nein | Nur Hash speichern |
| Bestellhistorie | Ja, begrenzt | Support, Abrechnung, Pilotmetriken |

## Personenbezogene Daten

Personenbezogene Daten erscheinen in:

| Bereich | Daten |
| --- | --- |
| User | Name, E-Mail, optional Telefon |
| Order | Kundenzuordnung, Abholzeit, Produkte |
| Payment | Provider-Referenzen, Beträge, keine Kartendaten |
| Audit Logs | User-ID, Aktion, Zeitpunkt |
| E-Mail | Bestellbestätigung und QR-Link |
| WhatsApp | Telefonnummer, Opt-in-Zeitpunkt, Template-Keys und Versandstatus |
| Notification | Kanal, Empfänger, Provider-Referenz, Versandstatus und Fehler |

Stand-Mitarbeiter sollten nur die Informationen sehen, die zur Abholung nötig sind: Order-Code, Zeitfenster und Produkte. Name und E-Mail sollten nur angezeigt werden, wenn betrieblich erforderlich.

Telefonnummern sind personenbezogene Daten. Sie dürfen nur gespeichert und für WhatsApp genutzt werden, wenn der Kunde den Kanal freiwillig aktiviert hat oder eine andere rechtlich geprüfte Grundlage besteht. Opt-in, Opt-out und Zeitpunkt der Einwilligung müssen nachvollziehbar sein.

## Zahlungsdaten nicht selbst speichern

Die App speichert keine Karten-, Wallet- oder Bankdaten. Gespeichert werden nur technische Provider-Referenzen.

| Gespeichert | Nicht gespeichert |
| --- | --- |
| Stripe Payment Intent ID | Kartennummer |
| Stripe Checkout Session ID | CVC |
| Payment Status | Wallet-Zugangsdaten |
| Beträge und Gebühren | Bankdaten des Kunden |
| Refund-Referenzen | Zahlungsinstrumentdetails |

## Rollenrechte

RBAC ist serverseitig Pflicht.

| Rolle | Kritische Einschränkung |
| --- | --- |
| Kunde | Nur eigene Orders |
| Spargelbauer/Admin | Nur eigener `producer_id` |
| Stand-Mitarbeiter | Nur zugewiesene `stand_id` |
| Plattformadmin | Plattformweit, aber mit Audit Logs |

Jeder API-Endpunkt muss prüfen:

1. Authentifizierung.
2. Rolle.
3. Ressourcenbesitz.
4. Erlaubter Statusübergang.

## Sichere QRToken

QRToken sind sicherheitskritisch, weil sie Abholung ermöglichen.

| Anforderung | Umsetzung |
| --- | --- |
| Nicht erratbar | Hohe Entropie und zufälliger Nonce |
| Signiert | HMAC oder vergleichbare serverseitige Signatur |
| Gehasht gespeichert | Kein Klartext-Token in der Datenbank |
| Ablaufend | `expires_at` nach Abholfenster plus Kulanz |
| One-Time-Use | `used_at` und Status `used` |
| Keine sensiblen Daten | QR enthält nur Token oder Token-URL |
| Rate-limited | Scan-Endpunkt begrenzen |

## Rate Limiting

Rate Limiting ist im MVP besonders wichtig für:

| Endpunkt | Risiko |
| --- | --- |
| Login | Brute Force |
| `/api/v1/orders` | Inventory-Spam und Reservierungsblockade |
| `/api/v1/orders/{id}/payment-intent` | Payment-Missbrauch |
| `/api/v1/staff/scan` | Token-Raten |
| `/api/v1/webhooks/stripe` | Fehlkonfiguration oder Angriff |
| `/api/v1/webhooks/whatsapp` | Signaturfehler, Spam oder manipulierte Statusupdates |
| `/api/v1/me/phone/verify/*` | SMS-/Verifikationsmissbrauch und Enumeration |
| Public Stand Search | Scraping und Lastspitzen |

## Audit Logs

Audit Logs sollten für kritische Aktionen geschrieben werden.

| Aktion | Audit-Inhalt |
| --- | --- |
| Bestand geändert | User, Stand, Produkt, alter/neuer Wert |
| Abholung bestätigt | Staff User, Order, Zeitpunkt |
| Refund ausgelöst | User, Order, Betrag, Grund |
| Rolle geändert | Admin, Zielnutzer, alte/neue Rolle |
| QRToken abgelehnt | Grund, Stand-Kontext, gekürzter Hash |
| Payment Webhook verarbeitet | Provider Event ID, Ergebnis |
| WhatsApp Opt-in geändert | User-ID, Kanal, Status, Zeitpunkt |
| Notification gesendet | Channel, Template-Key, Order-ID, Provider Message ID |
| Notification fehlgeschlagen | Channel, Provider, gekürzter Fehler, Order-ID |

## Sichere Webhooks

Payment Webhooks dürfen nicht wie normale öffentliche API-Endpunkte behandelt werden.

| Anforderung | Umsetzung |
| --- | --- |
| Signaturprüfung | Provider-Signatur mit Raw Body prüfen |
| Idempotenz | Event ID eindeutig speichern |
| Minimaler Response | Schnell `2xx` nur nach erfolgreicher Verarbeitung |
| Keine Nutzer-Session | Sicherheit über Provider-Signatur |
| Statusübergänge validieren | Webhook überschreibt nicht blind |
| Monitoring | Fehlgeschlagene Webhooks alarmieren |

Für WhatsApp-Webhooks gelten dieselben Grundregeln. Delivery-Status-Webhooks dürfen nur den Versandstatus einer bestehenden Notification aktualisieren. Eingehende Nachrichten werden im MVP nicht als Bestellkanal genutzt und dürfen keine Reservierungen, Stornos oder Umbuchungen auslösen.

## Secrets Management

Secrets dürfen nicht im Repository liegen.

| Secret | Speicherort |
| --- | --- |
| Datenbank-URL | `.env.local` lokal, Azure Key Vault/Service Config in Production |
| Auth Secret | Secret Store |
| Stripe Secret Key | Secret Store |
| Stripe Webhook Secret | Secret Store |
| QRToken Signing Secret | Secret Store |
| E-Mail API Key | Secret Store |
| WhatsApp Provider Token | Secret Store |
| WhatsApp Webhook Secret | Secret Store |

Für Azure App Service sollte Azure Key Vault oder App Service Configuration mit restriktiven Zugriffsrechten genutzt werden.

## Datenschutzrisiken

| Risiko | Gegenmaßnahme |
| --- | --- |
| Zu viele Kundendaten im Staff UI | Daten minimieren, nur abholrelevante Informationen zeigen |
| Standortdaten dauerhaft speichern | Kundensuche ohne persistente Standorthistorie |
| QR-Link in E-Mail wird weitergeleitet | One-Time-Use, Ablaufzeit und Standprüfung |
| Payment-Daten versehentlich loggen | Logging-Filter und keine Provider-Payloads vollständig speichern |
| Admin sieht fremde Produzenten | `producer_id`-Filter und Tests |
| Token in Logs | Nur gekürzte Hashes loggen |
| Daten zu lange speichern | Aufbewahrungs- und Löschkonzept definieren |
| WhatsApp Opt-in unsauber eingeholt | Explizite Einwilligung, Zeitstempel, klare Abmeldefunktion |
| WhatsApp wird als störend empfunden | Freiwilligkeit, begrenzte Nachrichtenfrequenz, Opt-out jederzeit |
| WhatsApp-Zustellung nicht garantiert | App/PWA und E-Mail bleiben Fallback |
| Provider-Kosten steigen | Nachrichten pro Bestellung begrenzen und Kosten monitoren |
| Templates werden nicht genehmigt | Frühzeitig Template-Keys definieren und Fallback-Kommunikation vorsehen |

## Mindestmaßnahmen vor Pilot

1. Datenschutzerklärung und Impressum veröffentlichen.
2. Auftragsverarbeitung mit relevanten Dienstleistern prüfen.
3. Payment Provider korrekt konfigurieren.
4. Secrets aus Repository und Logs fernhalten.
5. RBAC-Tests für alle geschützten Endpunkte schreiben.
6. QRToken-Sicherheit testen.
7. Webhook-Signaturprüfung und Idempotenz testen.
8. Backup- und Restore-Prozess für Datenbank testen.
9. WhatsApp Opt-in, Opt-out und Datenschutzhinweise prüfen.
10. Auftragsverarbeitung oder Datenschutzbewertung für WhatsApp-Provider klären.
11. WhatsApp-Templates und Versandfrequenz vor Pilot freigeben.
