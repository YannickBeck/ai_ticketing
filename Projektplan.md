Der verlinkte Claude-Artifact konnte über den Webzugriff nicht geladen werden; der Abruf ist mit einem Fetch-Fehler fehlgeschlagen.  Ich habe den Projektplan daher auf Basis deiner Beschreibung und einer realistisch umsetzbaren MVP-Infrastruktur aufgebaut.

# Projektplan: „Spargelstand-App“

## 1. Produktvision

Die **Spargelstand-App** digitalisiert dezentrale landwirtschaftliche Verkaufsstände, zum Beispiel Spargel-, Erdbeer- oder Hofladenstände. Kunden sehen, welche Stände in ihrer Nähe geöffnet sind, welche Produkte verfügbar sind und können Produkte verbindlich reservieren, digital bezahlen und per QR-Code abholen.

Der eigentliche Mehrwert liegt nicht im reinen Produktkatalog, sondern in der Kombination aus:

**Local Discovery + garantierter Reservierung + digitaler Zahlung + QR-Abholung + datengetriebener Lieferplanung.**

Der Kunde kauft Sicherheit und Komfort. Der Produzent erhält bessere Planbarkeit, weniger Fehlmengen, weniger Überbestand und mehr Transparenz über die Nachfrage je Standort.

---

## 2. Zielbild und Kernnutzen

### Für Kunden

Kunden sollen nicht mehr „auf gut Glück“ zu einem Verkaufsstand fahren. Sie sehen verfügbare Produkte, reservieren verbindlich und erhalten einen QR-Code zur Abholung.

**Kundennutzen:**

| Problem heute                                | Lösung durch App              |
| -------------------------------------------- | ----------------------------- |
| Kunde weiß nicht, ob Ware noch verfügbar ist | Verfügbarkeitsstatus je Stand |
| Kunde fährt umsonst zum Stand                | verbindliche Reservierung     |
| Bargeld nötig                                | digitale Zahlung              |
| Warteschlange / unklare Bestellung           | QR-Code-Abholung              |
| Bestellung und QR-Code schwer auffindbar     | optionale WhatsApp-Updates    |
| Keine Info bei Nachlieferung                 | spätere Push-/WhatsApp-Benachrichtigung |

### Für Spargelbauer / Produzenten

Der Produzent sieht, welche Nachfrage an welchem Standort entsteht und kann Liefermengen besser planen.

**Produzentennutzen:**

| Problem heute                     | Lösung durch App                  |
| --------------------------------- | --------------------------------- |
| unklare Nachfrage je Standort     | Reservierungs- und Nachfragedaten |
| Unterlieferung an starken Ständen | Lieferempfehlungen                |
| Überbestand an schwachen Ständen  | bessere Umverteilung              |
| viel Bargeldhandling              | digitale Zahlungsflüsse           |
| keine Echtzeittransparenz         | Admin-Dashboard                   |

---

# 3. MVP-Ziel

Das MVP soll beweisen, dass Kunden bereit sind, für eine **garantierte Reservierung** eine kleine Servicegebühr zu zahlen und dass Produzenten durch Reservierungsdaten bessere Lieferentscheidungen treffen können.

## MVP-Erfolgshypothese

> Wenn Kunden lokale Verkaufsstände mit Verfügbarkeit sehen und Produkte verbindlich reservieren können, sinkt die Zahl erfolgloser Fahrten, während der Produzent seine Ware besser auf Standorte verteilen kann.

## MVP-Annahmen

| Annahme                                                     | Bedeutung                                   |
| ----------------------------------------------------------- | ------------------------------------------- |
| Produzent kann Bestände manuell pflegen                     | POS-Integration ist für MVP nicht notwendig |
| Kunden akzeptieren Service Fee für garantierte Reservierung | Marge entsteht nicht durch Produktaufschlag |
| Stand-Mitarbeiter können QR-Codes scannen oder bestätigen   | Abholung wird digital nachvollziehbar       |
| Saisonaler Betrieb reicht für ersten Test                   | MVP muss nicht sofort ganzjährig skalieren  |
| Ein Produzent mit mehreren Ständen genügt für Pilot         | Multi-Produzenten-Marktplatz später         |
| WhatsApp kann als optionaler Komfortkanal getestet werden   | Benachrichtigung ja, Bestellung per WhatsApp später |

---

# 4. MVP-Scope

## Im MVP enthalten

### 1. Standortbasierte Übersicht

Kunden sehen Verkaufsstände auf Karte und Liste.

**Funktionen:**

| Feature          | Beschreibung                              | Priorität |
| ---------------- | ----------------------------------------- | --------- |
| Standortfreigabe | Kunde erlaubt Standortzugriff             | Muss      |
| Kartenansicht    | Stände in Umgebung anzeigen               | Muss      |
| Listenansicht    | sortiert nach Entfernung                  | Muss      |
| Filter           | Produkt, Entfernung, Öffnungsstatus       | Muss      |
| Standdetailseite | Adresse, Öffnungszeiten, Produkte, Status | Muss      |
| Navigation       | Link zu Google Maps / Apple Maps          | Sollte    |

Für Kartenfunktionen kann im MVP ein Standard-Kartenanbieter genutzt werden. Google bietet offizielle Maps SDKs für Android und iOS, mit denen Karten, Marker und Interaktionen in Apps eingebunden werden können. ([Google for Developers][1])

---

### 2. Produktverfügbarkeit

Produkte werden je Stand angezeigt.

**Produktbeispiele:**

| Produkt           |         Einheit | Statuslogik                     |
| ----------------- | --------------: | ------------------------------- |
| Spargel Klasse I  |              kg | verfügbar / wenig / ausverkauft |
| Spargel Klasse II |              kg | verfügbar / wenig / ausverkauft |
| Erdbeeren         |     Schale / kg | verfügbar / wenig / ausverkauft |
| Kartoffeln        |       kg / Sack | später                          |
| Eier              | Stück / Packung | später                          |

**Statuslogik MVP:**

| Status                     | Regelbeispiel                       |
| -------------------------- | ----------------------------------- |
| verfügbar                  | verfügbarer Bestand > Schwellenwert |
| wenig verfügbar            | Bestand unter Schwellenwert         |
| ausverkauft                | verfügbarer Bestand = 0             |
| nächste Lieferung erwartet | nächste geplante Lieferung gepflegt |

**Wichtig:**
Der verfügbare Bestand ist nicht nur der manuell eingetragene Bestand, sondern:

```text
verfügbarer Bestand = gemeldeter Bestand - reservierte Menge - Sicherheitsbestand
```

---

### 3. Vorbestellung / Reservierung

Die Reservierung ist das Core Feature.

**Ablauf:**

1. Kunde wählt Stand.
2. Kunde wählt Produkt.
3. Kunde definiert Menge.
4. Kunde wählt Abholzeitfenster.
5. System prüft Bestand.
6. System blockiert Menge temporär.
7. Kunde bezahlt.
8. Reservierung wird bestätigt.
9. Kunde erhält QR-Code.
10. Kunde erhält optional WhatsApp-Bestätigung und Abholerinnerung.

**Reservierungslogik:**

| Zustand          | Bedeutung                           |
| ---------------- | ----------------------------------- |
| Draft            | Bestellung begonnen                 |
| Pending Payment  | Bestand temporär blockiert          |
| Confirmed        | bezahlt und reserviert              |
| Ready for Pickup | optional durch Mitarbeiter markiert |
| Picked Up        | abgeholt                            |
| Cancelled        | storniert                           |
| Expired          | nicht bezahlt / nicht abgeholt      |
| Refunded         | erstattet                           |

---

### 4. Digitale Bezahlung

Im MVP sollte ein Payment Provider verwendet werden, der Karten, Wallets und Plattformgebühren unterstützt.

**Empfehlung MVP:**
Stripe Connect mit Express Checkout / Payment Element.

Stripe unterstützt mit dem Express Checkout Element unter anderem Apple Pay, Google Pay, PayPal, Klarna, Amazon Pay und Link; das Payment Element unterstützt viele Zahlungsarten über eine einheitliche Integration. ([Stripe Docs][2]) Für ein Marktplatzmodell kann Stripe Connect genutzt werden, um Zahlungen auf der Plattform zu erfassen, Gebühren einzubehalten und Beträge an verbundene Konten weiterzuleiten. ([Stripe Docs][3])

**Alternativ / zusätzlich:**
PayPal Orders API für reine PayPal-Zahlungen. PayPal beschreibt Orders als Zahlung zwischen mehreren Parteien und bietet über die Orders v2 API Erstellen, Abrufen, Autorisieren und Capturing von Orders an. ([PayPal Developer][4])

## Zahlungsprinzip

Wichtig: Der Aufpreis wird **nicht auf das Produkt selbst** erhoben, sondern auf die **garantierte Reservierung / Komfortleistung**.

Beispiel:

| Position              |                             Betrag |
| --------------------- | ---------------------------------: |
| 2 kg Spargel Klasse I |                            24,00 € |
| Reservierungsservice  |                             0,99 € |
| Gesamtzahlung Kunde   |                            24,99 € |
| Auszahlung Produzent  |     24,00 € abzüglich Payment Fees |
| Plattformmarge        | 0,99 € abzüglich anteiliger Kosten |

---

### 5. QR-Code-Funktionalität

QR-Codes sind zentral für Standöffnung, Reservierung und Abholung.

## QR-Code-Typen

| QR-Code                | Zweck                                  |
| ---------------------- | -------------------------------------- |
| Stand-QR-Code          | Öffnet Standdetailseite                |
| Produkt-/Stand-QR-Code | Öffnet Produktauswahl für diesen Stand |
| Bestell-QR-Code        | Dient zur Abholung                     |
| Mitarbeiter-QR / Login | optional für Standpersonal             |

## QR-Abholung MVP

1. Kunde kommt zum Stand.
2. Kunde zeigt QR-Code.
3. Mitarbeiter scannt QR-Code oder gibt Code manuell ein.
4. System prüft Bestellung.
5. Mitarbeiter übergibt Ware.
6. Bestellung wird auf „abgeholt“ gesetzt.
7. Bestand wird final reduziert.
8. Übergabe wird protokolliert.

**Sicherheitsregel:**
Der QR-Code darf nicht nur eine einfache Bestellnummer enthalten. Er sollte einen signierten, einmalig nutzbaren Token enthalten.

Beispiel:

```text
https://app.spargelstand.de/pickup/order_123?token=signed_secure_token
```

Für WhatsApp gilt eine strengere Trennung: Die Nachricht enthält nur einen sicheren Link zur Bestellung oder QR-Code-Seite. Dieser Link darf keinen unsicheren QRToken-Klartext enthalten und muss über eine authentifizierte Session oder einen separat signierten, zeitlich begrenzten Zugriffstoken geschützt sein.

---

### 6. WhatsApp Order Updates

WhatsApp wird im MVP als optionaler Benachrichtigungs- und Statuskanal ergänzt. Die Reservierung, Zahlung und QR-Abholung bleiben weiterhin Kernfunktionen der App/PWA.

**MVP-Funktionen:**

| Funktion | Beschreibung | Priorität |
| -------- | ------------ | --------- |
| WhatsApp Opt-in | Kunde aktiviert WhatsApp freiwillig im Checkout oder Profil | Sollte |
| Telefonnummer speichern | Normalisiert, datensparsam und mit Opt-in-Zeitpunkt | Sollte |
| Bestell-/Zahlungsbestätigung | Nachricht nach erfolgreicher Zahlung | Sollte |
| Abholerinnerung | Nachricht vor dem Abholfenster | Sollte |
| QR-Link | Sicherer Link zur Bestellung oder QR-Code-Seite | Sollte |
| Statusänderung | z. B. Lieferverzögerung oder abholbereit | Sollte |
| Abholbestätigung | Optional nach Übergabe | Optional |

**Wichtig:**
WhatsApp ist im MVP ein Bestellbegleiter, kein vollständiger Bestellkanal. Produktauswahl, Reservierung, Zahlung und QR-Code bleiben in der App/PWA.

---

### 7. Admin-Dashboard für Produzenten

Der Spargelbauer erhält ein webbasiertes Dashboard.

**MVP-Funktionen:**

| Bereich        | Funktion                                             |
| -------------- | ---------------------------------------------------- |
| Stände         | Standorte, Öffnungszeiten, Status verwalten          |
| Produkte       | Produkte, Preise, Einheiten, Verfügbarkeit verwalten |
| Bestand        | Bestand je Stand manuell pflegen                     |
| Reservierungen | offene und abgeschlossene Bestellungen sehen         |
| Benachrichtigungen | WhatsApp Opt-in, Versandstatus und fehlgeschlagene Nachrichten sehen |
| Nachfrage      | Nachfrage nach Standort, Produkt und Zeitfenster     |
| Lieferplanung  | einfache Lieferempfehlungen                          |
| Umsätze        | Umsatz je Stand / Produkt / Zeitraum                 |

---

### 8. Stand-Mitarbeiter-Ansicht

Im MVP reicht eine einfache mobile Webansicht.

**Funktionen:**

| Funktion                            | Beschreibung                         |
| ----------------------------------- | ------------------------------------ |
| Login mit Rolle „Stand-Mitarbeiter“ | Zugriff nur auf eigenen Stand        |
| Offene Bestellungen                 | Liste nach Abholzeit                 |
| QR-Code scannen                     | Bestellung bestätigen                |
| Bestand aktualisieren               | manuelle Eingabe                     |
| Out-of-Stock Button                 | Produkt sofort ausverkauft markieren |
| Lieferung eingetroffen              | Bestand erhöhen / Status ändern      |

---

# 5. Nicht-Ziele des MVP

Damit das MVP realistisch bleibt, werden folgende Punkte bewusst ausgeschlossen:

| Nicht-Ziel                                 | Begründung                                               |
| ------------------------------------------ | -------------------------------------------------------- |
| Vollständige POS-/Kassenintegration        | zu komplex für ersten Pilot                              |
| KI-basierte Nachfrageprognose              | erst nach historischen Daten sinnvoll                    |
| Mehrere Produzenten als offener Marktplatz | MVP startet mit 1–3 Pilotproduzenten                     |
| Native Mitarbeiter-App                     | Web-App reicht zunächst                                  |
| Komplexe Buchhaltung / DATEV-Export        | Phase 2                                                  |
| Lagerverwaltung über mehrere Zentrallager  | Phase 2                                                  |
| Lieferung an Endkunden                     | Fokus bleibt Pickup                                      |
| Loyalty / Gutscheine / Rabattlogik         | später                                                   |
| Dynamische Preise                          | nicht MVP-relevant                                       |
| Offline-first Betrieb                      | als Risiko berücksichtigen, aber nicht vollständig lösen |
| Vollständiger WhatsApp-Chatbot             | MVP nutzt WhatsApp nur für transaktionale Updates         |
| Vollständige Bestellung per WhatsApp       | App/PWA bleibt verbindlicher Bestell- und Zahlungsort     |
| KI-basierte WhatsApp-Beratung              | nicht nötig für Reservierungsgarantie                     |
| Automatische Produktempfehlung per WhatsApp | erst nach Datenbasis und Opt-in-Konzept                   |
| Komplexe WhatsApp-Flows für Storno/Umbuchung/Reklamation | zu hoher Support- und Compliance-Scope im Pilot |

---

# 6. Rollenmodell

## 6.1 Kunde

**Ziele:**

* nahe Verkaufsstände finden
* Verfügbarkeit prüfen
* Produkte reservieren
* digital bezahlen
* QR-Code zur Abholung nutzen
* optional WhatsApp-Benachrichtigungen erhalten

**Rechte:**

| Aktion                      | Erlaubt |
| --------------------------- | ------- |
| Stände ansehen              | ja      |
| Produkte ansehen            | ja      |
| Reservierung erstellen      | ja      |
| bezahlen                    | ja      |
| eigene Bestellungen ansehen | ja      |
| WhatsApp Opt-in/Opt-out ändern | ja   |
| Bestand ändern              | nein    |
| Lieferplanung sehen         | nein    |

---

## 6.2 Spargelbauer / Admin

**Ziele:**

* Stände verwalten
* Produkte und Preise pflegen
* Bestände und Reservierungen überwachen
* Liefermengen planen
* Umsatz und Nachfrage auswerten

**Rechte:**

| Aktion                           | Erlaubt                    |
| -------------------------------- | -------------------------- |
| Stände erstellen/bearbeiten      | ja                         |
| Produkte erstellen/bearbeiten    | ja                         |
| Preise pflegen                   | ja                         |
| Bestände anpassen                | ja                         |
| Mitarbeiter verwalten            | ja                         |
| Bestellungen einsehen            | ja                         |
| Zahlungen / Gebühren sehen       | ja                         |
| Systemweite Plattformdaten sehen | nein, außer Plattformadmin |

---

## 6.3 Stand-Mitarbeiter

**Ziele:**

* offene Bestellungen sehen
* Abholungen bestätigen
* Bestand aktuell halten
* Ware als ausverkauft markieren

**Rechte:**

| Aktion                    | Erlaubt       |
| ------------------------- | ------------- |
| eigener Stand einsehen    | ja            |
| offene Bestellungen sehen | ja            |
| QR-Code scannen           | ja            |
| Bestand anpassen          | ja            |
| Preise ändern             | optional nein |
| andere Stände sehen       | nein          |
| Umsatz gesamt sehen       | nein          |

---

## 6.4 Plattformadmin

Optional im MVP, aber sinnvoll für Betrieb.

**Rechte:**

* Produzenten verwalten
* Gebührenmodell konfigurieren
* Supportfälle prüfen
* Systemmonitoring
* Zahlungs- und Fehlerlogs einsehen
* WhatsApp-Templates und Notification-Logs prüfen
* Missbrauch / Stornos / Rückerstattungen bearbeiten

---

# 7. User Stories

## Kunde

| ID   | User Story                                                                               | Priorität |
| ---- | ---------------------------------------------------------------------------------------- | --------- |
| K-01 | Als Kunde möchte ich Stände in meiner Nähe sehen, damit ich weiß, wo ich einkaufen kann. | Muss      |
| K-02 | Als Kunde möchte ich Produkte je Stand sehen, damit ich weiß, was angeboten wird.        | Muss      |
| K-03 | Als Kunde möchte ich sehen, ob ein Produkt verfügbar ist, damit ich nicht umsonst fahre. | Muss      |
| K-04 | Als Kunde möchte ich eine Menge reservieren, damit die Ware für mich zurückgelegt wird.  | Muss      |
| K-05 | Als Kunde möchte ich ein Abholzeitfenster wählen, damit ich planen kann.                 | Muss      |
| K-06 | Als Kunde möchte ich digital bezahlen, damit ich kein Bargeld brauche.                   | Muss      |
| K-07 | Als Kunde möchte ich einen QR-Code erhalten, damit ich die Ware schnell abholen kann.    | Muss      |
| K-08 | Als Kunde möchte ich meine Bestellung stornieren können, falls ich nicht kommen kann.    | Sollte    |
| K-09 | Als Kunde möchte ich benachrichtigt werden, wenn Ware wieder verfügbar ist.              | Phase 2   |
| K-10 | Als Kunde möchte ich optional WhatsApp-Benachrichtigungen aktivieren, damit ich wichtige Bestellinformationen direkt erhalte. | Sollte |
| K-11 | Als Kunde möchte ich nach der Reservierung eine WhatsApp-Bestätigung erhalten, damit ich meine Bestellung schnell wiederfinde. | Sollte |
| K-12 | Als Kunde möchte ich vor meinem Abholfenster per WhatsApp erinnert werden, damit ich die Ware rechtzeitig abhole. | Sollte |
| K-13 | Als Kunde möchte ich einen Link zu meinem QR-Code per WhatsApp erhalten, damit ich ihn am Stand schnell öffnen kann. | Sollte |
| K-14 | Als Kunde möchte ich über relevante Änderungen per WhatsApp informiert werden, z. B. bei Lieferverzögerung. | Sollte |

## Spargelbauer / Admin

| ID   | User Story                                                    | Priorität |
| ---- | ------------------------------------------------------------- | --------- |
| A-01 | Als Admin möchte ich Stände anlegen und bearbeiten.           | Muss      |
| A-02 | Als Admin möchte ich Produkte und Preise pflegen.             | Muss      |
| A-03 | Als Admin möchte ich Bestände je Stand aktualisieren.         | Muss      |
| A-04 | Als Admin möchte ich Reservierungen je Standort sehen.        | Muss      |
| A-05 | Als Admin möchte ich Nachfrage je Produkt und Zeitraum sehen. | Muss      |
| A-06 | Als Admin möchte ich Lieferempfehlungen erhalten.             | Sollte    |
| A-07 | Als Admin möchte ich Umsätze nach Standort sehen.             | Sollte    |
| A-08 | Als Admin möchte ich Exporte für Buchhaltung erzeugen.        | Phase 2   |
| A-09 | Als Produzent möchte ich sehen können, ob Kunden WhatsApp-Benachrichtigungen aktiviert haben. | Sollte |
| A-10 | Als Produzent möchte ich, dass Kunden automatisch an Abholungen erinnert werden, damit No-shows reduziert werden. | Sollte |
| A-11 | Als Produzent möchte ich bei Lieferverzögerungen Kunden informieren können. | Sollte |

## Stand-Mitarbeiter

| ID   | User Story                                                                  | Priorität |
| ---- | --------------------------------------------------------------------------- | --------- |
| S-01 | Als Mitarbeiter möchte ich offene Bestellungen meines Standes sehen.        | Muss      |
| S-02 | Als Mitarbeiter möchte ich QR-Codes scannen, um Abholungen zu bestätigen.   | Muss      |
| S-03 | Als Mitarbeiter möchte ich Bestand manuell ändern.                          | Muss      |
| S-04 | Als Mitarbeiter möchte ich Produkte als ausverkauft markieren.              | Muss      |
| S-05 | Als Mitarbeiter möchte ich sehen, wann die nächste Lieferung erwartet wird. | Sollte    |

## Plattformadmin

| ID   | User Story | Priorität |
| ---- | ---------- | --------- |
| P-01 | Als Plattformadmin möchte ich WhatsApp-Templates verwalten oder dokumentieren können. | Sollte |
| P-02 | Als Plattformadmin möchte ich Versandfehler einsehen können. | Sollte |
| P-03 | Als Plattformadmin möchte ich nachvollziehen können, welche Benachrichtigungen zu einer Bestellung versendet wurden. | Sollte |

---

# 8. Priorisierte Feature-Liste

## P0 – Kritisch für MVP

| Feature                     | Beschreibung                             |
| --------------------------- | ---------------------------------------- |
| Nutzerregistrierung / Login | Kunde, Admin, Mitarbeiter                |
| Rollenrechte                | Zugriff je Rolle                         |
| Standverwaltung             | Standorte, Öffnungszeiten                |
| Produktverwaltung           | Produkte, Preise, Einheiten              |
| Standortsuche               | Karte / Liste / Entfernung               |
| Verfügbarkeitsanzeige       | je Stand und Produkt                     |
| Reservierung                | Produkt, Menge, Stand, Zeitfenster       |
| Bestandsblockierung         | reservierte Menge wird abgezogen         |
| Payment                     | digitale Zahlung                         |
| QR-Code Bestellung          | Abholung per QR                          |
| Mitarbeiteransicht          | offene Bestellungen + Abholung           |
| Admin-Dashboard             | Stände, Produkte, Bestellungen, Bestände |

## P1 – Wichtig für Pilot

| Feature             | Beschreibung                      |
| ------------------- | --------------------------------- |
| Lieferempfehlung    | einfache regelbasierte Empfehlung |
| nächste Lieferung   | Anzeige im Standdetail            |
| Storno / Erstattung | einfache Storno-Regel             |
| E-Mail-Bestätigung  | Bestellbestätigung                |
| WhatsApp-Benachrichtigungen | Opt-in, Bestellbestätigung, Abholerinnerung, sicherer QR-Link |
| Notification Log    | Versandstatus und Fehler nachvollziehen |
| Umsatzübersicht     | je Stand / Zeitraum               |
| Bestandsverlauf     | Inventory Events                  |

## P2 – Phase 2

| Feature                      | Beschreibung                         |
| ---------------------------- | ------------------------------------ |
| Push-Benachrichtigungen      | Wiederverfügbarkeit, Abholerinnerung |
| POS-Integration              | automatisierte Bestandsupdates       |
| Analytics                    | Nachfrageprofile                     |
| digitale Quittungen          | Download / E-Mail                    |
| DATEV / Buchhaltung          | Export                               |
| Nachfrageprognose            | historisch / wetterabhängig          |
| native Mitarbeiter-App       | Offline-Modus, Scanner               |
| Multi-Produzenten-Marktplatz | mehrere Betriebe                     |
| saisonale Produkte           | Kürbis, Eier, Weihnachtsbäume        |
| Bestellung per WhatsApp      | vollständiger Chat-/Bestellflow      |
| WhatsApp Statusabfrage       | eingehende Nachrichten und Statusantwort |
| Conversational Commerce      | Produktsuche, Wiederbestellung und Payment Link |

---

# 9. Geschäftsmodell

## Grundprinzip

Die Plattform verdient primär an der **Reservierungsleistung**, nicht am Warenaufschlag.

Der Kunde zahlt für:

* garantierte Verfügbarkeit
* sichere Abholung
* Komfort
* digitale Zahlung
* bequeme Abholinformation per App/PWA, E-Mail oder optional WhatsApp
* Zeitersparnis

Der Produzent profitiert durch:

* höhere Planungssicherheit
* weniger Kaufabbrüche
* bessere Verteilung
* weniger Bargeldprozesse
* zusätzliche Nachfragekanäle

---

## Gebührenmodell-Optionen

### Modell A: Service Fee pro Reservierung

| Position                     |        Beispiel |
| ---------------------------- | --------------: |
| Kunde zahlt pro Reservierung | 0,49 € – 1,49 € |
| Produzent zahlt Grundgebühr  |             0 € |
| Plattformmarge               |     Service Fee |

**Vorteil:** Einfach für kleine Produzenten.
**Nachteil:** Umsatz hängt stark vom Reservierungsvolumen ab.

---

### Modell B: Grundgebühr + Transaktionsgebühr

| Position                      |                 Beispiel |
| ----------------------------- | -----------------------: |
| Produzent monatlich           |              29 € – 99 € |
| je erfolgreicher Reservierung |          0,15 € – 0,39 € |
| Kunden-Service-Fee            | optional 0,49 € – 0,99 € |

**Vorteil:** Planbare Plattformumsätze.
**Nachteil:** Produzenten müssen vorab überzeugt werden.

---

### Modell C: Saisonpaket

| Position                   |              Beispiel |
| -------------------------- | --------------------: |
| Saisonlizenz pro Produzent |         299 € – 999 € |
| Standgebühr pro Standort   | 49 € – 149 € / Saison |
| Reservierungsgebühr        |    optional reduziert |

**Vorteil:** Passt gut zu Spargel-/Erdbeersaison.
**Nachteil:** Höhere Einstiegshürde.

---

## Empfohlenes MVP-Modell

Für den Pilot empfehle ich:

| Komponente   | Empfehlung                                   |
| ------------ | -------------------------------------------- |
| Produzent    | keine oder geringe Grundgebühr               |
| Kunde        | 0,49 € – 0,99 € Reservierungsservice         |
| Plattform    | Service Fee + später SaaS-Gebühr             |
| Payment Fees | transparent durchgereicht oder einkalkuliert |
| WhatsApp-Kosten | Provider-Kosten pro Nachricht oder Conversation einkalkulieren |
| Pilotangebot | 0 € Setup für ersten Betrieb gegen Feedback  |

**MVP-Logik:**
Erst Nachweis der Nachfrage, danach Monetarisierung über saisonales SaaS-Paket.

WhatsApp kann die Akzeptanz einer kleinen Service Fee erhöhen, weil der Kunde nicht nur für die Reservierung zahlt, sondern für garantierte Verfügbarkeit plus bequeme Abholinformation. Im MVP sollte die Anzahl der WhatsApp-Nachrichten auf 2-3 pro Bestellung begrenzt werden: Bestätigung, Abholerinnerung und optional Abholabschluss oder Statusänderung.

---

# 10. Technische Architektur

## 10.1 Zielarchitektur MVP

```text
Mobile App / PWA
        |
        v
Backend API
        |
        +-- Auth & Rollenrechte
        +-- Stand- und Produktverwaltung
        +-- Inventory Engine
        +-- Order Management
        +-- Payment Integration
        +-- QR-Code-Service
        +-- Notification Service
        |       +-- E-Mail Provider
        |       +-- WhatsApp Provider
        |
        v
PostgreSQL Datenbank
        |
        +-- Admin Dashboard
        +-- Mitarbeiter Web-App
        +-- Analytics / Reporting
```

---

## 10.2 Empfohlener MVP-Stack

| Baustein        | Empfehlung MVP                                  |
| --------------- | ----------------------------------------------- |
| Mobile App      | React Native mit Expo oder PWA mit Next.js      |
| Admin Dashboard | Next.js Web-App                                 |
| Backend         | Node.js / NestJS oder Next.js API               |
| Datenbank       | PostgreSQL                                      |
| Geo-Suche       | PostGIS oder geohash-basierte Standortsuche     |
| Auth            | Supabase Auth, Auth0 oder Firebase Auth         |
| Rollenrechte    | RBAC im Backend                                 |
| Payment         | Stripe Connect, optional PayPal                 |
| QR-Code         | serverseitige QR-Generierung + signierte Tokens |
| Hosting         | Vercel / Render / Railway / Azure App Service   |
| Storage         | S3-kompatibel / Supabase Storage                |
| Monitoring      | Sentry + Logging                                |
| E-Mail          | Resend / SendGrid / Mailgun                     |
| WhatsApp        | WhatsApp Business Platform / Cloud API oder Provider wie Twilio, Bird/MessageBird, 360dialog |
| Push später     | Firebase Cloud Messaging / Expo Push            |

## 10.3 Notification Service

Der Notification Service ist für E-Mail, WhatsApp und später Push zuständig. Er wird durch Order Events ausgelöst, versendet Nachrichten über Provider und speichert Versandstatus.

```text
Order Management
    ↓
Order Event
    ↓
Notification Service
    ↓
WhatsApp Provider
    ↓
Kunde
```

**MVP-Ereignisse:**

| Event | Nachricht |
| ----- | --------- |
| `order.confirmed` | Bestellbestätigung |
| `payment.succeeded` | Zahlungsbestätigung |
| `pickup.reminder_due` | Abholerinnerung |
| `order.ready_for_pickup` | Bestellung ist abholbereit |
| `order.changed` | Statusänderung, z. B. Lieferverzögerung |
| `order.picked_up` | optionale Abholbestätigung |
| `order.cancelled` | Storno-/Statusinformation |

Proaktive WhatsApp-Nachrichten müssen über genehmigte Message Templates laufen. Webhooks für Delivery Status und eingehende Nachrichten werden vorbereitet; eingehende Nachrichten sind im MVP aber kein Chatbot und kein Bestellkanal.

## 10.4 Azure-nahe Variante

Da du früher Azure App Service erwähnt hattest, wäre auch eine Azure-nahe Variante möglich:

| Baustein   | Azure-Option                              |
| ---------- | ----------------------------------------- |
| Frontend   | Azure Static Web Apps oder App Service    |
| Backend    | Azure App Service Node.js                 |
| Datenbank  | Azure Database for PostgreSQL             |
| Storage    | Azure Blob Storage                        |
| Auth       | Auth0 / Entra External ID / Supabase Auth |
| Monitoring | Application Insights                      |
| Secrets    | Azure Key Vault                           |

---

# 11. Datenmodell auf hoher Ebene

## Kernentitäten

### User

| Feld        | Beschreibung                              |
| ----------- | ----------------------------------------- |
| id          | eindeutige User-ID                        |
| name        | Name                                      |
| email       | E-Mail                                    |
| phone_number | optionale Telefonnummer                  |
| phone_verified_at | Zeitpunkt der Telefonverifikation       |
| whatsapp_opt_in | WhatsApp-Benachrichtigungen aktiv       |
| whatsapp_opt_in_at | Zeitpunkt der WhatsApp-Einwilligung     |
| whatsapp_opt_out_at | Zeitpunkt der WhatsApp-Deaktivierung    |
| preferred_notification_channel | email / whatsapp / push                 |
| role        | customer / admin / staff / platform_admin |
| producer_id | falls Admin oder Mitarbeiter              |
| created_at  | Erstellung                                |

### Producer

| Feld               | Beschreibung           |
| ------------------ | ---------------------- |
| id                 | Produzent              |
| name               | Hof / Betrieb          |
| billing_info       | Abrechnung             |
| payment_account_id | Stripe/Payment Account |
| status             | aktiv / pausiert       |

### Stand

| Feld                 | Beschreibung                               |
| -------------------- | ------------------------------------------ |
| id                   | Stand-ID                                   |
| producer_id          | zugehöriger Betrieb                        |
| name                 | z. B. „Stand Mannheim Ost“                 |
| address              | Adresse                                    |
| latitude / longitude | Standort                                   |
| opening_hours        | Öffnungszeiten                             |
| status               | geöffnet / geschlossen / saisonal pausiert |
| qr_code_url          | Stand-QR                                   |

### Product

| Feld        | Beschreibung               |
| ----------- | -------------------------- |
| id          | Produkt-ID                 |
| producer_id | Betrieb                    |
| name        | z. B. Spargel Klasse I     |
| category    | Spargel / Erdbeeren / etc. |
| unit        | kg / Schale / Bund         |
| price       | Preis je Einheit           |
| active      | sichtbar ja/nein           |

### StandProduct / Inventory

| Feld              | Beschreibung                    |
| ----------------- | ------------------------------- |
| stand_id          | Stand                           |
| product_id        | Produkt                         |
| stock_quantity    | gemeldeter Bestand              |
| reserved_quantity | reservierte Menge               |
| safety_buffer     | Sicherheitsbestand              |
| status            | verfügbar / wenig / ausverkauft |
| next_delivery_at  | erwartete Lieferung             |
| updated_at        | letzte Aktualisierung           |

### Order / Reservation

| Feld              | Beschreibung                                |
| ----------------- | ------------------------------------------- |
| id                | Bestellung                                  |
| customer_id       | Kunde                                       |
| stand_id          | Abholstand                                  |
| pickup_slot_start | Abholfenster Start                          |
| pickup_slot_end   | Abholfenster Ende                           |
| status            | pending / confirmed / picked_up / cancelled |
| product_total     | Warenwert                                   |
| service_fee       | Reservierungsgebühr                         |
| payment_status    | pending / paid / refunded                   |
| qr_token_id       | Abhol-QR                                    |
| created_at        | Erstellung                                  |

### OrderItem

| Feld        | Beschreibung |
| ----------- | ------------ |
| order_id    | Bestellung   |
| product_id  | Produkt      |
| quantity    | Menge        |
| unit_price  | Preis        |
| total_price | Gesamtpreis  |

### Payment

| Feld                | Beschreibung                            |
| ------------------- | --------------------------------------- |
| id                  | Payment-ID                              |
| order_id            | Bestellung                              |
| provider            | Stripe / PayPal                         |
| provider_payment_id | externe Zahlungs-ID                     |
| amount_total        | Gesamtbetrag                            |
| product_amount      | Warenwert                               |
| service_fee         | Plattformfee                            |
| provider_fee        | Payment-Gebühr                          |
| payout_status       | offen / ausgezahlt                      |
| status              | pending / succeeded / failed / refunded |

### QRToken

| Feld         | Beschreibung                 |
| ------------ | ---------------------------- |
| id           | Token-ID                     |
| type         | stand / order / staff        |
| reference_id | Stand-ID oder Order-ID       |
| token_hash   | gehashter Token              |
| expires_at   | Ablauf                       |
| used_at      | Verwendung                   |
| status       | aktiv / genutzt / abgelaufen |

### Notification

| Feld                | Beschreibung |
| ------------------- | ------------ |
| id                  | Notification-ID |
| user_id             | Empfänger |
| order_id            | optionale Bestellreferenz |
| channel             | email / whatsapp / push |
| type                | order_confirmed / payment_confirmed / pickup_reminder / order_ready / order_changed / picked_up |
| template_key        | interner Template-Schlüssel |
| recipient           | E-Mail oder Telefonnummer |
| status              | pending / sent / delivered / failed / cancelled |
| provider            | Versandprovider |
| provider_message_id | externe Nachrichten-ID |
| error_message       | gekürzte Fehlermeldung |
| scheduled_at        | geplanter Versand |
| sent_at             | Versandzeitpunkt |
| delivered_at        | Zustellzeitpunkt |
| created_at          | Erstellung |

### NotificationPreference

| Feld       | Beschreibung |
| ---------- | ------------ |
| id         | Preference-ID |
| user_id    | Nutzer |
| channel    | email / whatsapp / push |
| enabled    | aktiviert ja/nein |
| created_at | Erstellung |
| updated_at | letzte Änderung |

### WhatsAppConversation

Optional für spätere Phasen:

| Feld                     | Beschreibung |
| ------------------------ | ------------ |
| id                       | Conversation-ID |
| user_id                  | optional verknüpfter Nutzer |
| phone_number             | Telefonnummer |
| provider_conversation_id | Provider-Referenz |
| last_message_at          | letzte Nachricht |
| status                   | offen / geschlossen / archiviert |

### InventoryEvent

| Feld           | Beschreibung                                                   |
| -------------- | -------------------------------------------------------------- |
| id             | Event-ID                                                       |
| stand_id       | Stand                                                          |
| product_id     | Produkt                                                        |
| type           | manual_update / reservation / pickup / cancellation / delivery |
| quantity_delta | Mengenänderung                                                 |
| actor_id       | Nutzer                                                         |
| created_at     | Zeitpunkt                                                      |

---

# 12. API-/Systemübersicht

## Public / Customer API

| Endpoint                           | Zweck                      |
| ---------------------------------- | -------------------------- |
| `GET /stands?lat=&lng=&radius=`    | Stände in Nähe             |
| `GET /stands/{id}`                 | Standdetails               |
| `GET /stands/{id}/products`        | Produkte und Verfügbarkeit |
| `POST /orders`                     | Reservierung anlegen       |
| `POST /orders/{id}/payment-intent` | Zahlung starten            |
| `GET /orders/{id}`                 | Bestellung abrufen         |
| `POST /orders/{id}/cancel`         | Storno anfragen            |
| `GET /orders/{id}/qr`              | QR-Code abrufen            |
| `GET /orders/{id}/notifications`   | Benachrichtigungen zur Bestellung |
| `PATCH /me/notification-preferences` | E-Mail-/WhatsApp-Präferenzen ändern |
| `POST /me/phone/verify/start`      | Telefonverifikation starten |
| `POST /me/phone/verify/confirm`    | Telefonverifikation bestätigen |

## Admin API

| Endpoint                                       | Zweck                   |
| ---------------------------------------------- | ----------------------- |
| `POST /admin/stands`                           | Stand anlegen           |
| `PATCH /admin/stands/{id}`                     | Stand bearbeiten        |
| `POST /admin/products`                         | Produkt anlegen         |
| `PATCH /admin/products/{id}`                   | Produkt bearbeiten      |
| `PATCH /admin/inventory/{standId}/{productId}` | Bestand ändern          |
| `GET /admin/orders`                            | Reservierungen anzeigen |
| `GET /admin/orders/{id}/notifications`         | Notification-Historie einer Order |
| `POST /admin/orders/{id}/notify`               | Statusnachricht auslösen |
| `GET /admin/notifications`                     | Notification Log |
| `GET /admin/notifications/failed`              | Fehlgeschlagene Nachrichten |
| `GET /admin/analytics/demand`                  | Nachfrageübersicht      |
| `GET /admin/delivery-suggestions`              | Lieferempfehlungen      |

## Staff API

| Endpoint                                 | Zweck                 |
| ---------------------------------------- | --------------------- |
| `GET /staff/orders?standId=`             | offene Bestellungen   |
| `POST /staff/scan`                       | QR-Code prüfen        |
| `POST /staff/orders/{id}/pickup`         | Abholung bestätigen   |
| `PATCH /staff/inventory`                 | Bestand ändern        |
| `POST /staff/products/{id}/out-of-stock` | ausverkauft markieren |

## Webhook API

| Endpoint                | Zweck                          |
| ----------------------- | ------------------------------ |
| `POST /webhooks/stripe` | Payment-Status synchronisieren |
| `POST /webhooks/paypal` | optional PayPal-Status         |
| `POST /webhooks/whatsapp` | eingehende WhatsApp-Nachrichten vorbereiten |
| `POST /webhooks/whatsapp/status` | WhatsApp Delivery Status synchronisieren |

## Interne Events

| Event | Zweck |
| ----- | ----- |
| `order.confirmed` | Bestellbestätigung |
| `payment.succeeded` | Zahlungsbestätigung |
| `pickup.reminder_due` | Abholerinnerung |
| `order.ready_for_pickup` | Bestellung abholbereit |
| `order.changed` | Lieferverzögerung oder Statusänderung |
| `order.picked_up` | Abholbestätigung |
| `order.cancelled` | Storno-/Statusinformation |

---

# 13. Prozessablauf: Reservierung, Zahlung, QR-Abholung

## 13.1 Reservierung

```text
Kunde öffnet App
    ↓
Standort wird ermittelt
    ↓
Stände in Nähe werden angezeigt
    ↓
Kunde wählt Stand
    ↓
Kunde wählt Produkt und Menge
    ↓
System prüft verfügbaren Bestand
    ↓
System blockiert Menge temporär
    ↓
Kunde wählt Abholzeitfenster
    ↓
Bestellung wird als Pending Payment erstellt
```

## 13.2 Zahlung

```text
Payment Intent / Checkout wird erstellt
    ↓
Kunde bezahlt digital
    ↓
Payment Provider bestätigt Zahlung per Webhook
    ↓
Bestellung wird auf Confirmed gesetzt
    ↓
Reservierte Menge bleibt blockiert
    ↓
QR-Code wird generiert
    ↓
Notification Service erhält Order Event
    ↓
Kunde erhält Bestätigung in App/PWA und optional per WhatsApp
```

## 13.2a WhatsApp-Bestellkommunikation

```text
Kunde reserviert Produkt
    ↓
Kunde aktiviert WhatsApp Opt-in
    ↓
Kunde bezahlt Bestellung
    ↓
Payment Webhook bestätigt Zahlung
    ↓
Order wird auf Confirmed gesetzt
    ↓
Order Event löst Notification Service aus
    ↓
WhatsApp-Bestätigung wird versendet
    ↓
Abholerinnerung wird vor dem Zeitfenster geplant
    ↓
Kunde erhält Link zur QR-Code-Seite
    ↓
Nach Abholung erhält Kunde optional Abschlussnachricht
```

Die Bestellung funktioniert vollständig ohne WhatsApp. WhatsApp darf im MVP nie der einzige Informationskanal sein.

## 13.3 Abholung per QR-Code

```text
Kunde kommt zum Stand
    ↓
Kunde zeigt QR-Code
    ↓
Mitarbeiter scannt QR-Code
    ↓
Backend prüft Token und Bestellung
    ↓
Bestellung wird angezeigt
    ↓
Mitarbeiter übergibt Ware
    ↓
Mitarbeiter bestätigt Abholung
    ↓
Order Status = Picked Up
    ↓
Bestand wird final reduziert
    ↓
Inventory Event wird gespeichert
    ↓
optional: Abholbestätigung per WhatsApp oder E-Mail
```

---

# 14. Inventory Engine

## Ziel

Die Inventory Engine stellt sicher, dass reservierte Ware nicht mehrfach verkauft wird.

## Grundlogik

```text
available_quantity = stock_quantity - reserved_quantity - safety_buffer
```

## Reservierungsregel

Eine Reservierung darf nur erstellt werden, wenn:

```text
requested_quantity <= available_quantity
```

## Temporäre Blockierung

Während des Bezahlvorgangs wird Bestand für z. B. 10 Minuten blockiert.

| Zustand         | Wirkung                                            |
| --------------- | -------------------------------------------------- |
| Pending Payment | Menge temporär blockiert                           |
| Payment Success | Menge verbindlich reserviert                       |
| Payment Failed  | Blockierung wird aufgehoben                        |
| Timeout         | Bestellung läuft ab, Bestand wird freigegeben      |
| Pickup          | Bestand wird final reduziert                       |
| Cancellation    | Bestand wird freigegeben oder Erstattung ausgelöst |

## Sicherheitsbestand

Der Produzent kann je Produkt und Stand einen Sicherheitsbestand definieren.

Beispiel:

| Produkt          | Gemeldeter Bestand | Reserviert | Sicherheitsbestand | App-verfügbar |
| ---------------- | -----------------: | ---------: | -----------------: | ------------: |
| Spargel Klasse I |              30 kg |       8 kg |               3 kg |         19 kg |

---

# 15. Lieferplanung für Produzenten

## MVP-Lieferempfehlung

Die erste Version muss keine KI sein. Eine regelbasierte Empfehlung reicht.

## Inputdaten

| Datenpunkt                | Quelle      |
| ------------------------- | ----------- |
| bestätigte Reservierungen | Orders      |
| aktueller Bestand         | Inventory   |
| Abholzeitfenster          | Order Slots |
| manuelle Lieferplanung    | Admin       |
| historische Nachfrage     | später      |
| Wetter / Events           | Phase 2     |

## Beispielregel

```text
Empfohlene Liefermenge =
bestätigte Reservierungen bis Zeitpunkt X
+ erwartete Spontannachfrage
+ Sicherheitsbestand
- aktueller Bestand
```

## Beispielausgabe

| Stand   | Empfehlung                                                          |
| ------- | ------------------------------------------------------------------- |
| Stand A | 30 kg Spargel Klasse I bis 13:00 Uhr liefern                        |
| Stand B | 15 kg Erdbeeren für Nachmittag nachliefern                          |
| Stand C | keine Nachlieferung nötig                                           |
| Stand D | Spargel Klasse II ausverkauft, nächste Lieferung 14:00 Uhr anzeigen |

---

# 16. Admin-Dashboard: Kernansichten

## Dashboard Startseite

| Kennzahl                   | Beschreibung                 |
| -------------------------- | ---------------------------- |
| Reservierungen heute       | Anzahl und Umsatz            |
| offene Abholungen          | nach Stand sortiert          |
| kritisch niedrige Bestände | Produkte unter Schwellenwert |
| ausverkaufte Produkte      | je Stand                     |
| nächste Lieferempfehlungen | priorisierte Liste           |
| digitale Umsätze           | Summe nach Zeitraum          |
| fehlgeschlagene Benachrichtigungen | WhatsApp- und E-Mail-Probleme |

## Standansicht

* Standortdaten
* Öffnungszeiten
* Produkte
* aktueller Bestand
* offene Reservierungen
* nächste Lieferung
* manuelle Bestandsänderung

## Produktansicht

* Produktname
* Preis
* Einheit
* Sichtbarkeit
* Verfügbarkeit je Stand
* Nachfrage je Zeitraum

## Bestellansicht

* Kunde
* Stand
* Produkte
* Menge
* Abholzeitfenster
* Zahlungsstatus
* QR-Status
* WhatsApp Opt-in
* Notification-Status
* Abholstatus

---

# 17. UX-Konzept

## Kunde

### Hauptnavigation

| Bereich          | Zweck                   |
| ---------------- | ----------------------- |
| Karte            | Stände finden           |
| Liste            | schnelle Übersicht      |
| Suche / Filter   | Produkt finden          |
| Meine Bestellung | QR-Code und Status      |
| Profil           | Zahlungsdaten, Historie |
| Benachrichtigungen | WhatsApp Opt-in und Opt-out |

### Kundenflow

1. App öffnen.
2. Standort freigeben.
3. „Spargel Klasse I“ auswählen.
4. Nächste verfügbare Stände sehen.
5. Stand auswählen.
6. Menge und Abholzeit wählen.
7. Bezahlen.
8. QR-Code erhalten.
9. Optional WhatsApp-Bestätigung und Abholerinnerung erhalten.
10. Abholen.

## Mitarbeiter

Möglichst einfach, große Buttons, wenig Text.

| Button                 | Zweck                       |
| ---------------------- | --------------------------- |
| QR scannen             | Abholung starten            |
| Bestellung bestätigen  | Übergabe abschließen        |
| Bestand ändern         | Menge aktualisieren         |
| Ausverkauft            | Produkt sofort deaktivieren |
| Lieferung eingetroffen | Bestand erhöhen             |

## Admin

Dashboard soll auf Desktop funktionieren, aber auch auf Tablet nutzbar sein.

---

# 18. Entwicklungsfahrplan

## Gesamtzeit MVP: 10–14 Wochen

Realistische Planung für ein kleines Team:

| Rolle                   | Umfang                  |
| ----------------------- | ----------------------- |
| Product Owner / Gründer | Teilzeit bis Vollzeit   |
| UX/UI Designer          | 2–4 Wochen              |
| Fullstack Developer     | Vollzeit                |
| Mobile/PWA Developer    | Vollzeit oder Fullstack |
| Backend Developer       | Vollzeit                |
| QA / Tester             | Teilzeit                |
| Pilot-Produzent         | Feedbackgeber           |

---

## Phase 0: Discovery & Validierung – Woche 1–2

| Aufgabe                                       | Ergebnis                         |
| --------------------------------------------- | -------------------------------- |
| Produzenteninterviews                         | reale Anforderungen              |
| Kundeninterviews                              | Zahlungsbereitschaft Service Fee |
| Standprozesse beobachten                      | operativer Ablauf                |
| Produktkategorien definieren                  | MVP-Sortiment                    |
| Zahlungsmodell validieren                     | Preismodell                      |
| Datenschutz- und Payment-Anforderungen prüfen | Risikoklarheit                   |
| WhatsApp Opt-in und Providerrahmen prüfen     | Datenschutz, Kosten, Templates   |
| MVP-Scope finalisieren                        | priorisierter Backlog            |

**Deliverables:**

* validierte Problemhypothesen
* MVP-Backlog
* Rollen- und Prozessmodell
* UX-Wireframes
* Gebührenmodell für Pilot

---

## Phase 1: UX & technisches Fundament – Woche 3–4

| Aufgabe                  | Ergebnis                   |
| ------------------------ | -------------------------- |
| Klickdummy Kunde         | Reservierungsflow testbar  |
| Klickdummy Admin         | Bestandsverwaltung testbar |
| Datenmodell finalisieren | DB-Schema                  |
| API-Konzept              | Endpoint-Struktur          |
| Auth & Rollen            | Basisberechtigungen        |
| Projektsetup             | Repo, CI/CD, Hosting       |
| Payment-Konzept          | Providerentscheidung       |
| Notification-Konzept     | E-Mail/WhatsApp Events, Templates und Datenmodell |

**Deliverables:**

* klickbarer Prototyp
* technisches Setup
* DB-Migrationen
* erste API-Struktur

---

## Phase 2: MVP-Entwicklung Core – Woche 5–9

| Modul                | Inhalt                            |
| -------------------- | --------------------------------- |
| Kunden-App           | Karte, Liste, Standdetails        |
| Produktverfügbarkeit | Bestand, Statuslogik              |
| Reservierung         | Warenkorb, Menge, Zeitfenster     |
| Payment              | Checkout, Webhooks                |
| QR-Code              | Generierung, Anzeige              |
| Notification Service | E-Mail-Basis und WhatsApp-P1-Vorbereitung |
| Admin                | Stände, Produkte, Bestand         |
| Mitarbeiteransicht   | offene Orders, QR-Scan            |
| Inventory Engine     | Blockieren, Freigeben, Reduzieren |
| E-Mail               | Bestellbestätigung                |

**Deliverables:**

* funktionierende End-to-End-Reservierung
* digitale Zahlung
* QR-Code-Abholung
* Admin- und Mitarbeiterworkflow

---

## Phase 3: Pilotvorbereitung – Woche 10–11

| Aufgabe                      | Ergebnis               |
| ---------------------------- | ---------------------- |
| Testdaten mit realen Ständen | realistischer Pilot    |
| Mitarbeiter-Onboarding       | Bedienung am Stand     |
| QR-Codes für Stände drucken  | physische Aktivierung  |
| Payment-Test                 | End-to-End-Zahlung     |
| Last-Minute UX-Fixes         | bessere Bedienbarkeit  |
| Storno-/Fehlerfälle testen   | weniger Betriebsrisiko |
| Monitoring einrichten        | Fehler sichtbar        |
| WhatsApp-Pilotsetup          | Provider, Templates, Opt-in-Texte und Testnummern |

**Deliverables:**

* Pilot-ready MVP
* QR-Code-Aufsteller
* Admin-Schulung
* Supportprozess

---

## Phase 4: Pilotbetrieb – Woche 12–14

| Aufgabe                     | Ergebnis              |
| --------------------------- | --------------------- |
| Livebetrieb mit 1 Produzent | echte Transaktionen   |
| 3–10 Stände testen          | Standortvergleich     |
| tägliches Feedback sammeln  | schnelle Optimierung  |
| Reservierungsquote messen   | Produkt-Market-Signal |
| Fehlbestände tracken        | operativer Nutzen     |
| Lieferempfehlungen prüfen   | Produzentennutzen     |
| WhatsApp Order Updates auswerten | Opt-in-Rate, Zustellfehler, No-show-Effekt |

**Deliverables:**

* Pilotbericht
* Metriken
* priorisierte Verbesserungen
* Entscheidung Phase 2 / Skalierung

---

# 19. Meilensteine

| Meilenstein                  |    Zieltermin | Erfolgskriterium                |
| ---------------------------- | ------------: | ------------------------------- |
| M1: Scope final              |  Ende Woche 2 | Backlog priorisiert             |
| M2: Prototyp validiert       |  Ende Woche 4 | Kundenflow verstanden           |
| M3: Core Reservierung fertig |  Ende Woche 7 | Bestellung ohne Payment möglich |
| M4: Payment + QR fertig      |  Ende Woche 9 | bezahlte Bestellung abholbar    |
| M5: Pilot-ready              | Ende Woche 11 | echte Stände eingerichtet       |
| M6: Pilot abgeschlossen      | Ende Woche 14 | Live-Daten ausgewertet          |

---

# 20. Erfolgskennzahlen

## Kundenseitig

| KPI                                  |                  Ziel MVP |
| ------------------------------------ | ------------------------: |
| erfolgreiche Reservierungen          |            > 100 im Pilot |
| Pickup-Erfolgsquote                  |                    > 95 % |
| Abbruchrate Checkout                 |                    < 40 % |
| Wiederkaufrate                       |                    > 20 % |
| Beschwerden wegen Nichtverfügbarkeit | nahe 0 bei Reservierungen |
| Zahlungsbereitschaft Service Fee     |                 validiert |

## Produzentenseitig

| KPI                                 |                 Ziel MVP |
| ----------------------------------- | -----------------------: |
| manuelle Bestandsupdates pro Tag    | realistisch durchführbar |
| ausverkaufte Produkte mit Nachfrage |                  messbar |
| Überbestand am Tagesende            |              reduzierbar |
| Umsatz je Stand                     |               auswertbar |
| digitale Zahlungsquote              |                 steigend |
| Akzeptanz Mitarbeiter               |                  positiv |

## Plattformseitig

| KPI                                        |        Ziel MVP |
| ------------------------------------------ | --------------: |
| Service-Fee-Umsatz                         | erster Nachweis |
| technische Erfolgsquote Payment            |          > 98 % |
| QR-Scan-Erfolgsquote                       |          > 95 % |
| Supportfälle je 100 Orders                 |         niedrig |
| Systemverfügbarkeit während Öffnungszeiten |          > 99 % |

---

# 21. Risiken und Gegenmaßnahmen

| Risiko                               | Auswirkung                | Gegenmaßnahme                                                 |
| ------------------------------------ | ------------------------- | ------------------------------------------------------------- |
| Bestand wird nicht gepflegt          | falsche Verfügbarkeit     | einfache Mitarbeiteransicht, Erinnerungen, Sicherheitsbestand |
| Kunden holen Ware nicht ab           | blockierter Bestand       | Vorkasse, Stornoregel, No-show-Regeln                         |
| Mitarbeiter nutzen System nicht      | Prozessbruch              | QR-Flow extrem einfach halten                                 |
| Internet am Stand schlecht           | QR-Scan problematisch     | manuelle Codeeingabe, Offline-Fallback später                 |
| Payment-Komplexität                  | Verzögerung               | Stripe-first, PayPal optional                                 |
| Produzent will keine Gebühren        | Geschäftsmodell scheitert | Pilot kostenlos, Nutzen über Daten beweisen                   |
| Kunden akzeptieren Service Fee nicht | geringe Conversion        | Fee klein halten und klar als Garantie erklären               |
| Saisonabhängigkeit                   | kurze Testphase           | Pilot früh vor Saison planen                                  |
| Recht / Steuern / Auszahlung         | Compliance-Risiko         | Steuerberater/Payment-Provider früh prüfen                    |
| Datenschutz                          | Vertrauensproblem         | Datensparsamkeit, klare Einwilligung, DSGVO-konform           |
| WhatsApp Opt-in unsauber eingeholt   | Datenschutz- und Vertrauensrisiko | freiwilliges Opt-in, Zeitstempel, klare Abmeldung             |
| Telefonnummern werden zu breit sichtbar | Datenschutzrisiko      | Maskierung, RBAC, Zweckbindung                                |
| WhatsApp-Nachrichten stören Kunden   | Akzeptanz sinkt           | Frequenz begrenzen, Opt-out jederzeit                         |
| WhatsApp Provider-Kosten steigen     | Service-Fee-Marge sinkt   | maximal 2-3 Nachrichten pro Bestellung im MVP                 |
| Templates werden nicht genehmigt      | Versand verzögert         | Templates früh definieren, E-Mail/App als Fallback            |
| Zustellung ist nicht garantiert       | Kunde verpasst Update     | WhatsApp nie als einzigen Informationskanal nutzen            |

---

# 22. Storno- und No-show-Regel MVP

## Empfehlung

| Situation                         | Regel                                                   |
| --------------------------------- | ------------------------------------------------------- |
| Kunde storniert frühzeitig        | Ware wird freigegeben, Service Fee ggf. nicht erstattet |
| Kunde storniert kurz vor Abholung | keine oder teilweise Erstattung                         |
| Kunde erscheint nicht             | Bestellung verfällt nach Kulanzzeit                     |
| Stand kann nicht liefern          | volle Erstattung inkl. Service Fee                      |
| Produktqualität / Reklamation     | manuelle Erstattung durch Admin                         |

**Wichtig:**
Die Garantie gilt nur, wenn der Kunde innerhalb des gewählten Abholfensters erscheint.

---

# 23. Phase-2-Erweiterungen

## Produkt und Kundenfunktionen

| Erweiterung                                   | Nutzen                                   |
| --------------------------------------------- | ---------------------------------------- |
| Push-Benachrichtigung bei Wiederverfügbarkeit | Nachfrage aktivieren                     |
| „Nächste Lieferung um 14:00“                  | bessere Erwartung                        |
| Favoritenstände                               | Wiederkauf                               |
| Wiederbestellen                               | schneller Kauf                           |
| WhatsApp Statusabfrage                        | Bestellung per Nachricht nachverfolgen   |
| Storno-Link per WhatsApp                      | sicherer Link zurück in App/PWA          |
| Produktbewertungen                            | Vertrauen                                |
| saisonale Produktwelten                       | Erdbeeren, Kürbis, Eier, Weihnachtsbäume |

## Produzentenfunktionen

| Erweiterung                                 | Nutzen                    |
| ------------------------------------------- | ------------------------- |
| Analytics nach Standort / Produkt / Uhrzeit | bessere Planung           |
| Nachfrageprognose                           | weniger Fehlplanung       |
| POS-/Kassenintegration                      | Echtzeitbestand           |
| Export Buchhaltung                          | weniger manueller Aufwand |
| DATEV / CSV-Export                          | Steuerprozesse            |
| Mitarbeiter-App                             | schneller am Stand        |
| Offline-Modus                               | robuste Nutzung           |

## Technische Erweiterungen

| Erweiterung                 | Nutzen                      |
| --------------------------- | --------------------------- |
| POS-Integration             | automatisches Inventory     |
| Barcode-/QR-Scan je Produkt | schnellere Bestandsänderung |
| Push-Infrastruktur          | Echtzeitkommunikation       |
| WhatsApp Bot                | Produktsuche und Statusdialog |
| Conversational Ordering     | vollständige Bestellung per WhatsApp |
| Payment Link aus WhatsApp   | Zahlung aus Chat heraus starten |
| CRM-/Support-Integration    | WhatsApp-Supportfälle zentral bearbeiten |
| Data Warehouse              | Reporting                   |
| Multi-Tenant Architektur    | mehrere Produzenten         |
| API für Partner             | Skalierung                  |

## WhatsApp-Roadmap

| Phase | Umfang |
| ----- | ------ |
| MVP / Pilot P1 | WhatsApp Opt-in, Bestellbestätigung, Abholerinnerung, sicherer QR-Link, Notification Logs |
| Phase 1.5 | Statusabfrage per WhatsApp, Storno-Link, Wiederbestellen-Link, aktive Kommunikation bei Lieferverzögerung |
| Phase 2 | WhatsApp Bot für Produktsuche, Conversational Ordering, Zahlung per Payment Link, Wiederverfügbarkeitsbenachrichtigung, KI-gestützte Antwortlogik, CRM-/Support-Integration |

---

# 24. MVP-Backlog nach Epics

## Epic 1: Kunden-Discovery

* Karte anzeigen
* Liste anzeigen
* Entfernung berechnen
* Filter nach Produkt
* Filter nach geöffneten Ständen
* Standdetailseite

## Epic 2: Inventory Visibility

* Produktliste je Stand
* Statuslogik
* manuelle Bestandspflege
* Sicherheitsbestand
* nächste Lieferung anzeigen

## Epic 3: Reservation Core

* Produkt auswählen
* Menge wählen
* Zeitfenster wählen
* Bestand prüfen
* Menge blockieren
* Bestellung erzeugen
* Statusmaschine

## Epic 4: Payment

* Checkout starten
* Payment Provider anbinden
* Webhook verarbeiten
* Zahlung bestätigen
* Erstattung vorbereiten
* Gebühren berechnen

## Epic 5: QR Pickup

* Bestell-QR generieren
* Stand-QR generieren
* QR scannen
* Bestellung validieren
* Abholung bestätigen
* Bestand reduzieren

## Epic 6: Admin Dashboard

* Login Admin
* Standverwaltung
* Produktverwaltung
* Bestandspflege
* Bestellungen anzeigen
* einfache Nachfrageübersicht
* Lieferempfehlungen

## Epic 7: Staff Interface

* Login Mitarbeiter
* offene Bestellungen
* QR-Scan
* Bestand aktualisieren
* ausverkauft markieren

## Epic 8: Betrieb & Qualität

* Monitoring
* Logging
* Rollenrechte
* DSGVO-Basics
* Testfälle
* Deployment
* Backup

## Epic 9: WhatsApp Notifications

* WhatsApp Opt-in im Checkout ergänzen
* Telefonnummer validieren und speichern
* Notification-Service vorbereiten
* WhatsApp Provider konfigurieren
* Message Templates definieren
* Bestellbestätigung per WhatsApp versenden
* Abholerinnerung per WhatsApp versenden
* QR-Code-Link per WhatsApp versenden
* Notification-Logs speichern
* Fehlerstatus für nicht zugestellte Nachrichten erfassen
* WhatsApp-Abmeldung bzw. Deaktivierung ermöglichen
* Eingehende WhatsApp-Nachrichten, Statusabfrage, Storno-Link und Wiederbestellung als P2 vorbereiten
* Conversational Commerce / vollständige Bestellung per WhatsApp als P3 einordnen

---

# 25. Akzeptanzkriterien MVP

Das MVP ist abnahmefähig, wenn:

1. Ein Kunde einen Stand in seiner Nähe finden kann.
2. Ein Kunde Produkte und Verfügbarkeit je Stand sehen kann.
3. Ein Kunde ein Produkt mit Menge und Abholfenster reservieren kann.
4. Der Bestand während der Zahlung blockiert wird.
5. Eine digitale Zahlung abgeschlossen werden kann.
6. Nach Zahlung ein QR-Code erzeugt wird.
7. Ein Mitarbeiter den QR-Code prüfen kann.
8. Eine Abholung bestätigt werden kann.
9. Der Bestand nach Abholung korrekt aktualisiert wird.
10. Der Admin Bestellungen, Bestände und Nachfrage je Stand sehen kann.
11. Eine einfache Lieferempfehlung angezeigt wird.
12. Stände, Produkte und Preise administrierbar sind.
13. Rollenrechte verhindern unberechtigte Zugriffe.
14. Payment-Webhooks werden zuverlässig verarbeitet.
15. Fehlerfälle wie Zahlungsabbruch und abgelaufene Reservierung werden behandelt.
16. Kunde kann WhatsApp-Benachrichtigungen aktivieren oder deaktivieren.
17. Telefonnummer wird validiert oder mindestens plausibilisiert.
18. Nach erfolgreicher Zahlung wird bei aktivem Opt-in eine WhatsApp-Bestätigung versendet.
19. Vor dem Abholfenster wird bei aktivem Opt-in eine Abholerinnerung versendet.
20. WhatsApp-Nachricht enthält einen sicheren Link zur Bestellung oder QR-Code-Seite.
21. Versandstatus wird gespeichert.
22. Fehlgeschlagene WhatsApp-Nachrichten sind für Admins sichtbar.
23. Bestellung funktioniert vollständig auch ohne WhatsApp.
24. Kunde kann WhatsApp-Benachrichtigungen jederzeit deaktivieren.

---

# 26. Empfehlung für den ersten Pilot

## Pilotsetup

| Faktor           | Empfehlung                                          |
| ---------------- | --------------------------------------------------- |
| Produzenten      | 1 Spargelbauer                                      |
| Stände           | 3–5 Verkaufsstände                                  |
| Produkte         | 3–5 Produkte                                        |
| Zeitraum         | 2–4 Wochen                                          |
| Kundenkanal      | QR-Code am Stand, Social Media, Website, optional WhatsApp bei Opt-in |
| Payment          | Stripe zuerst                                       |
| Mitarbeitergerät | Smartphone mit Browser                              |
| Bestandsupdate   | manuell, 2–4x täglich                               |
| Service Fee      | 0,49 €–0,99 €                                       |
| Hauptmessung     | Reservierungen, Pickup-Erfolg, Fehlfahrtenreduktion |

## MVP-Kommunikation an Kunden

**Kernbotschaft:**

> Reserviere deinen Spargel vorab und hole ihn garantiert am gewünschten Stand ab. Kein Umweg. Kein Ausverkauft. Kein Bargeld nötig.

## MVP-Kommunikation an Produzenten

**Kernbotschaft:**

> Sie sehen frühzeitig, welche Produkte an welchem Stand nachgefragt werden, reduzieren Fehlmengen und verteilen Ihre Ware datenbasiert statt nach Bauchgefühl.

---

# 27. Zusammenfassung für Entwickler

Die Spargelstand-App ist ein standortbasierter Preorder- und Pickup-Marktplatz für landwirtschaftliche Verkaufsstände. Kunden sehen Stände in ihrer Nähe, prüfen Produktverfügbarkeiten, reservieren Ware verbindlich, zahlen digital und holen ihre Bestellung per QR-Code ab. Das Backend verwaltet Standorte, Produkte, Bestände, Reservierungen, Zahlungen, QR-Codes und transaktionale Benachrichtigungen. Eine Inventory Engine verhindert Überbuchungen, indem reservierte Mengen blockiert werden. Ein Notification Service versendet E-Mail und optional WhatsApp Order Updates, speichert Versandstatus und bleibt vom App/PWA-Kernflow getrennt. Ein Admin-Dashboard zeigt dem Produzenten Bestände, offene Reservierungen, Nachfrage, einfache Lieferempfehlungen und Benachrichtigungsfehler je Standort. Das MVP startet mit manueller Bestandspflege, digitaler Zahlung, QR-Abholung und WhatsApp als P1-Bestellbegleiter; POS-Integration, Analytics, Push, Prognosen und vollständige WhatsApp-Bestellung folgen in späteren Phasen.

---

# 28. Klare MVP-Entscheidung

Für den ersten Release sollte der Fokus kompromisslos auf diesem Kern liegen:

**Kunde findet Stand → Kunde sieht Verfügbarkeit → Kunde reserviert → Kunde bezahlt → Kunde erhält optional WhatsApp-Updates → Kunde holt per QR-Code ab → Produzent sieht Nachfrage und plant Lieferung besser.**

Alles, was diesen Ablauf nicht direkt verbessert, gehört in Phase 2. Eine vollständige Bestellung direkt über WhatsApp gehört ausdrücklich nicht in das MVP.

[1]: https://developers.google.com/maps/documentation/android-sdk/overview?utm_source=chatgpt.com "Maps SDK for Android overview"
[2]: https://docs.stripe.com/elements/express-checkout-element?utm_source=chatgpt.com "Express Checkout Element"
[3]: https://docs.stripe.com/connect/charges?utm_source=chatgpt.com "Understand how charges work in a Connect integration"
[4]: https://developer.paypal.com/docs/api/orders/v2/?utm_source=chatgpt.com "Orders"
