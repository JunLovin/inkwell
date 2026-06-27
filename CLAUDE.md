@AGENTS.md

<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

## Project: Inkwell

Inkwell is an open, paywall-free note-taking web app — think Obsidian's Markdown power + Notion's cloud sync, but free. Notes are stored in Convex, the UI is fully responsive (mobile/tablet/desktop), and the editor is Lexical for performance and scalability. An AI free-tier is planned.

**Stack**: Next.js 16 (App Router) · Convex (BaaS) · Tailwind CSS 4 · Lexical (editor) · GSAP (animations) · Zustand (client state) · `@convex-dev/auth` · Zod · Lucide Icons

---

## Hard Rules

- Never add comments to code — no inline, block, JSDoc, or `//` comments.
- Never commit, push, open PRs, or create issues.
- Write clean, scalable, performant code only. No premature abstractions.

---

## Architecture: Ports & Adapters (Hexagonal), Feature-Modular

Inkwell follows a **feature-modular hexagonal architecture**. Three things to remember:

1. **The dependency rule**: `ui → application → domain ← infrastructure`. The `domain/` layer never imports React, Convex, Zustand, GSAP, or Lexical.
2. **Ports are hook-based**. A repository port is a TypeScript type describing the hooks a feature needs. The infrastructure layer provides them by wrapping `useQuery`/`useMutation`/`useAction` from Convex.
3. **The UI never touches Convex directly**. UI imports hooks from a module's public API (`@/modules/<feature>`); the module wires Convex internally.

### Layers per module

```
src/modules/<feature>/
  domain/              # Pure - zero framework imports
    entities/          # Types backed by Doc<"...">
    value-objects/     # Pure functions (e.g. generateSlug)
    services/          # Pure transformations (filtering, prompts)
    repositories/      # PORT interfaces (hook signatures)
    errors/            # AppError subclasses
  application/         # Use cases as service files
    <feature>.service.ts
  infrastructure/      # Adapters
    repositories/      # Implement the port via Convex hooks
    hooks/             # Wrap the service for UI consumption
    stores/            # Zustand (feature-local UI state)
  ui/                  # Presentation only — no business logic
    components/        # Feature-specific components
    pages/             # <FeatureName>Page components
    schemas/           # Zod schemas for forms
  index.ts             # Public API — only file other modules import from
```

### Module boundaries

- **Cross-module imports go through `index.ts`.** `notes/ui/*` may NOT reach into `auth/domain/*`. Use `import { useCurrentUser } from "@/modules/auth"`.
- **`shared/` does not import from `modules/`.** Exception: `shared/layout/dashboard-sidenav/` is the dashboard composition root and is allowed to import module public APIs.
- **`app/` is the outermost composition root.** Page files are thin re-exports; layouts compose modules.

### Convex's role

Convex is the **server-side driven adapter** plus the persistence layer. Convex files (`convex/notes.ts`, `convex/users.ts`, `convex/ai.ts`) hold only:

- Authentication guards (`getAuthUserId`)
- Authorization checks (`note.authorId === userId`)
- Persistence operations (`ctx.db.query/insert/patch`)

Logic that **does not depend on `ctx`** lives in `src/modules/*/domain/`. Slug generation, filter/sort/search, status predicates, AI system prompt construction — all client-side, all pure.

---

## Directory Structure

```
inkwell/
├── app/                                  # Next.js App Router — thin route layer
│   ├── (auth)/                           # Login, register, forgot/reset password
│   ├── (dashboard)/                      # Protected — wrapped in <AuthGuard>
│   ├── (root)/                           # Public landing
│   └── layout.tsx                        # Root providers
├── convex/                               # Convex backend (driven adapter)
│   ├── schema.ts                         # Single source of truth for DB types
│   ├── notes.ts, users.ts, ai.ts         # Auth + persistence only
│   └── auth.ts, auth.config.ts, http.ts
└── src/
    ├── core/                             # Cross-cutting primitives
    │   ├── errors/                       # AppError, NotAuthenticated, NotAuthorized, NotFound
    │   └── types/                        # Result<T, E>
    ├── modules/
    │   ├── notes/                        # Note CRUD + filtering + editor
    │   ├── auth/                         # Sign in/up/out, session, current user
    │   └── ai-chat/                      # AI assistant + chat UI
    ├── shared/
    │   ├── ui/                           # Design system primitives (Button, Input, …)
    │   ├── layout/                       # Header, Sidenav, DashboardSidenav
    │   ├── providers/                    # ConvexClientProvider
    │   ├── hooks/                        # use-toast
    │   ├── stores/                       # toast.store
    │   └── types/                        # toast.types
    └── lib/
        └── lexical/                      # Editor config, extract-text, json-to-markdown
```

---

## File & Naming Conventions

| What                          | Convention                  | Example                                |
| ----------------------------- | --------------------------- | -------------------------------------- |
| Module / feature directories  | kebab-case                  | `notes/`, `ai-chat/`                   |
| Layer directories             | kebab-case                  | `domain/`, `application/`, `infrastructure/`, `ui/` |
| Domain entities               | kebab-case `.ts`            | `note.ts`, `user.ts`, `chat-message.ts` |
| Value objects                 | `<name>.ts`                 | `note-slug.ts`                         |
| Domain services               | `<name>.ts` or `.service.ts` | `note-filter.ts`, `system-prompt.builder.ts` |
| Repository ports              | `<name>.repository.ts`      | `note.repository.ts`                   |
| Repository adapters           | `<source>-<name>.repository.ts` | `convex-note.repository.ts`        |
| Application services          | `<name>.service.ts`         | `notes.service.ts`                     |
| Infrastructure hooks          | `use-<name>.ts`             | `use-notes.ts`                         |
| Component files               | PascalCase                  | `NoteCard.tsx`                         |
| Component directories         | kebab-case                  | `note-card/`, `sidenav-item/`          |
| Page components (UI layer)    | kebab-case `.tsx`           | `notes-list-page.tsx`                  |
| Barrel exports                | `index.ts`                  | `src/shared/ui/index.ts`               |
| Zod schemas                   | `<name>.schema.ts`          | `login.schema.ts`                      |
| Zustand stores                | `<name>.store.ts`           | `toast.store.ts`                       |
| Type files                    | `<name>.types.ts`           | `toast.types.ts`                       |
| Errors                        | `<name>.error.ts`           | `not-authenticated.error.ts`           |
| Convex functions              | camelCase, domain-grouped   | `notes.ts`, `users.ts`                 |

---

## Import Aliases

`tsconfig.json` defines these paths:

```typescript
import { AppError } from "@/core/errors";
import { useActiveNotes, type Note } from "@/modules/notes";
import { useCurrentUser } from "@/modules/auth";
import { Button } from "@/shared/ui";
import { useToast } from "@/shared/hooks/use-toast";
import { createEditorConfig } from "@/lib/lexical";
import { api } from "@/convex/_generated/api";
```

- `@/core/*` → `src/core/*`
- `@/modules/*` → `src/modules/*`
- `@/shared/*` → `src/shared/*`
- `@/lib/*` → `src/lib/*`
- `@/convex/*` → `convex/*`
- `@/app/*` → `app/*`
- `@/*` → project root (fallback)

**Never import past a module's `index.ts` from outside the module.** From inside a module, internal layers use relative imports (`../../domain/services/note-filter`). From outside, only the public API: `import { foo } from "@/modules/notes"`.

Always use `@/` aliases — never `../../` for cross-cutting paths.

---

## TypeScript Patterns

```typescript
type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variantStyles: Record<Variant, string> = {
  primary: "bg-white text-zinc-900",
  secondary: "...",
  ghost: "...",
  danger: "...",
};

export type Note = Doc<"notes">;
export type LoginSchema = z.infer<typeof loginSchema>;
```

- Use string literal unions for `variant`/`size` props, never `enum`.
- Use `Record<Union, string>` lookup tables for Tailwind class maps.
- Use `Doc<"tableName">` from Convex for domain entities (re-exported from `domain/entities/`).
- Use `z.infer<typeof schema>` for form types derived from Zod.

---

## Component Pattern

Shared UI primitives (`src/shared/ui/<name>/`) follow:

```typescript
"use client"; // only when needed

import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children?: ReactNode;
};

const variantStyles: Record<Variant, string> = {
  primary: "bg-white text-zinc-900",
  ghost: "bg-transparent text-zinc-400 hover:text-white",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className = "", ...props }, ref) => (
    <button
      ref={ref}
      className={`inline-flex items-center ${variantStyles[variant]} ${className}`}
      {...props}
    />
  ),
);

Button.displayName = "Button";
```

- Use `forwardRef` on interactive elements.
- Always set `displayName`.
- No `cn()` or `clsx()` — use template literals and `Record` maps.
- Spread `className` prop last so callers can override.
- Export from the component's `index.ts` barrel.

**Shared vs feature-specific:**

- Design system primitives (`Button`, `Input`, `Dialog`, …) → `src/shared/ui/<name>/`.
- Feature components (`NoteCard`, `AIChatPanel`, …) → `src/modules/<feature>/ui/components/<name>/`.

---

## Styling (Tailwind CSS 4)

- **No utility library** — no `cn()`, no `clsx()`, no `cva()`. Use template literals and `Record` maps directly.
- Color palette: `zinc`, `emerald`, `red`, `amber`, `blue`.
- Common patterns: `rounded-xl`, `rounded-2xl`, `gap-2`, `px-4 py-2.5`, `shrink-0`, `overflow-hidden`.
- State modifiers: `hover:`, `focus:`, `disabled:`, `group-hover:`.
- Animations handled by GSAP, not Tailwind `transition-*` (exception: `transition-colors` for color-only changes).

---

## Convex Patterns

Always read `convex/_generated/ai/guidelines.md` before writing Convex code.

Convex functions hold **authentication, authorization, and persistence**. Pure transformations (slug generation, search, filtering, sorting, prompt construction) live in `src/modules/*/domain/`.

**Schema** (`convex/schema.ts`):

```typescript
import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,
  notes: defineTable({
    authorId: v.id("users"),
    slug: v.string(),
    title: v.string(),
    content: v.optional(v.string()),
    preview: v.optional(v.string()),
    isDeleted: v.optional(v.boolean()),
    isArchived: v.optional(v.boolean()),
    isFavorite: v.optional(v.boolean()),
    updatedAt: v.optional(v.number()),
  }).index("by_author_id", ["authorId"]),
});

export default schema;
```

**Query pattern** (server) — authz + indexed scan, nothing else:

```typescript
export const getNotes = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db
      .query("notes")
      .withIndex("by_author_id", (q) => q.eq("authorId", userId))
      .order("desc")
      .collect();
  },
});
```

**Mutation pattern** — caller provides derived values (slug):

```typescript
export const addNote = mutation({
  args: { title: v.string(), slug: v.string(), content: v.string(), preview: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.insert("notes", {
      authorId: userId,
      ...args,
      isDeleted: false,
      isArchived: false,
      isFavorite: false,
      updatedAt: Date.now(),
    });
  },
});
```

**Adapter pattern** (`src/modules/notes/infrastructure/repositories/convex-note.repository.ts`):

```typescript
export const convexNoteRepository: NoteRepositoryPort = {
  useList: () => {
    const notes = useQuery(api.notes.getNotes, {});
    return { notes: notes ?? undefined, isLoading: notes === undefined };
  },
  useMutations: () => {
    const create = useMutation(api.notes.addNote);
    return { create: async (input) => { await create(input); }, /* … */ };
  },
};
```

**UI consumption** — never touches `convex/react`:

```typescript
import { useActiveNotes, useNoteActions } from "@/modules/notes";

const { notes, isLoading } = useActiveNotes(search, sortOrder);
const { createNote, archiveNote } = useNoteActions();
```

- Always guard with `getAuthUserId` — throw `"Not authenticated"` if null.
- Always verify `note.authorId === userId` before patching or deleting.
- Use `withIndex` for all user-scoped queries (never full table scans).
- Use `ctx.db.patch` for partial updates, pass only changed fields.
- Timestamps: `updatedAt: Date.now()` on every write.

---

## Authentication

Provider: `@convex-dev/auth` with `Password` provider. The auth module wraps it with a hook-based port.

```typescript
import {
  AuthGuard,
  useAuthSession,
  useAuthActions,
  useCurrentUser,
} from "@/modules/auth";

const { isAuthenticated, isLoading } = useAuthSession();
const { signIn, signUp, signOut } = useAuthActions();
const { user } = useCurrentUser();

await signIn({ email, password });
```

`<AuthGuard>` wraps the dashboard group. UI components never import from `@convex-dev/auth/react` directly — the auth module's infrastructure layer is the only consumer.

---

## Lexical Editor

The editor stores content as a **JSON string** (Lexical `EditorState` serialized), not raw Markdown or HTML.

Single source of truth: `src/lib/lexical/`.

```typescript
import {
  createEditorConfig,
  editorTheme,
  editorNodes,
  extractTextFromLexicalJSON,
  jsonToMarkdown,
  RestoreContentPlugin,
} from "@/lib/lexical";

const config = createEditorConfig("inkwell-note-editor", existingNoteJson);
```

- `createEditorConfig(namespace, editorState?)` — produces an `InitialConfigType`. Single config across `NoteEditor`, `NoteDrawer`, `NoteDetailPage`.
- `editorTheme` — Tailwind class map for nodes.
- `editorNodes` — registered Lexical nodes: `ParagraphNode`, `HeadingNode`, `QuoteNode`, `CodeNode`, `LinkNode`, `ListNode`, `ListItemNode`, `HorizontalRuleNode`.
- `extractTextFromLexicalJSON(json)` — pure utility for AI chat / preview text.
- `jsonToMarkdown(json)` — pure conversion using `@lexical/markdown`.
- `RestoreContentPlugin` — restores saved JSON state once on mount.

Pages enable `MarkdownShortcutPlugin` with all `TRANSFORMERS`. Autosave is debounced 3000ms at the page level, not inside the editor.

Content change pattern:

```typescript
const handleEditorChange = (editorState: EditorState) => {
  const json = JSON.stringify(editorState.toJSON());
  const preview = editorState.read(() =>
    $getRoot().getTextContent().slice(0, 150),
  );
  onContentChange?.(json, preview);
};
```

---

## GSAP Animation Pattern

Wrap all GSAP code in a `gsap.context()` and clean up with `ctx.revert()`.

```typescript
useEffect(() => {
  const ctx = gsap.context(() => {
    gsap
      .timeline({ defaults: { ease: "power3.out" } })
      .fromTo(
        ref.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7 },
      )
      .fromTo(
        other.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.8 },
        "-=0.4",
      );
  }, containerRef);

  return () => ctx.revert();
}, []);
```

Standard easing choices:

- `power3.out` — default exit (most elements)
- `power3.in` / `power3.inOut` — entrances and bidirectional
- `power4.inOut` — strong curves (modals, drawers)
- `power2.in` / `power2.out` — subtle micro-interactions
- `none` — progress bars / linear motion

Stagger entries (lists, grids): `.fromTo(items, ..., { stagger: 0.05 })`.

---

## State Management

Each Zustand store lives where its scope demands:

- **Feature-local stores** → `src/modules/<feature>/infrastructure/stores/<name>.store.ts`. Example: `ai-chat.store.ts` is the AI panel's open/closed state, attached files, per-context messages.
- **Cross-cutting stores** → `src/shared/stores/<name>.store.ts`. Example: `toast.store.ts`.

```typescript
import { create } from "zustand";

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (toast) => {
    const id = Math.random().toString(36).slice(2);
    set((state) => ({ toasts: [...state.toasts, { id, ...toast }] }));
    return id;
  },
  remove: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
```

Toast can be called outside components via `useToastStore.getState()`:

```typescript
export const toast = {
  success: (opts) =>
    useToastStore.getState().add({ ...opts, variant: "success" }),
  error: (opts) => useToastStore.getState().add({ ...opts, variant: "danger" }),
};
```

Convex `useQuery` (wrapped in the infrastructure repository) is the source of truth for server state — no client cache duplication.

---

## Next.js Routing

App Router with route groups:

| Group         | Layout wraps                 | Purpose                         |
| ------------- | ---------------------------- | ------------------------------- |
| `(auth)`      | Auth layout                  | Login, register, password flows |
| `(dashboard)` | AuthGuard + Sidenav + AIChat | All protected pages             |
| `(root)`      | Minimal (Header + Lenis)     | Public landing                  |

- **`app/` page files are thin re-exports.** A page renders a `<*Page />` component from `@/modules/<feature>`. No business logic, no hooks, no JSX beyond `<Foo />`.

```typescript
// app/(dashboard)/dashboard/notes/page.tsx
import { NotesListPage } from "@/modules/notes";

export default function Page() {
  return <NotesListPage />;
}
```

- Dynamic routes use `[slug]` (not `[id]`) — notes are addressed by slug.
- `useRouter()` for programmatic navigation lives in the module's UI layer.
- No `getServerSideProps` / `getStaticProps` — all data flows through Convex hooks behind the repository port.
