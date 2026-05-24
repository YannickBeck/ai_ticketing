# Agent Instructions

## Package Manager
Use **npm**: `npm install`, `npm run dev`, `npm run typecheck`, `npm run test`.

## Project Shape
- Next.js App Router under `src/app`.
- API Route Handlers under `src/app/api/v1`.
- Domain logic under `src/server/services`.
- Prisma schema under `prisma/schema.prisma`.
- Product and architecture docs under `docs/`.

## Source Of Truth
- Read `Projektplan.md`, `README.md`, and `docs/**/*.md` before changing scope.
- P0 is the reservation guarantee: stand discovery, inventory, order, payment, QR pickup, admin, staff.
- WhatsApp is P1/Pilot only: notifications, opt-in, QR link, webhooks. Do not turn it into a WhatsApp ordering channel.

## File-Scoped Commands
| Task | Command |
|------|---------|
| Typecheck | `npm run typecheck` |
| Lint | `npm run lint -- <path>` |
| Test | `npm run test -- <path>` |
| Prisma validate | `npm run prisma:validate` |

## API Pattern
```ts
export async function GET() {
  return jsonOk({ status: "skeleton" });
}
```

## Conventions
- Keep API routes thin; validate, check RBAC, call a service, return a standard response.
- Store money as integer cents and quantities as decimals.
- Enforce RBAC server-side; UI state is not a security boundary.
- Never log raw QR tokens, payment payloads, or full phone numbers.
- Write Notification records before provider calls; WhatsApp must not block the core order flow.

## Commit Attribution
AI commits MUST include:
```text
Co-Authored-By: (the agent model's name and attribution byline)
```
