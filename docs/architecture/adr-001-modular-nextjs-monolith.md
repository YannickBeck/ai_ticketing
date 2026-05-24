# ADR-001: Modularer Next.js-Monolith

## Status
Accepted

## Context

Das MVP braucht Customer PWA, Admin-Dashboard, Staff-Ansicht und API mit begrenztem Team- und Zeitbudget. Die Pläne priorisieren Geschwindigkeit, klare Domainlogik und Pilotfähigkeit.

## Decision

Wir nutzen Next.js mit TypeScript als modularen Monolithen. Route Handler liegen unter `/api/v1`; fachliche Services liegen unter `src/server/services`; PostgreSQL/Prisma bleibt System of Record.

## Rationale

1. Eine Codebase reicht für Kunde, Admin und Staff.
2. Next.js Route Handler sind für den MVP schneller als ein separates NestJS-Backend.
3. Servicegrenzen halten spätere Extraktion möglich.
4. Prisma/PostgreSQL passt zu relationalen Order-, Payment-, QR- und Inventory-Daten.

## Trade-offs

- Weniger klare Prozessisolation als Microservices.
- Hintergrundjobs müssen bewusst angebunden werden.
- API und Frontend teilen Deployment-Zyklus.

## Consequences

- **Positive:** schneller Start, wenig Infrastruktur, gemeinsame Typen und DTOs.
- **Negative:** Monolith muss diszipliniert modular bleiben.
- **Mitigation:** API-Routen bleiben dünn; Domainlogik liegt in Services; Provider werden über Adapter angebunden.
