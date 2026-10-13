# 🌐 TC Coconut Lab Context Map

This context map outlines the repository topology and technical architecture index for `tc-coconut-lab` (Multi-Currency Digital Wallet Application).

## 📂 Repository Skeleton

```text
tc-coconut-lab/ (Root)
├── AGENTS.md            # [AI Entrypoint] Core operating instructions & architecture invariants
├── docs/                # [Headless DB] Living Technical SSOT (Pure MDX, zero runtime dependencies)
├── app-core/            # [Runtime Engine] Next.js 16 Fullstack (Domain-Driven Design + Prisma SQLite)
│   ├── AGENTS.md        # [Live TC Governance] 5 Invariant Architectural Rules
│   ├── prisma/          # dev.db (SQLite) & schema.prisma
│   ├── src/core/        # Pure Domain Logic (Entities, Custom Errors, Use-Cases)
│   ├── src/infrastructure/ # Prisma Repositories & Frankfurter API Gateway
│   ├── src/app/api/     # Standard REST Handlers (Envelope: { success, data, error })
│   ├── src/components/  # Modular UI Components (src/components/wallet/)
│   └── tests/           # Vitest Automated Test Suite (81/81 passing: 44 backend + 37 frontend)
├── docs-viewer/         # [Headless Portal Engine] Docusaurus Viewer (Port 7001 / custom port)
├── CONTEXT-MAP.md       # [Topological Router] This navigation index
└── .github/             # AI Instructions & Developer Configuration
```

---

## 🗺️ Documentation Index (Full SDLC)

### 🤖 0. AI Operating Rules & Governance
- [Agent Entrypoint](./AGENTS.md)
- [Local Copilot Instructions](./.github/copilot-instructions.md)

### 📄 1. Requirements & PRD (SSOT)
- [Live Challenge Specification (SSOT)](./docs/00-prd/01-live-challenge-spec.mdx)

### 🏗️ 2. Architecture & Design
- [System Architecture & Frankfurter Gateway](./docs/01-architecture/01-system-architecture.mdx)
- [Frontend Architecture & The 4 UI States](./docs/01-architecture/02-frontend-architecture.mdx)
- [Enterprise Architecture Evolution (Double-Entry & FX Engine)](./docs/01-architecture/03-enterprise-ledger-evolution.mdx)

### 🛠️ 3. Tech Stack Specifications
- [Tech Stack Overview](./docs/02-tech-stack/index.mdx)

### 💡 4. Domain Logic & Business Rules
- [Domain Logic & Wallet Invariants](./docs/03-domain-logic/01-multi-currency-wallet-invariants.mdx)

### 🔌 5. API Contracts & DTOs
- [Multi-Currency Wallet API Endpoints](./docs/04-api-contracts/01-wallet-endpoints.mdx)

### 🚀 6. Operations & Runbook
- [Operations Runbook & Developer Workflow](./docs/05-operations/01-operations-runbook.mdx)

### 🧪 7. Testing Strategy
- [Testing Strategy & Quality Assurance](./docs/06-testing/01-testing-strategy.mdx)
- [Manual QA & UAT Runbook](./docs/06-testing/02-manual-qa-runbook.mdx)

### 🗺️ 8. Master Roadmap
- [Master Progress Tracker](./docs/99-roadmap/00-master-progress.mdx)
- [Phase 1: Core Domain & Basic Operations](./docs/99-roadmap/01-phase-1-core.mdx)
- [Phase 2: Frankfurter Gateway, Conversion & Transfer](./docs/99-roadmap/02-phase-2-rates-conversion.mdx)
- [Phase 3: Ledger Inspection & UI Workbench](./docs/99-roadmap/03-phase-3-ledger-ui-workbench.mdx)
- [Phase 4: Production Polish & Modularization](./docs/99-roadmap/04-phase-4-production-polish.mdx)
- [Phase 5: Frontend Component & State Testing](./docs/99-roadmap/05-phase-5-frontend-testing.mdx)
- [Phase 6: FX Converter UX Redesign](./docs/99-roadmap/06-phase-6-fx-converter-ux.mdx)
- [Phase 7: IDR Currency Transition](./docs/99-roadmap/07-phase-7-idr-currency-transition.mdx)
- [Phase 8: Masked Currency Input Component](./docs/99-roadmap/08-phase-8-currency-input-component.mdx)
- [Phase 9: CustomSelect Component](./docs/99-roadmap/09-phase-9-custom-dropdown-component.mdx)
- [Phase 10: Reusable DataTable Component](./docs/99-roadmap/10-phase-10-datatable-component.mdx)
- [Phase 11: Multi-Sub-Wallet Creation & Transfers](./docs/99-roadmap/11-phase-11-multi-wallet-and-same-currency-transfer.mdx)
- [Phase 12: High-Precision FX Rate Engine & Micro-Rate Underflow Resolution](./docs/99-roadmap/12-phase-12-high-precision-fx-rate-resolution.mdx)

---
> **Interactive Viewer:** Launch the documentation engine via `npm run docs:dev [port]`.
