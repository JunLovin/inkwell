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

## Directory Structure

```
app/
  (auth)/          # Login, register, forgot/reset password — shared auth layout
  (dashboard)/     # Protected area — AuthGuard wraps this group
    dashboard/
      notes/[slug] # Dynamic note page
  (root)/          # Public landing page
  layout.tsx       # Root layout with all providers
convex/
  schema.ts        # Single source of truth for DB types
  notes.ts         # Note queries & mutations
  users.ts         # User queries
  auth.ts          # convexAuth config
  auth.config.ts   # Auth providers
  http.ts          # HTTP routes
shared/
  components/
    ui/            # Reusable UI components (Button, Input, Card, Toast, Drawer…)
    layout/        # Layout-level components (Sidenav, etc.)
    providers/     # Client-side providers (ConvexClientProvider, etc.)
  schemas/         # Zod validation schemas
lib/
  hooks/           # Custom React hooks (useToast, etc.)
  stores/          # Zustand stores (toast.store.ts, etc.)
  types/           # Shared TypeScript types
```

---

## File & Naming Conventions

| What                  | Convention                | Example                         |
| --------------------- | ------------------------- | ------------------------------- |
| Component files       | PascalCase                | `Button.tsx`, `NoteEditor.tsx`  |
| Component directories | kebab-case                | `icon-box/`, `sidenav-item/`    |
| Barrel exports        | `index.ts`                | `shared/components/ui/index.ts` |
| Hooks                 | `use` prefix, camelCase   | `useToast.ts`                   |
| Zustand stores        | `.store.ts` suffix        | `toast.store.ts`                |
| Type files            | `.types.ts` suffix        | `toast.types.ts`                |
| Zod schemas           | `.schema.ts` suffix       | `login.schema.ts`               |
| Convex functions      | camelCase, domain-grouped | `notes.ts`, `users.ts`          |

---

## Import Aliases

`@/*` maps to the project root (`tsconfig.json`).

```typescript
import { api } from "@/convex/_generated/api";
import { Button } from "@/shared/components/ui";
import { useToast } from "@/lib/hooks/useToast";
import { loginSchema } from "@/shared/schemas/login.schema";
```

Always use `@/` aliases — never relative `../../` paths.

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
- Use `Doc<"tableName">` from Convex for document types.
- Use `z.infer<typeof schema>` for form types derived from Zod.

---

## Component Pattern

All shared UI components follow this shape:

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

**Query pattern**:

```typescript
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const getNotes = query({
  args: { search: v.optional(v.string()) },
  handler: async (ctx, args) => {
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

**Mutation pattern**:

```typescript
export const updateNote = mutation({
  args: { id: v.id("notes"), title: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const { id, title } = args;
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const note = await ctx.db.get("notes", id);
    if (!note || note.authorId !== userId) throw new Error("Not authorized");

    await ctx.db.patch("notes", id, {
      title: title ?? note.title,
      updatedAt: Date.now(),
    });
  },
});
```

**Client usage** (inside `"use client"` components):

```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const notes = useQuery(api.notes.getNotes, {});
const updateNote = useMutation(api.notes.updateNote);
```

- Always guard with `getAuthUserId` — throw `"Not authenticated"` if null.
- Always verify `note.authorId === userId` before patching or deleting.
- Use `withIndex` for all user-scoped queries (never full table scans).
- Use `ctx.db.patch` for partial updates, pass only changed fields.
- Timestamps: `updatedAt: Date.now()` on every write.

---

## Authentication

Provider: `@convex-dev/auth` with `Password` provider.

**Guard component** (`shared/components/auth-guard.tsx`):

```typescript
"use client";
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) return <div>Redirecting...</div>;
  return children;
}
```

**Auth actions** (inside `"use client"` components):

```typescript
import { useAuthActions } from "@convex-dev/auth/react";
const { signIn, signOut } = useAuthActions();
await signIn("password", { email, password, flow: "signIn" });
```

---

## Lexical Editor

The editor stores content as **JSON string** (Lexical `EditorState` serialized), not raw Markdown or HTML.

Key patterns from `shared/components/ui/note/NoteEditor.tsx`:

- `editorConfig` is exported and reused across note surfaces.
- `RestoreContentPlugin` — custom plugin using `useLexicalComposerContext` that restores saved JSON state once on mount (guarded by `useRef` flag).
- Content change handler extracts both the full JSON and a 150-char plain-text preview.
- Autosave is debounced 3000ms at the page/drawer level, not inside the editor.
- Nodes registered: `ParagraphNode`, `HeadingNode`, `QuoteNode`, `CodeNode`, `LinkNode`, `ListNode`, `ListItemNode`, `HorizontalRuleNode`.
- Markdown shortcuts enabled via `MarkdownShortcutPlugin` with all `TRANSFORMERS`.

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

**Zustand** for client UI state (toasts, drawer open state, etc.):

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

**Toast** can be called outside components via `useToastStore.getState()`:

```typescript
export const toast = {
  success: (opts) =>
    useToastStore.getState().add({ ...opts, variant: "success" }),
  error: (opts) => useToastStore.getState().add({ ...opts, variant: "danger" }),
};
```

Convex `useQuery` is the source of truth for server state — no client cache duplication.

---

## Next.js Routing

App Router with route groups:

| Group         | Layout wraps                 | Purpose                         |
| ------------- | ---------------------------- | ------------------------------- |
| `(auth)`      | Auth layout                  | Login, register, password flows |
| `(dashboard)` | AuthGuard + dashboard layout | All protected pages             |
| `(root)`      | Minimal                      | Public landing                  |

- Dynamic routes use `[slug]` (not `[id]`) — notes are addressed by slug.
- `useRouter()` for programmatic navigation.
- No `getServerSideProps` / `getStaticProps` — all data via Convex hooks.
