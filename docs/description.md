# Overview

This PR establishes a comprehensive test baseline for Inkwell across every layer of the stack — pure domain logic, application services, Zustand stores, React hooks, design-system primitives, feature components, Convex queries/mutations, and end-to-end flows. It also introduces a dedicated CI workflow that runs the entire test suite on every push to `dev`/`main` and every PR to `dev`, with coverage reporting. No business logic was changed: the goal is observable confidence, not new features. Bugs surfaced by the tests will be tracked and addressed in follow-up PRs per agreement.

---

## Key Changes

### 1. Test Infrastructure

* **Dependencies added (dev only):** `@testing-library/jest-dom`, `@testing-library/user-event`, `@vitest/coverage-v8`, `convex-test`, `@edge-runtime/vm`, `@playwright/test`, `dotenv`.
* **`vitest.config.mts` rewritten:** Switched to Vitest projects so unit/component tests run in `jsdom` while Convex backend tests run in `edge-runtime` (the canonical `convex-test` environment). Single coverage config (v8) applied across both projects with `text`, `html`, and `lcov` reporters.
* **`vitest.setup.ts` added:** Registers `@testing-library/jest-dom/vitest` matchers, wires per-test `cleanup()`, and polyfills `Element.prototype.scrollIntoView` for components that scroll on mount.
* **New scripts in `package.json`:** `test:run`, `test:coverage`, `test:unit`, `test:convex`, `test:e2e`, `test:e2e:install`, `test:e2e:ui`.
* **`.gitignore` updated:** Excludes `/coverage`, `/playwright-report`, `/test-results`, `/tests/e2e/.auth`.

### 2. Pure-Logic Unit Tests (Vitest)

Colocated `*.test.ts` files for every pure-function module so domain behavior is verified without React/Convex/Lexical at all:

* `src/core/errors/` — `AppError`, `NotAuthenticatedError`, `NotAuthorizedError`, `NotFoundError` (codes, default + custom messages, subclass `name` preservation).
* `src/modules/auth/domain/errors/auth.errors.test.ts` — `InvalidCredentialsError`, `SignUpFailedError` codes + `AppError` instance checks.
* `src/modules/notes/domain/services/note-status.test.ts` — full truth table for `isDeleted` / `isArchived` / `isFavorite` / `isActive`.
* `src/modules/ai-chat/domain/services/prompt-suggestions.test.ts` — branch coverage for `getSuggestions(null)` vs `getSuggestions(note)`.
* `src/modules/ai-chat/domain/entities/chat-context.test.ts` — `dashboardContextId` constant + `noteContextId(slug)` derivation.
* `src/lib/lexical/json-to-markdown.test.ts` — heading + paragraph conversion and documented throwing behavior on malformed JSON.
* `convex/_shared/errors.test.ts` — every error factory returns the expected `ConvexError` payload.

### 3. Application Services Tests

Tests against mocked repository ports so the orchestration layer is verified independently of Convex:

* `src/modules/notes/application/notes.service.test.ts` — `useFilteredNotes` filtering, `useNoteCounts` aggregation, and `useNoteActions.createNote` title-trimming + `"Untitled"` fallback + slug generation, plus identity-checks that mutations are bound 1:1 to the repo port.
* `src/modules/ai-chat/application/chat.service.test.ts` — `useSendMessage` builds the correct Gemini history (`user`/`model` role mapping), appends `inlineData` parts for attached files, and forwards the system prompt that reflects the attached note.

### 4. Store & Hook Tests

* **Zustand stores:** `src/shared/stores/toast.store.test.ts` and `src/modules/ai-chat/infrastructure/stores/ai-chat.store.test.ts` — full state-transition coverage (open/close/toggle, per-context messages, attached files, `removeLastAssistantMessage` predicates, `clearContext`).
* **Shared hooks (`@testing-library/react` `renderHook`):** `use-focus-trap.test.tsx`, `use-portal-mounted.test.tsx`, `use-toast.test.tsx` — focus cycling, SSR-safe mount flag, toast variants (success/danger/error alias/warning/info/default).

### 5. Zod Schema Tests

Form-validation contracts kept honest at the schema level:

* `login.schema.test.ts`, `register.schema.test.ts`, `reset-password.schema.test.ts`, `change-password.schema.test.ts` — happy path, empty/invalid inputs, password length, mismatch refinements, flow literal checks.

### 6. Shared UI Primitive Tests (React Testing Library)

One `*.test.tsx` per `src/shared/ui/*` component (19 in total): Button, Input, Textarea, Select, Dialog, Drawer, Dropdown, Tooltip, Toast, Card, Chip, Badge, Avatar, List, Spinner, Loader, IconBox, Divider, Field. Each test renders every variant/size, asserts class-map output, fires interaction handlers (clicks, Esc, Tab cycling, mouse-enter for tooltips), and checks accessibility attributes (`aria-pressed`, `role="dialog"`, `role="alert"` vs `role="status"`). GSAP is stubbed at the module level for portal-driven components (`Dialog`, `Drawer`, `Dropdown`, `Select`, `Toast`) so animation timing never flakes.

### 7. Feature Component Tests

* `src/modules/notes/ui/components/note-card/NoteCard.test.tsx` — title fallback, click handlers, per-action buttons, `e.stopPropagation` on the pin/favorite/archive/delete buttons, `aria-pressed` in selectable mode.
* `src/modules/notes/ui/components/notes-grid/NotesGrid.test.tsx` — empty-state CTA, one card per note, selection forwarding.
* `src/modules/ai-chat/ui/components/AIChatMessage.test.tsx` — user vs assistant rendering, regenerate button visibility.
* `src/modules/ai-chat/ui/components/AIChatMarkdown.test.tsx` — headings, ordered/unordered lists, fenced code blocks, inline code/bold/italic, blank-line handling.
* `src/modules/ai-chat/ui/components/AIChatInput.test.tsx` — submit on Enter (trimmed), no-submit on Shift+Enter, blocked while `isLoading`, attachment menu open/close.
* `src/modules/ai-chat/ui/components/AIChatPanel.test.tsx` — header rendering, empty-state suggestions, Clear-chat visibility, with `next/navigation` and Convex hooks mocked.

### 8. Convex Backend Tests (convex-test, in-memory)

Each `convex/*.test.ts` exercises every query/mutation against an in-memory backend. A small `convex/_shared/test-utils.ts` helper (`seedUser`) inserts a real `users` row and synthesizes a matching identity so `getAuthUserId(ctx)` resolves to a valid `Id<"users">`.

* `convex/notes.test.ts` — auth guards on every endpoint; CRUD; state transitions (archive/restore/favorite/unfavorite/pin/unpin/soft-delete/update); cross-user authorization rejections; `bulkArchive` / `bulkDelete` silently skip non-owned ids; `searchNotes` returns `[]` for empty/whitespace input.
* `convex/users.test.ts` — `getUserInfo` returns the authenticated user; `updateProfile` trims + enforces `≥ 2` chars; `deleteAccount` cascades the user's notes.
* `convex/folders.test.ts` — name trim + dedup + collision on rename; `deleteFolder` clears `folderId` on the user's notes; cross-user authz on `moveNoteToFolder`.
* `convex/tags.test.ts` — name trim + dedup; `deleteTag` cascades `noteTags` links; `assignTagToNote` is idempotent; cross-user assignments rejected; `listTagsForNote` filters to the requesting user.
* `convex/ai.test.ts` — `@google/genai` mocked at the module level; covers unauthenticated, happy path (returns `gemini-2.5-flash` text), missing `GEMINI_API_KEY` → `AI_NOT_CONFIGURED`, and the new `AI_TEST_MODE=true` short-circuit returning `[stub] reply`.

### 9. Production Code Change (single, minimal)

* `convex/ai.ts` — added a 3-line `process.env.AI_TEST_MODE === "true"` short-circuit immediately after the auth guard. Returns a canned `"[stub] reply"` and avoids Gemini quota during E2E. Production behavior is unchanged when the env var is unset. No other production files were modified.

### 10. Playwright E2E Setup

* `playwright.config.ts` — single chromium project with a `setup` dependency project that registers a test user and saves storage state. `webServer` boots `pnpm dev` with `AI_TEST_MODE=true`. `trace`, `screenshot`, and `video` retained on failure.
* `tests/e2e/global-setup.ts` — registers `e2e+<timestamp>@inkwell.test` against the configured Convex deployment and writes `tests/e2e/.auth/user.json` for the chromium project to reuse.
* `tests/e2e/auth.spec.ts`, `notes.spec.ts`, `note-editor.spec.ts`, `ai-chat.spec.ts`, `dashboard.spec.ts` — covers forgot-password reachability, invalid-credential rejection, sidenav navigation across notes/favorite/archived/settings, empty-state CTAs, and the AI chat opening with the stubbed reply.

### 11. New CI Workflow — `.github/workflows/tests.yml`

* **Triggers:** push to `dev` and `main`, pull requests to `dev`. The existing `ci.yml` (lint + tsc + build on `main`) and `convex.yml` (deploy) are untouched.
* **`unit` job:** pnpm 10 + Node 24 (matching `ci.yml`), `pnpm install --frozen-lockfile`, `pnpm test:coverage`. Uploads `coverage/` as a workflow artifact (no enforced threshold — visibility only).
* **`e2e` job (`needs: unit`):** Caches Playwright browsers (`~/.cache/ms-playwright`) keyed on `pnpm-lock.yaml`, runs `pnpm test:e2e:install` then `pnpm test:e2e` with `AI_TEST_MODE=true` and the dedicated Convex test deployment secrets. Uploads `playwright-report/` and `test-results/` on failure.

### 12. Test Baseline Summary

* **382 tests across 59 files, all green** at `pnpm test:run`.
* **Unit (jsdom) project:** 52 files, 317 tests — pure logic, services, stores, hooks, schemas, UI primitives, feature components.
* **Convex (edge-runtime) project:** 7 files, 65 tests — backend queries, mutations, and the AI action with `@google/genai` mocked.
* `pnpm exec tsc --noEmit` is clean across the entire project, including the new test files. Coverage currently sits at ~38.8% lines across `src/` + `convex/`; the gap is mostly the Lexical editor file, infrastructure adapters that wrap Convex `useQuery`/`useMutation`, and pages — by design, these are exercised end-to-end by Playwright rather than by unit tests.

### 13. Notable Caveats / Follow-ups

* The E2E job will fail until the user provisions a dedicated Convex test deployment and adds `E2E_CONVEX_URL` + `E2E_CONVEX_DEPLOY_KEY` repo secrets. The unit job is fully self-contained and will pass immediately.
* Pre-existing lint warnings/errors in `Toast.tsx`, `Tooltip.tsx`, `note-detail-page.tsx`, `notes-list-page.tsx`, `NoteDrawer.tsx`, `AIChatInput.tsx`, `use-portal-mounted.ts`, and `floating-format-toolbar.plugin.tsx` were intentionally left untouched per the agreement to ship the tests first and address issues in follow-ups.
* `jsonToMarkdown` throws on malformed JSON instead of swallowing the error as the `onError` handler suggests it might — the unit test documents the actual behavior; whether this is intended is left as a follow-up.
* `.lintstagedrc` references `prettier` but `prettier` is still not in `devDependencies`. Out of scope for this PR; flagged here.
* Playwright specs are intentionally conservative (smoke-level) so they remain useful while the E2E backend secrets are still being provisioned. They can be deepened in a follow-up PR once the test deployment is live.
