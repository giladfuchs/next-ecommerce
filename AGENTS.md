# Repository guidance

## Scope

- Work only in the main project rooted at this directory.
- Treat `other/` as out of scope. Do not search, read, compare, copy from, modify, or run code from it unless the user explicitly asks.
- Exclude `node_modules/`, `.next/`, `out/`, `build/`, `public/media/`, and `seed/data/images/` from routine searches and inspections.
- Preserve existing uncommitted work. Do not revert or reformat unrelated files.

## Project overview

- This is a pnpm monorepository-style application package using Next.js 16 App Router, React 19, Payload CMS 3, PostgreSQL, TypeScript, and Tailwind CSS 4.
- Use Node 24 and pnpm 10 or newer, as declared in `package.json`.
- `src/app/(app)/` contains the public storefront. `src/app/(payload)/` contains Payload Admin and API routes.
- Payload collection and global schemas live in `src/lib/collections/`; the central config is `src/payload.config.ts`.
- CMS block schemas live in `src/lib/blocks/`; their frontend renderers live in `src/components/blocks/`.
- The data-access implementation is selected in `src/lib/core/dal/index.ts`. Keep the public behavior of `queries.ts` and `api.ts` aligned when changing DAL methods.
- Seed fixtures are in `seed/data/mock-data-<locale>.json`; seed orchestration is in `seed/index.ts`.

## Working conventions

- Use TypeScript and the existing `@/*`, `@/payload-types`, and `@payload-config` aliases.
- Keep React components as Server Components by default. Add `"use client"` only when browser state, effects, event handlers, or client-only APIs require it.
- Reuse existing UI, link, rich-text, media, metadata, and layout helpers before creating a new abstraction.
- For CMS pages, update the Payload block schema, generated types, renderer, and seed fixture together when the requested behavior affects all of them.
- Payload relationships and uploads may be either an ID or a populated object. Handle both shapes or resolve the relation at the DAL boundary.
- Preserve draft/live-preview and cache-tag behavior when changing queries or routes.
- Keep user-facing strings compatible with the configured locale and RTL layout.
- Do not add or upgrade dependencies unless the task requires it; explain the reason when doing so.

## Generated files

- Do not manually edit `src/lib/core/types/payload-types.ts`. After Payload schema changes, run `pnpm generate:types`.
- Do not manually edit `src/app/(payload)/admin/importMap.js`. After adding or moving Admin components, run `pnpm generate:importmap`.
- Generated files may already be dirty. Regenerate only when relevant to the requested change.

## Commands and validation

- Do not start `pnpm dev` unless the user explicitly asks; a development server may already be running on port 3355.
- Do not automatically run checks after making changes. Let the user verify the work unless they explicitly ask Codex to run validation.
- This applies to ESLint, TypeScript checks, Prettier, tests, builds, browser checks, and similar verification commands.
- When the user asks for validation, use the narrowest relevant command: `pnpm typecheck`, `pnpm lint`, `pnpm exec prettier --check <changed-files>`, or `pnpm build`.
- Avoid `pnpm check` during focused work because it runs repository-wide auto-fixes and formatting.
- There is currently no automated test script.

## Data safety

- `pnpm seed` calls a fresh database migration before seeding, and `pnpm reset` also recreates the database. Never run either command without explicit user approval.
- Never delete uploaded media or change production-like external services unless the user explicitly requests it and the exact target has been verified.
- Do not expose values from `.env` or other secrets in logs, patches, or responses.
