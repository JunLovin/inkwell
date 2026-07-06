# Contributing to Inkwell

Thanks for considering a contribution! Inkwell is an open, paywall-free note-taking app, and every improvement — bug fix, feature, doc polish — helps us keep it that way. This guide walks you from a clean clone to a merged PR.

If you spot something in this doc that's wrong or unclear, that itself is a great first contribution.

---

## Before you start

- Read the [Code of Conduct](../CODE_OF_CONDUCT.md). By participating, you agree to uphold it.
- Skim the [Architecture overview](./ARCHITECTURE.md) — five minutes here will save you an hour later.
- For anything larger than a small bug fix or copy tweak, **open an issue or discussion first**. It's much easier to align on approach before you've written 500 lines.

---

## Prerequisites

| Tool     | Version                                   | Why                                    |
| -------- | ----------------------------------------- | -------------------------------------- |
| Node     | **24+** (CI uses Node 24)                 | Runtime for Next.js and Vitest         |
| pnpm     | **10+** (CI uses pnpm v10)                | Project package manager                |
| Convex   | Free account at [convex.dev](https://convex.dev) | Backend & database                |
| Git      | Any recent version                        | Source control                         |

We use pnpm — not npm, not yarn, not bun. A `pnpm-lock.yaml` exists at the repo root; please don't commit lockfiles from other package managers.

---

## Local setup

```bash
# 1. Clone
git clone <your-fork-url> inkwell
cd inkwell

# 2. Install dependencies (this also sets up Husky pre-commit hooks via the `prepare` script)
pnpm install

# 3. Set up environment variables
cp .env.example .env.local
# open .env.local and fill in the values (see the table below)

# 4. Start the dev server (runs Next.js + Convex together)
pnpm dev
```

On your first `pnpm dev`, Convex will prompt you in the terminal to log in and create a dev deployment. That step writes `CONVEX_DEPLOYMENT` into `.env.local` for you. When it's done, open <http://localhost:3000>.

### Environment variables

| Variable                 | Required           | What it's for                                                       |
| ------------------------ | ------------------ | ------------------------------------------------------------------- |
| `NEXT_PUBLIC_CONVEX_URL` | ✅ Yes              | Your Convex deployment URL (Convex CLI fills this on first `dev`)   |
| `CONVEX_SITE_URL`        | ✅ Yes              | Auth JWT issuer domain (Convex CLI fills this too)                  |
| `GEMINI_API_KEY`         | ⚠️ For AI features  | Google Gemini API key — get one at <https://aistudio.google.com>    |
| `AUTH_RESEND_KEY`        | ❌ Not yet          | Placeholder for the Resend email provider (not wired up yet)        |

Working on something that doesn't touch AI chat? Skip the `GEMINI_API_KEY` and set `AI_TEST_MODE=true` in `.env.local` — the chat action will return a stub reply.

---

## Project layout

A short map. See [ARCHITECTURE.md](./ARCHITECTURE.md) for depth.

```
inkwell/
├── app/                  # Next.js App Router — thin route layer
│   ├── (auth)/           # Login, register, password flows
│   ├── (dashboard)/      # Protected — wrapped in AuthGuard + Sidenav + AI panel
│   └── (root)/           # Public landing
├── convex/               # Backend: schema, functions, auth, crons
│   ├── _generated/       # DO NOT EDIT — Convex regenerates this
│   ├── _shared/          # Errors, helpers
│   ├── model/            # Auth + ownership + cascade helpers
│   ├── schema.ts         # Single source of truth for tables & indexes
│   └── notes.ts, users.ts, ai.ts, folders.ts, tags.ts, http.ts, crons.ts, auth.ts
├── src/
│   ├── core/errors/      # AppError base + typed subclasses
│   ├── modules/          # Feature-modular hexagonal code
│   │   ├── notes/  auth/  ai-chat/  folders/  tags/  settings/
│   ├── shared/           # Design system, layouts, providers, cross-cutting stores
│   └── lib/lexical/      # Editor config (single source of truth)
├── tests/e2e/            # Playwright tests
└── .github/workflows/    # CI: ci.yml, tests.yml, convex.yml
```

---

## Development workflow

1. **Fork the repo** and clone your fork.
2. **Branch from `dev`.** The `dev` branch is the integration branch. `main` is release-only.
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feat/short-descriptive-name
   ```
3. **Keep changes focused.** One PR = one topic. If you find unrelated cleanups along the way, mention them in the PR description or open a follow-up.
4. **Follow the hard rules below.** Match the existing style even if you'd do it differently — consistency wins.

---

## Commands you'll actually run

All scripts are defined in `package.json`. Run them with `pnpm`.

| Command                   | What it does                                                             |
| ------------------------- | ------------------------------------------------------------------------ |
| `pnpm dev`                | Start Next.js + spawn the Convex dev sync loop                           |
| `pnpm lint`               | Run ESLint (the same command CI runs)                                    |
| `pnpm exec tsc --noEmit`  | Typecheck the whole project (also run by CI)                             |
| `pnpm build`              | Production build — CI runs this too                                      |
| `pnpm test:unit`          | Unit tests only (jsdom env, `src/**/*.test.tsx`)                         |
| `pnpm test:convex`        | Convex function tests (edge-runtime env, `convex/**/*.test.ts`)          |
| `pnpm test:coverage`      | Both suites above with v8 coverage                                       |
| `pnpm test`               | Vitest in watch mode (unit + convex)                                     |
| `pnpm test:e2e`           | Playwright E2E tests (currently disabled in CI, still runnable locally)  |
| `pnpm test:e2e:install`   | Install the Playwright browsers (`chromium`)                              |
| `pnpm test:e2e:ui`        | Playwright UI mode — great for authoring specs                           |

CI runs `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build`, `pnpm test:coverage`, and in the future `pnpm test:e2e`. Before opening a PR, run at least the first four locally.

---

## Code style

The full ruleset lives in `CLAUDE.md`. The load-bearing ones for contributors:

- **No comments in code.** No inline, no block, no JSDoc. Names and structure carry meaning; if a line needs explanation it usually needs a rename or a refactor. (Comments in `.md` docs are fine — this rule is about source code.)
- **Ports & adapters.** New backend surface belongs in `convex/`; new client-facing hooks belong in a module's `infrastructure/hooks/`. UI never imports `convex/react` — see [ARCHITECTURE.md](./ARCHITECTURE.md).
- **Cross-module imports go through the module's `index.ts`.** From outside a module: `import { useCurrentUser } from "@/modules/auth"`. From inside a module: relative imports (`../../domain/...`).
- **Use `@/` path aliases**, never long `../../` chains. Aliases are defined in `tsconfig.json`.
- **No `cn()`, `clsx()`, or `cva()`.** Compose classes with template literals and `Record<Variant, string>` maps. Example in [ARCHITECTURE.md](./ARCHITECTURE.md).
- **`forwardRef` + `displayName`** on interactive design-system primitives.
- **String literal unions for variants**, not enums. Look up styles with `Record<Variant, string>`.
- **Convex functions do only auth + authz + persistence.** All pure logic lives under `src/modules/*/domain/` so it stays client-side and unit-testable without `convex-test`.
- **Use `withIndex`, never `.filter()`** on Convex queries. If you need a new query shape, add an index.
- **Timestamps.** Every write patches `updatedAt: Date.now()`. New rows also set `createdAt`.
- **Wrap GSAP in `gsap.context()`** and revert on unmount. Match the pattern in `app/(root)/page.tsx`.

---

## Naming conventions

A summary; the full table is in `CLAUDE.md`. Show, don't tell:

| What                     | Convention                        | Example                          |
| ------------------------ | --------------------------------- | -------------------------------- |
| Module / layer folders   | `kebab-case`                      | `ai-chat/`, `infrastructure/`    |
| Domain entities          | `kebab-case.ts`                   | `note.ts`, `chat-message.ts`     |
| Repository ports         | `<name>.repository.ts`            | `note.repository.ts`             |
| Convex adapters          | `<source>-<name>.repository.ts`   | `convex-note.repository.ts`      |
| Application services     | `<name>.service.ts`               | `notes.service.ts`               |
| Infrastructure hooks     | `use-<name>.ts`                   | `use-notes.ts`                   |
| Component files          | `PascalCase.tsx`                  | `NoteCard.tsx`                   |
| Component folders        | `kebab-case`                      | `note-card/`                     |
| Page components          | `kebab-case-page.tsx`             | `notes-list-page.tsx`            |
| Zod schemas              | `<name>.schema.ts`                | `login.schema.ts`                |
| Zustand stores           | `<name>.store.ts`                 | `toast.store.ts`                 |
| Errors                   | `<name>.error.ts`                 | `not-authenticated.error.ts`     |
| Convex function files    | `camelCase`, grouped by domain    | `notes.ts`, `users.ts`, `ai.ts`  |

---

## Adding a feature — the happy path

Let's say you're adding "reminders" to notes. Here's the pattern:

1. **Domain first.** In `src/modules/notes/domain/`, add the type (`entities/reminder.ts`), any pure logic (`services/reminder-schedule.ts`), and — if you need new data access — extend `repositories/note.repository.ts` with a new hook signature on the port.
2. **Schema + Convex function.** Add fields or a new table to `convex/schema.ts` with a proper index. Add the query/mutation to `convex/notes.ts` (or a new file if the surface justifies it), starting with `requireUserId(ctx)` and — for mutations — `assertNoteOwner(ctx, id, userId)`.
3. **Adapter.** Implement the new port method in `src/modules/notes/infrastructure/repositories/convex-note.repository.ts` by wrapping the Convex hook.
4. **Application service.** If the feature has real use-case logic (composition, filtering, orchestration), add a method to `notes.service.ts`. If it's a pass-through, you can skip this and re-export directly.
5. **Public hook.** Add a hook under `infrastructure/hooks/` and export it from `src/modules/notes/index.ts`.
6. **UI.** Build components under `ui/components/` and, if needed, a page under `ui/pages/`. Export from `index.ts`. UI imports from `@/modules/notes` only.
7. **Route wire-up.** If there's a new page, add a thin re-export in `app/(dashboard)/...`. No JSX in `app/` beyond `<YourPage />`.
8. **Tests.** Add Convex tests to `convex/*.test.ts` for functions; add unit tests to `src/**/*.test.tsx` for domain services and complex hooks.
9. **Update docs.** If the change alters the schema, the module surface, or the architecture — update the relevant doc in this folder in the same PR.

---

## Testing expectations

Three test tiers, all optional per PR but strongly encouraged for anything non-trivial:

- **Unit** (`pnpm test:unit`) — Vitest with `jsdom`, `@testing-library/react`. Use for domain services, pure functions, complex hooks.
- **Convex** (`pnpm test:convex`) — Vitest with `edge-runtime` and `convex-test`. Use for query/mutation logic, ownership checks, cascade behavior.
- **E2E** (`pnpm test:e2e`) — Playwright, Chromium only. Use for auth flows, editor UX, and AI chat. Existing specs live in `tests/e2e/`. The E2E job is temporarily disabled in CI; local runs still work.

Coverage isn't gated, but domain services and Convex functions should have real coverage — they're the load-bearing parts.

---

## Commit, push, PR

1. **Commit style.** Short imperative subject line. Group related changes; avoid drive-by "fix typo" commits when they're actually part of a feature.
2. **Pre-commit hook.** Husky + lint-staged run `eslint --fix` and `prettier --write` on staged `.{js,jsx,ts,tsx}` files automatically. If the hook fails, fix the issue and re-stage — never use `--no-verify`.
3. **Push to your fork.**
4. **Open a PR against `dev`.** Include:
   - What changed and why
   - How you verified it (commands you ran, screenshots for UI)
   - Any follow-ups you noticed but didn't do
5. **Wait for CI.** Lint, typecheck, build, unit + Convex tests must be green.
6. **Respond to reviews.** Push new commits — don't force-push shared branches unless a maintainer asks.

Maintainers may squash on merge to keep `dev` history readable.

---

## Reporting bugs and requesting features

- **Bugs** — open a GitHub issue with reproduction steps, expected vs. actual, environment (browser, OS), and console errors if any. Search first — someone may have hit it already.
- **Feature ideas** — start a GitHub discussion so we can align on shape before code lands. If the idea is small and self-evident, an issue is fine.
- **Security issues** — please do not open a public issue. Contact the maintainer directly (email in `CODE_OF_CONDUCT.md`).

---

## License

By contributing, you agree that your contributions will be licensed under the project's [MIT License](../LICENSE).

Thanks again — happy hacking.
