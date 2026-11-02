# GameCaptioner 2.0

**Turn a gameplay moment into platform-ready words.** A free-first writing workspace for gaming creators. Built by Deependra Builds.

**Site:** https://game-captioner.vercel.app/

## What it does

Describe a gameplay moment in natural language. Choose one or all of YouTube Shorts, TikTok, Instagram, Facebook, and X. Get three title/hook choices, a caption, restrained hashtags, timed voiceover copy, on-screen text, an optional CTA and optional carousel. Edit each output, copy sections or export CSV/TSV for spreadsheets and n8n.

It supports any game genre. It does **not** edit video, detect highlights, post automatically, or scrape social networks. Content is a draft, not guaranteed ready without review.

## Start locally

Requires Node.js 22 or newer (Vercel project uses Node.js 24).

1. Clone the repository.
2. Run `npm ci` and `npm run dev`.
3. Open http://localhost:3000.

Run `npm run lint`, `npm run typecheck`, `npm test` and `npm run build` to validate changes.

## Input fields

| Field | Purpose |
| --- | --- |
| Game | Searchable catalog of 223 curated titles, with an unrestricted custom game input and aliases |
| Gameplay description | Main event, in your own words (required) |
| Notable moment | Optional extra detail |
| Audience | Optional context |
| Content type | Highlight, tutorial, montage, story, review, carousel |
| Tone | Hype, funny, competitive, tactical, casual, cinematic |
| Voiceover target | 10, 20 or 30 seconds |
| Platforms | One or several, or all five |

## Game search

The game selector opens a dropdown of popular picks, then searches 223 curated games from shooters, RPGs, sports/racing/fighting, strategy, survival/horror, indie/cozy and MMO/mobile. Common shortcuts like `R6`, `CS2`, `GTA 5`, `FC26` and `OSRS` work. Use arrow keys, Enter or touch/click to select. **Any title not listed can be typed directly**, so the catalog never restricts generation. The static list lives in `lib/game-catalog.ts` and can be updated without an API or subscription. It is a discovery list, not a live popularity ranking.

## Export fields

CSV and tab-separated exports include platform, game, three titles, caption, hashtags, voiceover, on-screen text, CTA and carousel. Files are UTF-8 and quoted. Spreadsheet-formula-looking cells are escaped for safe opening. Exports use the current editable draft, not stale generation responses.

## Optional Gemini integration

The application works in **Basic mode** without an API key. It now interprets common gameplay patterns (timing, doubles, clutch, racing, boss fights, building, farming and humor) and generates short angle-led copy instead of automatically repeating the full description. It is still a **rules-based fallback**, not a substitute for genuine language understanding. Novel or complex clips need creative AI drafting. The "Rewrite" buttons use the language model when enabled; otherwise they use basic rules. The server supports **optional** Gemini 3.5 Flash-Lite (current recommended default) for more flexible drafts. Google restricts access to Gemini 2.5 on newly active projects; legacy project owners can explicitly set `GEMINI_MODEL=gemini-2.5-flash-lite` if their project supports it. Both are subject to the Google account\u2019s eligibility and quotas.

Set these values **only** in server-side Vercel environment settings or a local `.env.local` (never commit a key):

```
GEMINI_ENABLED=true
GEMINI_API_KEY=<your-key>
```

If disabled, rate limited, unreachable or invalid, Basic mode remains available, with a safe explanation in the output studio. The request distinguishes model HTTP errors, malformed provider JSON, incompatible AI drafts, aborted requests and network errors. On Vercel it logs only a narrow phase, model ID, status or allowlisted network code, never the key, full description, generated text or client IP. For Gemini 3 the application requests low thinking to reduce latency for short-form copy. The public browser never receives the key. The app has best-effort per-instance limits (15 API calls/minute/IP, 3 AI requests/hour/IP, 30 AI requests/day/instance), request-size validation, a 12-second model timeout and no logs containing descriptions. **Vercel instances do not share those counters. They are not a global spending cap.** For public deployment, do not enable Gemini against a billable account without external provider-level quotas and billing safeguards. Free-tier availability, quotas and data-use terms depend on your Google account and may change. The hosted default is free template mode.

## Language and YouTube discovery descriptions

For English briefs, the Gemini prompt explicitly requests English writing. Unexpected East Asian script in AI-generated titles, descriptions, voiceovers and overlays is replaced field-by-field by the grounded fallback. Intentionally bilingual game names and briefs are not rejected.

YouTube receives its own **multi-paragraph video description**, rather than a TikTok-style one-line caption. AI descriptions must have at least three substantive paragraphs, at least 65 words, and explicitly identify the game. When the AI response is too short or uses unexpected script, that field falls back to a longer source-grounded three-paragraph version. Relevant game and gameplay terms appear naturally in the opening lines, with details and a clear takeaway. The system never fabricates map names or claimed outcomes just to fill space. Other social platforms retain their own more compact formats.

**Search optimization is not a ranking guarantee.** YouTube's own guidance prioritizes accurate, unique descriptions and relevant search terms. Hashtags are separate from the description and users can edit everything.

## Partial Gemini output and safer Basic fallback

A Gemini response can omit optional arrays or output an incomplete draft even when the returned JSON is valid. GameCaptioner now preserves useful generated titles, captions, voiceovers and overlays while filling absent fields from its local draft. For a single selected platform it also accepts a direct draft object without an extra platform wrapper, and it joins multiple non-thinking text parts before parsing. The application makes **one provider request** per generation attempt; it does not silently retry a rejected response. Invalid JSON, missing usable content and upstream failures still trigger Basic mode with a visible warning.

The Forza/last-corner fallback now covers more drift phrasing without truncating gameplay notes into broken fragments. Editorial filtering and user review remain necessary: a syntactically valid AI response does not establish factual accuracy.

## Writing tone and editorial guardrails

The selected writing tone now drives **all fields**: titles, SEO descriptions, social captions, voiceovers, overlays and optional calls to action. Six named tone profiles distinguish hype, funny, competitive, tactical, casual and cinematic writing, with clear instructions for what to avoid. Changing tone after generating drafts does not spend another AI request without permission; the UI prompts creators to generate again to apply the new tone.

The server provides Gemini with an explicit style contract, content-type purpose, and evidence reminder extracted from the gameplay notes. The final validator also rejects unwarranted absolutes, invented timer tactics, unsupported throttle/apex/racing-line specifics, race-finish claims and broad advice beyond the source. AI sentences that fail the grounded checks are omitted, and if the remaining YouTube copy lacks three substantive paragraphs the entire description falls back to a factual multi-paragraph draft. The same rule now detects unsupported racing momentum, control claims, track difficulty, and generalized 'reliable way to' advice, even when the AI expresses them using different verb forms. The game-specific evidence checks allow details that the creator actually supplied. Voiceover CTAs are rejected when they contradict the no-CTA VO rule. A bounded deterministic factual guard strips unsupported sentences or replaces unsafe sections: for example, named Rainbow Six Siege operators and maps, audio cues, floor destruction, team comms, ranked claims, unsupported multi-kill totals, and invented victories. It cannot detect every factual error in arbitrary games. Review remains essential.

Hashtags are curated from the selected game and recognizable mechanics in the source notes, favoring game identifiers and specific moment tags over generic #Gaming or #Gameplay. AI hashtags are replaced with this verified set, which users can freely edit in the workspace. For YouTube, titles retain the game suffix when shortened and descriptions preserve multi-paragraph structure.

## Editorial quality and testing

The creative prompt asks the model to act as a gaming editor instead of a description paraphraser. It emphasizes the angle and payoff, grounded facts, platform differentiation and natural spoken voiceovers. Automated tests include a long real-world-style multi-round C4 example and non-shooter genres. No API key is bundled; AI quality requires a configured server-side Gemini key. Without it, the app clearly labels the results **Basic mode**.

## Privacy and limits

- No authentication, database, tracking, automatic posting or upload of gameplay footage.
- Form data is sent to this app's API for generation. In Gemini mode the text is also transmitted to Google.
- Copy/export happens in the browser.
- Voiceover timing is approximate. Users must review factual accuracy, handle platform-specific requirements and check captions before publication.
- X uses a conservative 280-character count (real X weighted URL/emoji counting can differ).
- Templates are intentionally less creative than Gemini outputs and may need manual editing.

## Structure

- `lib/gamecaptioner.ts`: shared platforms, validation, template generation and result contracts
- `lib/youtube-titles.ts`: YouTube-specific searchable, curiosity and skill headline variants, with a strict 100-character maximum
- `lib/game-catalog.ts`: grouped catalog, aliases and ranked text matching
- `components/game-selector.tsx`: searchable game combobox with custom-title support
- `lib/server.ts`: request security, generation endpoint and optional model provider
- `app/api/generate`: selected platform(s)
- `app/api/generate-all`: all platforms
- `app/page.tsx`: editable workspace and exports
- `tests`: platform and regression tests

## Branch and release flow

Changes are developed on feature branches and tested on Vercel previews before merging to `main`. Only merged, reviewed changes deploy to production.

## Attribution

GameCaptioner is an independent tool by **Deependra Builds**. Logo is an original geometric GC mark. Dknight263 influences only the subtle blue-and-orange palette.
