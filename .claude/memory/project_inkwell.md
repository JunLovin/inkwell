---
name: Project Inkwell Overview
description: What Inkwell is, why it exists, current state, and tech stack
type: project
---

Inkwell is a paywall-free, cloud-synced note-taking web app (Obsidian-style Markdown + Notion-style cloud) currently in MVP stage. Notes are stored in Convex, the UI is responsive for any device, and Lexical is the editor for performance/scalability. Free-tier AI is planned.

**Why:** Notion has a paywall for continued use; Obsidian requires payment for cloud sync. Inkwell solves both.

**Stack:** Next.js 16 (App Router) · Convex (BaaS + auth) · Tailwind CSS 4 · Lexical · GSAP · Zustand · @convex-dev/auth · Zod · Lucide Icons

**How to apply:** When suggesting features or architecture, prioritize zero-paywall constraints, responsive design, and scalability with Lexical/Convex.
