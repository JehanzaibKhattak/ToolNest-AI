# ToolNest AI

Practical AI tools for work, study and content creation. Built by AGI Innovations.

ToolNest is a production-oriented Next.js SaaS starter containing a PDF assistant, resume analyzer, email writer, prompt improver and content repurposer, with Supabase authentication, atomic usage credits, generation history and OpenAI Responses API integration.

## Features

- Responsive marketing site, legal pages, light/dark themes and accessible focus states
- Five validated, structured AI workflows, including PDF summaries, question answering, key points, action items and study notes
- Authenticated PDF parsing with MIME, extension, size and extracted-text limits, plus OpenAI OCR fallback for scanned documents
- Email/password sign-up, login, logout, password recovery and server-protected dashboard
- 20-credit welcome balance and atomic reserve/refund SQL functions (PDF 3, resume 3, email 1, prompt 1, repurposing 2)
- RLS-protected profiles, generations, documents and usage events
- Searchable history, copy/delete actions and account/document views
- Safe server-only OpenAI client with timeout, retries and Zod output validation

## Screenshots

Add production screenshots to `docs/screenshots/` after deploying. The interface is intentionally typography- and dashboard-led and uses no stock imagery.

## Stack and architecture

Next.js 16 App Router, React 19, strict TypeScript, Tailwind CSS 4, shadcn-compatible owned UI patterns, Lucide, React Hook Form, Zod, Supabase, official OpenAI SDK, Vitest and Playwright. Server Components load private dashboard data. Client Components are limited to forms, themes and interactive history controls. Tool requests pass through authenticated route handlers, reserve credits atomically, call the Responses API, validate JSON, save history, then refund on failure.

The shared tool registry and schema maps keep every workflow consistent and make future document tools straightforward additions. PDF extraction runs in a dedicated authenticated Node.js route and source text is not saved in generation summaries.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Environment

- `NEXT_PUBLIC_APP_URL`: canonical application URL and auth redirect base
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL (browser-safe)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase publishable/anon key (browser-safe; RLS enforced)
- `SUPABASE_SERVICE_ROLE_KEY`: reserved for trusted server administration; never imported into client code
- `OPENAI_API_KEY`: private server-only key
- `OPENAI_MODEL`: Responses API model selected by the operator; intentionally not hardcoded

## Supabase setup

1. Create a Supabase project.
2. In the SQL editor, run `supabase/migrations/202608060001_initial.sql`, or link the CLI and run `supabase db push`.
3. In Authentication → URL Configuration, set the site URL and add `http://localhost:3000/auth/callback` plus `https://YOUR_DOMAIN/auth/callback` as redirects.
4. Add the project URL and anon key to `.env.local`. The migration creates profiles, RLS policies, a private document bucket and atomic credit functions.

## OpenAI setup

Create an API key, store it only as `OPENAI_API_KEY`, and set `OPENAI_MODEL` to a currently available model that supports the Responses API. Automated tests never call OpenAI.

## Quality commands

```bash
npm run lint
npm run typecheck
npm test
npx playwright install chromium
npm run test:e2e
npm run build
```

## Vercel deployment

Import the GitHub repository in Vercel, add every `.env.example` variable for Preview and Production, deploy, then add the deployment callback URL in Supabase. Run the migration before testing sign-up. Verify home, registration, callback, protected dashboard, all four tool calls, credit decrement/refund and history isolation. No deployment is performed by this repository.

## Security

Private keys remain server-only; routes revalidate users with Supabase Auth; all tool inputs and model output are validated; input sizes are capped; requests time out and retry; private content is excluded from logs and input summaries; output is rendered as text; RLS scopes data; credit updates are atomic; deletion is user-scoped and confirmed. Before high-volume production use, add distributed IP/user rate limiting, abuse monitoring, a durable idempotency key for generation requests, retention controls, malware scanning for uploaded files, CSP/security headers, and jurisdiction-specific privacy review.

## Current limitations and roadmap

Credentials and the migration are required for live auth/generation. Text-based PDFs use local extraction; scanned/image-only documents fall back to OpenAI document OCR and require a configured file-capable `OPENAI_MODEL`. OCR is limited to three attempts per authenticated user per minute in each server instance. Extracted text is capped at 50,000 characters and files at 10 MB. History is capped to the latest 50 records. Pricing is informational and has no checkout.

Roadmap: multi-document conversations, durable distributed OCR rate limits, streaming generation, editing/export formats, paid plans and team workspaces.

## Contributing and license

Read [CONTRIBUTING.md](CONTRIBUTING.md) and [AGENTS.md](AGENTS.md). Licensed under the MIT License; see [LICENSE](LICENSE).
