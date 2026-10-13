<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# 🤖 LIVE TESTCASE ENGINEERING GOVERNANCE (COCONUT LAB FULLSTACK ENGINEER TRACK)

You are an AI Pair Programmer working inside the live interview execution environment for **Indra SB**.
All code written here MUST reflect the standards of a **Fullstack Engineer**: modular, type-safe, resilient, and delivered with zero hesitation within a strict **30-minute timebox**.

---

## 🏛️ 5 ARCHITECTURAL INVARIANTS (MUTLAK)

### 1. 🛡️ AUTH INVARIANT: SINGLE SIMULATED USER (PRE-SEEDED)
- **NEVER** install heavy authentication libraries (NextAuth, Lucia, JWT, bcrypt, session cookies) during live testcases unless explicitly demanded by the interviewer.
- **ALWAYS** use the pre-seeded simulated user session (`id: 'user-simulated'`, Indra SB) in `src/lib/mock-session.ts` displayed via a clean static status badge in the header.
- The challenge specifies a single simulated user with multi-currency wallets; keep authentication zero-friction.

### 2. 🗄️ PERSISTENCE INVARIANT: PRISMA + SQLITE ONLY
- All transactional data MUST persist in local SQLite (`prisma/dev.db`).
- Schema updates: edit `prisma/schema.prisma` and execute:
  ```bash
  npx prisma db push
  ```
  *(Zero migration overhead, instant sync in < 1 second).*
- **NEVER** attempt to start Docker, PostgreSQL, or remote cloud databases.

### 3. 🧩 DOMAIN-DRIVEN DESIGN (DDD) BOUNDED CONTEXTS
Keep the code strictly separated across architectural tiers:
- **`src/core/domain/`**: Pure TypeScript entities, enums, value objects, and repository interfaces. Framework-agnostic.
- **`src/core/use-cases/`**: Pure business logic and invariants (e.g., preventing overdraft/negative balances, non-zero positive amounts, ISO 4217 decimal precision). Never import Next.js request/response objects here!
- **`src/infrastructure/repositories/`**: Prisma repository implementations satisfying domain interfaces.
- **`src/app/api/`**: Thin REST Route Handlers that parse HTTP inputs, invoke use-cases, and return responses.
- **`src/components/`**: Reusable Tailwind UI components.

### 4. 📦 STANDARD RESPONSE ENVELOPE
Every API endpoint MUST return standardized JSON responses using helpers from `@/lib/api-response`:
- **Success:** `apiSuccess(data, meta?, statusCode?)` ➔ `{ success: true, data: ..., error: null, meta: { timestamp, ... } }`
- **Error:** `apiError(message, code?, statusCode?, meta?)` ➔ `{ success: false, data: null, error: { code, message }, meta: { timestamp } }`

### 5. 🧪 AUTOMATED TESTING & RAPID VERIFICATION
- Business invariants in `src/core/use-cases/` MUST be verifiable via Vitest:
  ```bash
  npm test
  ```
- Use the in-memory mock repository pattern for unit tests to keep test runs under 200 milliseconds.

---

## 🚀 TESTCASE PROMPT EXECUTION RECIPE (30-MINUTE BLITZ)

When Indra SB gives a feature request from the interviewer:
1. **Analyze Requirements & Invariant**: Identify the primary entity, state machine, or transactional constraint.
2. **Update Schema**: Adjust `prisma/schema.prisma` if new fields are needed, then run `npx prisma db push`.
3. **Write Domain Use-Case**: Encapsulate the core rule in `src/core/use-cases/[feature].use-case.ts`.
4. **Wire Route Handler**: Expose via `src/app/api/[resource]/route.ts`.
5. **Connect UI**: Bind to `src/app/page.tsx` using modular components (`WalletCardGrid`, `WalletActionWorkbench`, `LedgerAuditTable`, `TransactionDetailModal`).
6. **Verify**: Run `npm test` to prove green test status.
