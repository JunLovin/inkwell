# Inkwell

> Open, paywall-free note-taking. Obsidian-grade Markdown power with Notion-grade cloud sync — and no plan gates in the way.

Inkwell is a modern web note-taking app built as a fully responsive, cloud-synced writing surface. Notes live in [Convex](https://convex.dev), the editor is [Lexical](https://lexical.dev), and the AI panel is Google Gemini — all free to use. A free-tier AI writing assistant is already wired in; more features are on the way.

---

## Features

- **Rich Markdown editor** powered by Lexical, with headings, lists, code blocks, quotes, links, horizontal rules, and a floating format toolbar.
- **Real-time cloud sync** via Convex — every save propagates to every open tab instantly.
- **Folders & tags** — organize however you like, with color-coded folders and a many-to-many tag system.
- **Favorites, pins, archive, and a soft-delete trash** with a 30-day auto-purge cron.
- **Full-text search** across all notes using a Convex search index.
- **AI chat panel** — attach a note as context, ask questions, or switch to **Writer mode** to have the assistant append markdown directly into your document. Backed by Google `gemini-2.5-flash`.
- **Password authentication** via `@convex-dev/auth`, with a password-reset flow.
- **Fully responsive** across mobile, tablet, and desktop.

---

## Tech stack

| Layer               | Choice                                                       |
| ------------------- | ------------------------------------------------------------ |
| Framework           | Next.js 16.2 (App Router), React 19.2 + React Compiler       |
| Backend & database  | Convex 1.34                                                  |
| Auth                | `@convex-dev/auth` (Password provider)                       |
| AI                  | Google Gemini (`gemini-2.5-flash`) via `@google/genai`        |
| Editor              | Lexical 0.43 (`@lexical/*`)                                  |
| Styling             | Tailwind CSS 4                                               |
| Client state        | Zustand 5                                                    |
| Forms & validation  | Zod 4 + react-hook-form                                      |
| Animation           | GSAP 3, Lenis smooth scroll                                  |
| Icons               | lucide-react                                                 |
| Testing             | Vitest 4 (+ `convex-test`), Playwright, Testing Library      |
| Package manager     | pnpm 10                                                      |

---

## Quick start

You need **Node 24+**, **pnpm 10+**, and a free [Convex account](https://convex.dev).

```bash
git clone <this-repo> inkwell
cd inkwell
pnpm install
cp .env.example .env.local     # then fill in the values
pnpm dev                       # starts Next.js + Convex dev sync
```

On first `pnpm dev`, the Convex CLI will prompt you to log in and create a dev deployment; it writes `CONVEX_DEPLOYMENT` into `.env.local` automatically. When it's done, open <http://localhost:3000>.

### Environment variables

Copy `.env.example` and fill in:

- `NEXT_PUBLIC_CONVEX_URL` — Convex deployment URL (CLI fills this)
- `CONVEX_SITE_URL` — Auth issuer domain (CLI fills this)
- `GEMINI_API_KEY` — Google Gemini key ([get one](https://aistudio.google.com)); optional if you set `AI_TEST_MODE=true` for local dev
- `AUTH_RESEND_KEY` — Reserved for Resend email reset (not wired yet)

---

## Project structure

Feature-modular hexagonal architecture. The short version:

```
inkwell/
├── app/          # Next.js App Router — thin route re-exports
├── convex/       # Backend: schema, functions, auth, crons
└── src/
    ├── core/     # AppError base + typed error subclasses
    ├── modules/  # notes · auth · ai-chat · folders · tags · settings
    ├── shared/   # Design system, layouts, providers, cross-cutting stores
    └── lib/      # lexical/ — single source of truth for the editor
```

See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for the full picture.

---

## Documentation

- [Architecture](./docs/ARCHITECTURE.md) — how the code is organized and why
- [Convex backend guide](./docs/CONVEX.md) — schema, functions, auth, AI action
- [Contributing](./docs/CONTRIBUTING.md) — setup, commands, code style, PR flow
- [Code of Conduct](./CODE_OF_CONDUCT.md) — Contributor Covenant v2.1

---

## Contributing

Contributions are welcome. Start with [`docs/CONTRIBUTING.md`](./docs/CONTRIBUTING.md), which covers local setup, the commands you'll actually run, the architectural rules to follow, and how to open a PR that lands cleanly.

For anything larger than a small fix, please open an issue or discussion first so we can align on approach.

---

## License

MIT — see [`LICENSE`](./LICENSE).
