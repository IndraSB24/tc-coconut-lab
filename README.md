# 🥥 Coconut Lab — Live Testcase Submission

> **Candidate:** Muhamad Indra Setiabudi (Indra SB)  
> **Position:** Fullstack Engineer  
> **Core Stack:** Next.js (App Router), TypeScript, Prisma ORM, SQLite, Vitest, Tailwind CSS  
> **Architecture Pattern:** Domain-Driven Design (DDD) & Living SSOT Monorepo  

---

## ⚡ Zero-Friction Setup & Quick Start

### 📋 Prerequisites
- **Node.js:** `>= 18.0.0` (Tested on Node `v20.x` & `v24.x`)
- **npm:** `>= 9.0.0`
- Zero external infrastructure required (no Docker, PostgreSQL, or cloud services needed — powered by atomic SQLite).

---

### 🛠️ 1-Command Automated Setup
From the repository root, run:
```bash
npm run setup
```
This single command automatically:
1. Installs dependencies across all monorepo workspaces (`app-core` and `docs-viewer`).
2. Initializes the local SQLite database schema via Prisma (`prisma db push`).
3. Seeds the simulated user and 5 initial multi-currency wallets (`USD`, `EUR`, `GBP`, `SGD`, `IDR`).

---

## 🚀 Running the Dual-Service Monorepo

This repository operates as an **Enterprise Monorepo** delivering both the **Runtime Application** and an **Interactive Architecture Documentation Portal** running concurrently without port conflicts:

```
┌────────────────────────────────────────────────────────┐
│  🌐 PORT 3000: RUNTIME APPLICATION (Next.js)           │
│     Command: npm run dev                               │
│     URL:     http://localhost:3000                     │
├────────────────────────────────────────────────────────┤
│  📚 PORT 7001: ARCHITECTURE PORTAL (Docusaurus)        │
│     Command: npm run docs:dev                          │
│     URL:     http://localhost:7001                     │
└────────────────────────────────────────────────────────┘
```

### 1. Launch the Runtime Application (`http://localhost:3000`)
```bash
npm run dev
```
- Open `http://localhost:3000` to interact with the Multi-Currency Digital Wallet Workbench.
- **Key Features:**
  - **Multi-Currency Balances & Pockets:** Real-time balances across pre-seeded wallets (`USD`, `EUR`, `GBP`, `SGD`, `IDR`) plus dynamic sub-wallet / pocket creation (e.g. `USD Savings`, `EUR Traveling`).
  - **Live FX Ticker:** Real-time exchange rates powered by the Frankfurter API with offline fallback.
  - **Interactive Action Workbench:** Tabbed forms for **Deposit**, **Withdraw**, **Convert**, and strict 1:1 same-currency **Transfer**.
  - **Instant Conversion Preview:** Dynamic rate calculation before submitting financial conversions.
  - **Audit Ledger & Inspector:** Transaction history with currency/type filters, pagination, and a detail modal inspector.

### 2. Launch the Living Documentation Portal (`http://localhost:7001`)
```bash
# Default: launches on http://localhost:7001
npm run docs:dev

# Or pass any custom port dynamically:
npm run docs:dev 7002
npm run docs:dev 8080
```
- Open `http://localhost:7001` in your browser.
- Explores complete system blueprints, DDD bounded contexts, domain invariants, API contracts, testing matrix, and progressive delivery roadmaps.

### 3. Run Automated Tests
```bash
npm test
```
- Executes the unified Vitest suite (**81 passed in ~1s**, 100% green):
  - **Backend Domain Rules (44 tests in < 300ms):** Entity encapsulation, financial decimal precision (IDR 0 decimals vs standard fiat 2 decimals), overdraft protection, double-entry ledger correlation, dynamic sub-wallet creation, same-currency transfer invariants, and Frankfurter API caching & offline circuit fallback.
  - **Frontend Component & State Tests (37 tests in < 700ms):** In-memory DOM simulation (`happy-dom`) verifying currency card grids with dynamic pocket creation modal, transaction ledger audit tables, 250ms debounced search filters, loading states, custom selects, and reactive action workbench form interactions with live conversion previews & IDR micro-rate formatting.

```bash
# Additional verification commands:
npm run typecheck    # Strict TypeScript compiler verification (0 errors)
npm run docs:build   # Production static build of documentation (0 warnings)
```

---

## 🎯 Live Challenge Compliance Matrix

| Challenge Requirement | Implementation Evidence | Status |
| :--- | :--- | :---: |
| **1. Multi-Currency Wallets** | Pre-seeded 5 wallets (`USD`, `EUR`, `GBP`, `SGD`, `IDR`) with currency-specific decimal scale guards & dynamic sub-wallet creation. | ✅ Implemented |
| **2. Fund Management (Deposit & Withdraw)** | Pure domain use-cases (`DepositFunds`, `WithdrawFunds`) enforcing positive amounts & overdraft prevention. | ✅ Implemented |
| **3. Currency Conversion** | Integration with Frankfurter API, 60s in-memory TTL caching, offline triangular arbitrage fallback, and real-time UI preview. | ✅ Implemented |
| **4. Wallet Fund Transfers** | Strict 1:1 same-currency transfers pairing debit and credit records via a shared `referenceId`. | ✅ Implemented |
| **5. Transaction Audit Ledger** | Full transaction log with currency filter, transaction type filter, pagination, and detailed audit modal inspector. | ✅ Implemented |
| **6. User Simulation** | Zero-friction single simulated user (`user-simulated` / Indra SB) eliminating complex auth blockers during live evaluation. | ✅ Implemented |
| **7. Test Suite & Quality** | 81 comprehensive unit & component tests executed in Vitest in ~1s with strict TypeScript typing. | ✅ Implemented |
| **8. Architecture & Documentation** | Clean DDD separation (`core/` -> `infrastructure/` -> `app/`) accompanied by a live Docusaurus SSOT documentation portal. | ✅ Implemented |

---

## 🏛️ Monorepo Architecture & Directory Structure

```text
tc-coconut-lab/
├── README.md              # Root execution guide & architectural rationale
├── package.json           # Root proxy scripts (setup, dev, test, docs:dev, docs:build)
├── AGENTS.md              # Living AI Governance (5 Core Architectural Invariants)
├── CONTEXT-MAP.md         # Topographical index of the repository
├── scripts/
│   └── start-docs.js      # Zero-dependency dynamic port orchestrator for Docusaurus
│
├── 📂 app-core/           # [Runtime Execution Boundary]
│   ├── prisma/            # SQLite schema (file:./dev.db) & universal seed script
│   ├── src/core/          # Pure Business Domain (Entities, Invariants, Use-Cases)
│   ├── src/infrastructure/# Prisma Repository Implementations & Frankfurter Service
│   ├── src/app/           # Next.js App Router (REST APIs & Reactive Workbench)
│   ├── src/components/    # Modular UI Components (src/components/wallet/)
│   └── tests/             # Automated Vitest Test Suite (81 passing tests)
│
├── 📂 docs/               # [Headless Architecture SSOT]
│   ├── 00-prd/            # Product requirements & user stories (SSOT)
│   ├── 01-architecture/   # System design & database specifications
│   ├── 02-tech-stack/     # Technology matrix & architectural invariants
│   ├── 03-domain-logic/   # Business rules, rounding math & error hierarchy
│   ├── 04-api-contracts/  # Standard REST envelope definitions & route schemas
│   ├── 05-operations/     # Operations runbook & developer workflow
│   ├── 06-testing/        # Automated testing strategy & QA matrix
│   └── 99-roadmap/        # Progressive milestones & delivery tracker (Phases 1-12)
│
└── 📂 docs-viewer/        # [Interactive Documentation Engine]
    └── Docusaurus viewer rendering local technical docs on port 7001
```

---

## 🛡️ Key Architectural Invariants Enforced

1. **Clean Domain-Driven Isolation:** Business rules live purely in `src/core/use-cases/` (zero framework coupling to Next.js or Prisma).
2. **Double-Entry Financial Accounting:** Transfers and conversions create paired debit/credit records bound by a shared correlation `referenceId`.
3. **Currency Arithmetic Safety:** Respects currency subunit scales (e.g., standard fiat 2 decimals, zero negative balances) using IEEE-754 epsilon guards.
4. **Resilient Integration Gateway:** Frankfurter API service incorporates in-memory TTL caching (60s) and an offline triangular arbitrage fallback matrix.
5. **Standard API Response Envelope:** All endpoints return `{ success, data, error, meta }`.
6. **Atomic Local Persistence:** SQLite (`dev.db`) ensures real transactional integrity without external container overhead.
