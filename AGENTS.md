# AGENTS.md — Live Testcase Workspace

You are pair-programming with the candidate on the live technical coding challenge.
All code must adhere to clean architecture, high maintainability, and rapid verifiable execution within the timebox.

## Repository Boundaries

- **Runtime Boundary:** All application source code, API routes, database schemas, and unit tests MUST reside in `app-core/`.
- **Documentation Boundary:** System architecture, requirements, and domain contracts live in `docs/` and are mapped via `CONTEXT-MAP.md`.
- **Interactive Portal:** `docs-viewer/` renders documentation on port 7001 (`npm run docs:dev`).

## 5 Core Architectural Invariants

1. **Authentication:** Pre-seeded single simulated user session (`id: 'user-simulated'`, Indra SB) with static session badge (`src/lib/mock-session.ts`). Zero auth package bloat.
2. **Persistence:** Use local SQLite (`prisma/dev.db`). Execute schema updates via `npx prisma db push`.
3. **Domain-Driven Design (DDD):** Pure business logic lives in `src/core/use-cases/`. API routes in `src/app/api/` act only as HTTP adapters.
4. **API Contracts:** Return standard response envelopes using `apiSuccess()` and `apiError()` from `@/lib/api-response`.
5. **Testing Discipline:** Verify domain logic and frontend components using Vitest (`npm test`). Keep the entire test suite execution under 1s.

## Git Safety

Do not execute git write actions (`git add`, `git commit`, `git push`) unless explicitly asked.
