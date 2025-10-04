This repository (cause-compass / EthicalBrand) scores companies against user preferences and exposes results via Next.js API routes.

Quick context (what matters most)
- Scoring lives in `src/lib/db/scoring.ts`. The single exported function `companyScore(prefs, facts)` returns a normalized score in [-1, +1].
- Prefs shape: `type Prefs = Record<string, number>` (tag key -> weight). Default guest prefs are in `defaultGuestPrefs`.
- Fact shape: `type Fact = { tagKey: string; stance: Stance; confidence: number }` where `Stance` comes from Prisma (`supports`, `opposes`, `alleged_violation`, `neutral`).
- Evidence mapping: `supports -> +1`, `opposes|alleged_violation -> -1`, `neutral -> 0` (see `stanceToEvidence`).
- Calculation: for each fact where the user's preference weight for that tag > 0, compute `evidence * confidence * weight`. The final score = `sum(weightedEvidence) / sum(weights)` (0 when no applicable weights).

Where this is used
- API routes: `src/app/api/companies/*` (search, search-*, [id]) call `companyScore` to compute results shown in the UI.
- Company detail page: `src/app/company/[id]/page.tsx` expects `score` and `breakdown` from the API.
- UI components: `src/components/CompanyCard.tsx`, `src/components/ScoreBar.tsx` visualize the `score` (range -1..1).

Important conventions and gotchas (do not change without checking UIs)
- We treat preference weights <= 0 as ignored. `companyScore` only accumulates facts where `prefs[fact.tagKey] > 0`.
- Confidence is treated multiplicatively with stance and weight; ensure imported `confidence` values are 0..1.
- The score is normalized by the sum of weights (not sum of confidences). If a company has facts for tags the user doesn't weight, they are ignored.
- Default guest prefs (`defaultGuestPrefs`) use 0.5 across tracked tags — changing these will affect all guest-mode results.

Common tasks and where to change them
- Add a new tracked cause/tag: update Prisma schema (`prisma/schema.prisma`), migration, and add the default weight to `defaultGuestPrefs` in `src/lib/db/scoring.ts`.
- Change scoring behavior: edit `companyScore` and `stanceToEvidence` in `src/lib/db/scoring.ts`. Update all uses (APIs) and add unit tests as needed.
- Preferences storage: user prefs stored on `appUser.prefsJson` (see `src/app/api/companies/search-basic/route.ts`) — update reading/writing there if you change the Prefs shape.

Dev workflows and helpful commands
- Local dev: `npm install` then `npm run dev` (Next.js dev server). The README has full setup (DB, Supabase, Gemini API keys).
- Run migrations and seed: `npm run db:migrate` and `npm run db:seed` (if present in package.json).
- Debug scoring quickly: use the search endpoints to see logs and example scores from the DB.

Examples (concrete snippets)
- Score computation (conceptual):
  - prefs: `{ lgbtq: 0.8, environmentally_friendly: 0.2 }`
  - facts: `[{ tagKey: 'lgbtq', stance: 'supports', confidence: 0.9 }, { tagKey: 'environmentally_friendly', stance: 'opposes', confidence: 0.6 }]`
  - per-fact: `+1 * 0.9 * 0.8 = 0.72`; `-1 * 0.6 * 0.2 = -0.12`; sum = 0.6; weightSum = 1.0; score = 0.6

If something here looks incorrect or you want the scoring tweaked (e.g., normalize by confidence as well), mention the desired behavior and I will update `src/lib/db/scoring.ts` and the calling APIs accordingly.

Files to check when changing scoring
- `src/lib/db/scoring.ts` (primary)
- `src/app/api/companies/search-basic/route.ts` and `src/app/api/companies/[id]/route.ts`
- `src/app/company/[id]/page.tsx` (consumes score/breakdown)
- `src/components/CompanyCard.tsx`, `src/components/ScoreBar.tsx`
- `prisma/schema.prisma` and `prisma/migrations/` when adding/removing tags

Keep changes minimal and add tests for behavior changes. When in doubt, use the search endpoints to log intermediate calculations for quick verification.
