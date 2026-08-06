# Agent guide

## Architecture

Routes live in `src/app`; reusable UI in `src/components`; business logic and integrations in `src/lib`; SQL migrations in `supabase/migrations`; automated checks in `tests`. Keep private data loading in Server Components or route handlers.

## Conventions

Use strict TypeScript without `any`. Keep components focused, validate system boundaries with Zod, render model output as text, and place tool prompts and schemas outside UI. Prefer Server Components unless browser interactivity is required.

## Commands

`npm run dev`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`, `npm run build`.

## Security and database rules

Never expose service-role or OpenAI keys. Never log submitted content. Preserve RLS on every user-owned table and scope queries to the authenticated user. Credit mutations must be atomic database functions; failed calls must refund. Migrations are append-only after release.

## Definition of done

Responsive and keyboard-accessible UI; loading, error, validation and empty states; boundary validation; relevant tests; lint, typecheck, tests and production build pass; environment and migration changes documented.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
