# Payment And Webhooks

## Payment

| Methode | Endpoint | Zweck | Status |
| --- | --- | --- | --- |
| POST | `/api/v1/orders/{orderId}/payment-intent` | Stripe PaymentIntent mit Connect Fee/Destination starten | MVP-Skeleton integriert |
| POST | `/api/v1/webhooks/stripe` | Stripe Raw-Body-Signatur pruefen, Event persistieren und Status anwenden | MVP-Skeleton integriert |

## Regeln

1. Webhooks prüfen Provider-Signaturen vor fachlicher Verarbeitung.
2. Provider Event IDs werden in `PaymentEvent` eindeutig gespeichert und idempotent verarbeitet.
3. PaymentIntent-Start ist customer-only und bereitet eine `Payment`-Zeile vor dem Provider-Call vor.
4. Stripe PaymentIntent-Calls nutzen einen deterministischen Idempotency-Key je Order.
5. Payment Success setzt Payment auf `succeeded`, Order auf `confirmed`, erzeugt einen aktiven QRToken und legt eine Notification an.
6. Payment Failure oder Cancel gibt reservierte Mengen frei und storniert nur noch `pending_payment` Orders.
7. Refunds markieren bereits erfolgreiche Zahlungen als `refunded`.
8. Alte oder widersprüchliche Provider-Events werden als Event protokolliert, aber nicht auf den kanonischen Order-/Payment-Status angewendet.

## Stripe Connect PaymentIntent

Der PaymentIntent wird mit `automatic_payment_methods`, `application_fee_amount` und `transfer_data.destination` erzeugt. Damit bleibt die Service Fee auf Plattformseite sichtbar und der Warenwert fliesst an das Connected Account des Produzenten.

Erforderliche ENV-Werte:

```text
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CONNECTED_ACCOUNT_ID=acct_...
```

Ohne diese Werte liefert die API bewusst `requires_configuration`, statt eine Scheinintegration vorzutäuschen.

## Persistenz und Idempotenz

`PaymentRepository` persistiert Payment-Status, Provider-Referenzen und jedes Stripe-Event in `PaymentEvent`. Wenn ein Webhook vor der lokalen Payment-Zuordnung eintrifft, bleibt das Event `handled=false` und kann bei erneuter Provider-Zustellung nachverarbeitet werden. Bereits erfolgreich verarbeitete Event IDs werden als Duplikat beantwortet.

Statusübergänge sind defensiv:

| Event | Erlaubter fachlicher Übergang |
| --- | --- |
| `payment_intent.succeeded` | `pending_payment` -> `confirmed`, `pending` -> `succeeded` |
| `payment_intent.payment_failed` / `payment_intent.canceled` | nur `pending_payment` / `pending`, danach Inventory Release und `cancelled` |
| `charge.refunded` | nur von `succeeded` zu `refunded` |

Conflicting Events bleiben auditierbar, verändern aber nicht nachträglich eine bereits terminale Order.

## Webhook Events

Aktuell gemappte Events:

| Stripe Event | Interner Status |
| --- | --- |
| `payment_intent.succeeded` | `succeeded` |
| `payment_intent.payment_failed` | `failed` |
| `payment_intent.canceled` | `failed` |
| `charge.refunded` | `refunded` |

## Noch offen für produktionsnahe Stripe-Integration

1. Stripe CLI/E2E gegen echte Test-Events anbinden.
2. Mehrere Payment Attempts sauber modellieren, falls ein Intent nach Ablauf neu erzeugt werden muss.
3. Refund-API mit Rollenprüfung und Service-Fee-Regeln ergänzen.
4. Connect Onboarding für Produzenten und Account-Status-Sync integrieren.
