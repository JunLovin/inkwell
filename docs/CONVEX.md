# Convex Backend Guide

Convex is Inkwell's backend: real-time database, functions, auth, and cron. This guide covers what lives on the server, why, and how to work with it without breaking the architecture.

Before you write any Convex code, **read `convex/_generated/ai/guidelines.md`**. That file overrides anything you learned about Convex from other sources.

---

## Convex's role

The `convex/` directory holds three responsibilities and no more:

1. **Authentication guards** — every non-public function starts with `await requireUserId(ctx)`.
2. **Authorization checks** — mutations verify `note.authorId === userId` before touching data.
3. **Persistence** — indexed queries, patches, inserts, deletes.

Everything else is pure logic that runs on the client and lives under `src/modules/*/domain/`: slug generation, filtering, sorting, status predicates, AI system-prompt construction, markdown conversion. Keeping those out of Convex keeps the functions small, keeps CPU off the server, and keeps the domain testable without spinning up `convex-test`.

---

## Schema

Defined in `convex/schema.ts`. `authTables` from `@convex-dev/auth/server` is spread in, providing the `users` table and auth-related tables.

### `notes`

```typescript
notes: defineTable({
  authorId: v.id("users"),
  slug: v.string(),
  title: v.string(),
  content: v.optional(v.string()),
  preview: v.optional(v.string()),
  searchableContent: v.optional(v.string()),
  folderId: v.optional(v.id("folders")),
  isDeleted: v.optional(v.boolean()),
  isArchived: v.optional(v.boolean()),
  isFavorite: v.optional(v.boolean()),
  isPinned: v.optional(v.boolean()),
  updatedAt: v.optional(v.number()),
  createdAt: v.optional(v.number()),
})
```

Indexes:

| Name                         | Fields                          | Used for                                  |
| ---------------------------- | ------------------------------- | ----------------------------------------- |
| `by_author_id`               | `authorId`                      | List all notes for a user                 |
| `by_author_and_slug`         | `authorId, slug`                | Slug lookup                               |
| `by_author_and_folder`       | `authorId, folderId`            | Notes inside a folder                     |
| `by_author_and_deleted`      | `authorId, isDeleted`           | Trash view                                |
| `by_author_and_archived`     | `authorId, isArchived`          | Archive view                              |
| `by_author_and_favorite`     | `authorId, isFavorite`          | Favorites view                            |
| `by_author_and_pinned`       | `authorId, isPinned`            | Pinned notes                              |
| `by_deleted_and_updated`     | `isDeleted, updatedAt`          | Trash purge cron                          |
| `search_content` (search)    | `searchableContent`, filters on `authorId, isDeleted, isArchived, folderId` | Full-text search |

`content` is a serialized Lexical `EditorState` JSON string. `preview` is the first ~150 chars of plain text. `searchableContent` is the plain-text extraction used by the search index.

### `folders`

```typescript
folders: defineTable({
  authorId: v.id("users"),
  name: v.string(),
  color: v.string(),
})
  .index("by_author_id", ["authorId"])
  .index("by_author_and_name", ["authorId", "name"])
```

### `tags`

```typescript
tags: defineTable({
  authorId: v.id("users"),
  name: v.string(),
  color: v.string(),
})
  .index("by_author_id", ["authorId"])
  .index("by_author_and_name", ["authorId", "name"])
```

### `noteTags` (join table)

```typescript
noteTags: defineTable({
  authorId: v.id("users"),
  noteId: v.id("notes"),
  tagId: v.id("tags"),
})
  .index("by_note_id", ["noteId"])
  .index("by_tag_id", ["tagId"])
  .index("by_note_and_tag", ["noteId", "tagId"])
  .index("by_author_id", ["authorId"])
```

---

## Function catalog

Names, args, and one-line purposes. Read the source for implementation details.

### `convex/notes.ts`

**Queries**

| Function              | Args              | Returns                                    |
| --------------------- | ----------------- | ------------------------------------------ |
| `listNotes`           | `{}`              | All active (non-deleted) notes for user    |
| `getNoteBySlug`       | `{ slug }`        | Single note or `null`                      |
| `listArchivedNotes`   | `{}`              | Archived, non-deleted notes                |
| `listDeletedNotes`    | `{}`              | Trash                                      |
| `listFavoriteNotes`   | `{}`              | Favorites, non-deleted                     |
| `searchNotes`         | `{ search }`      | Up to 50 search hits (non-deleted only)    |

**Mutations**

| Function       | Args                                                | Effect                                                |
| -------------- | --------------------------------------------------- | ----------------------------------------------------- |
| `createNote`   | `{ title, slug, content, preview }`                 | Insert with all flags `false`, timestamps set         |
| `updateNote`   | `{ id, title?, content?, preview? }`                | Patch fields; recompute `searchableContent`           |
| `deleteNote`   | `{ id }`                                            | Soft delete (`isDeleted: true`)                       |
| `purgeNote`    | `{ id }`                                            | Hard delete with cascade (removes `noteTags` links)   |
| `archiveNote`  | `{ id }`                                            | `isArchived: true`                                    |
| `restoreNote`  | `{ id }`                                            | Clears both `isArchived` and `isDeleted`              |
| `favoriteNote` / `unfavoriteNote` | `{ id }`                        | Toggle `isFavorite`                                   |
| `pinNote` / `unpinNote`           | `{ id }`                        | Toggle `isPinned`                                     |

**Bulk mutations** — accept `{ ids: v.array(v.id("notes")) }`, 1–100 IDs, return `{ processed, skipped }` after per-ID ownership checks:

- `bulkArchiveNotes`
- `bulkDeleteNotes`
- `bulkPurgeNotes`

**Internal**

- `purgeOldTrash` — cron-triggered, hard-deletes up to 200 notes with `isDeleted === true` and `updatedAt` older than 30 days per run.

### `convex/folders.ts` and `convex/tags.ts`

Standard CRUD plus assignment mutations (`assignNoteToFolder`, `attachTagToNote`, etc.). Ownership is enforced via `assertFolderOwner` / `assertTagOwner` in `convex/model/ownership.ts`.

### `convex/users.ts`

| Function          | Args           | Effect                                              |
| ----------------- | -------------- | --------------------------------------------------- |
| `getUserInfo`     | `{}`           | Current user's row; throws `notFound` if missing    |
| `updateProfile`   | `{ name }`     | Patch `name`; requires `name.trim().length >= 2`    |
| `deleteAccount`   | `{}`           | Cascades: deletes notes, folders, tags, noteTags, then the user row |

### `convex/ai.ts`

```typescript
export const chat = action({
  args: {
    messages: v.array(messageValidator),        // 1–40 messages
    systemPrompt: v.optional(v.string()),       // up to 8k chars
  },
  handler: async (ctx, args) => { /* ... */ },
});
```

- **Runtime:** Node.js action (not V8) — required for the Gemini SDK.
- **Provider:** Google `@google/genai` calling model **`gemini-2.5-flash`** with `maxOutputTokens: 2048`, `temperature: 0.7`.
- **Message shape:** `{ role: "user" | "model", parts: [{ text } | { inlineData: { mimeType, data } }] }`.
- **Input caps:** 1–40 messages · text ≤ 20,000 chars per part · `inlineData` base64 ≤ 8 MB · system prompt ≤ 8,000 chars.
- **Test mode:** if `NODE_ENV !== "production"` and `AI_TEST_MODE === "true"`, returns `"[stub] reply"` without calling Gemini. Use this in Playwright and local dev when you don't want to burn API quota.
- **Errors:** throws `errors.aiNotConfigured()` if `GEMINI_API_KEY` is missing.

---

## Auth

`convex/auth.ts` wires `@convex-dev/auth` with a **Password provider only** — no OAuth, no social login (yet):

```typescript
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      reset: ConsoleOTP,
      profile(params) {
        return { name: params.name as string, email: params.email as string };
      },
    }),
  ],
});
```

- **Password reset** uses a custom `ConsoleOTP` provider: 6-digit code, 15-minute expiry. In non-production it logs to the console; in production it throws until you wire a real email provider (Resend is intended — see `AUTH_RESEND_KEY` in env vars).
- **JWT issuer** is set to `CONVEX_SITE_URL` in `convex/auth.config.ts`.
- **HTTP routes** live in `convex/http.ts` and are contributed entirely by `auth.addHttpRoutes(http)` — there are no custom HTTP endpoints.

The client side of auth is documented in `docs/ARCHITECTURE.md` under the `auth` module; the short version is that `AuthGuard`, `useAuthSession`, `useAuthActions`, and `useCurrentUser` are the only things UI code should touch.

---

## Cascade deletes

`convex/model/cascade.ts` centralizes the "delete cleanly" logic so no orphan rows survive:

- `cascadeDeleteNote(ctx, noteId)` — deletes the note plus every `noteTags` row that references it.
- `cascadeDeleteFolder(ctx, folderId)` — clears `folderId` from every note in that folder, then deletes the folder.
- `cascadeDeleteTag(ctx, tagId)` — deletes the tag and every `noteTags` link pointing at it.
- `cascadeDeleteUser(ctx, userId)` — deletes every note, folder, tag, and `noteTags` row owned by the user, then the user row itself. Called by `deleteAccount`.

Always use these helpers rather than deleting a parent row directly.

---

## Soft-delete lifecycle

Trash is a two-stage process:

1. **`deleteNote`** flips `isDeleted: true` and updates `updatedAt`. The note stops appearing in `listNotes` but shows up in `listDeletedNotes`.
2. **`purgeOldTrash`** — an `internalMutation` called from `convex/crons.ts`:

   ```typescript
   crons.daily(
     "purge stale trash",
     { hourUTC: 6, minuteUTC: 0 },
     internal.notes.purgeOldTrash,
   );
   ```

   Runs daily at 06:00 UTC. Uses the `by_deleted_and_updated` index to find notes with `isDeleted === true` and `updatedAt` older than 30 days, and hard-deletes up to 200 per run via `cascadeDeleteNote`.

Users can also hard-delete manually via `purgeNote` (single) or `bulkPurgeNotes` (up to 100 at a time).

---

## Environment variables

The four you need to run Convex locally:

| Variable                 | Where it's used                | What it's for                                                    |
| ------------------------ | ------------------------------ | ---------------------------------------------------------------- |
| `NEXT_PUBLIC_CONVEX_URL` | `src/shared/providers/convex-client-provider.tsx` | Frontend Convex deployment URL                    |
| `CONVEX_SITE_URL`        | `convex/auth.config.ts`        | JWT issuer domain                                                |
| `GEMINI_API_KEY`         | `convex/ai.ts`                 | Google Gemini API key for the AI chat action                     |
| `AUTH_RESEND_KEY`        | (reserved)                     | Resend key for password-reset emails once the provider is wired  |

Optional:

- `AI_TEST_MODE=true` (non-production only) — short-circuits `ai.chat` to return a stub reply.
- `NODE_ENV` — Convex checks this to gate the AI stub and the ConsoleOTP dev behavior.

---

## Contributor rules for Convex code

Copied from `convex/_generated/ai/guidelines.md` — the ones you'll hit most often:

1. **Always validate arguments.** Every function needs a validator: `v.string()`, `v.id("notes")`, `v.optional(...)`, etc.
2. **Use indexes, never `.filter()` on queries.** Define an index in `schema.ts` and query with `.withIndex("name", (q) => q.eq("field", value))`. `.filter()` on a query scans the table.
3. **Never accept `userId` as an argument.** Derive it server-side: `const userId = await requireUserId(ctx)`. Trusting a client-supplied user ID is an authorization bug.
4. **Guard every non-public function.** Public queries and mutations start with `requireUserId`. Ownership-scoped operations continue with `assertNoteOwner(ctx, id, userId)` (or the equivalent for folders/tags).
5. **Keep results bounded.** Use `.take(n)` or paginate. Don't `.collect()` unbounded tables — the model helpers already cap at 500.
6. **Actions ≠ queries/mutations.** Actions run in Node.js; queries and mutations run in Convex's V8 runtime. External SDKs (like `@google/genai`) belong in actions.

For the full list, read `convex/_generated/ai/guidelines.md`.

---

## Local dev

`pnpm dev` runs Next.js and Convex together. On first run, Convex will prompt you to log in and pick or create a deployment; that writes `CONVEX_DEPLOYMENT` into `.env.local` for you.

Handy Convex commands:

```bash
pnpm exec convex dev                          # start the dev sync loop only
pnpm exec convex dashboard                    # open the deployment dashboard
pnpm exec convex codegen --typecheck=disable  # regenerate _generated/ (used in CI)
pnpm exec convex deploy                       # production deploy (usually CI)
```

## Deploying

Production deploys run in `.github/workflows/convex.yml` on push to `main`:

```yaml
- run: pnpm exec convex deploy --cmd 'pnpm run build'
  env:
    CONVEX_DEPLOY_KEY: ${{ secrets.CONVEX_DEPLOY_KEY }}
```

Never `convex deploy` from your laptop against the prod deployment — let CI do it so the deploy stays reproducible.
