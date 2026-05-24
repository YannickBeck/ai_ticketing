# ADR-002: WhatsApp als P1-Benachrichtigungskanal

## Status
Accepted

## Context

WhatsApp soll Kunden Bestellstatus und QR-Link bequem zugänglich machen. Die vorhandenen Pläne grenzen WhatsApp aber klar vom verbindlichen Bestell-, Zahlungs- und Pickup-Flow ab.

## Decision

WhatsApp wird im MVP-Grundgerüst als optionaler P1-/Pilotkanal im Notification Service vorbereitet. WhatsApp ist kein Bestellkanal, kein Chatbot und keine Voraussetzung für Bestellung, Zahlung oder Abholung.

## Rationale

1. Der USP liegt in garantierter Verfügbarkeit, nicht in Conversational Commerce.
2. Provider, Templates, Opt-in und Datenschutz sind noch offene Pilotentscheidungen.
3. Der Kernflow muss auch bei WhatsApp-Ausfall vollständig funktionieren.

## Trade-offs

- WhatsApp-Komfort ist zunächst nur Skeleton/Adapter.
- Kein Kundensupport oder Statusdialog per WhatsApp im MVP.

## Consequences

- **Positive:** klare Scope-Kontrolle und geringeres Compliance-Risiko.
- **Negative:** weniger Komfort als ein vollständiger Chatflow.
- **Mitigation:** Notification Logs, Webhook-Skeleton und Provider-Adapter erlauben spätere Erweiterung.
