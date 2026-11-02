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

The application works in **Basic mode** without an API key. It now interprets common gameplay patterns (timing, doubles, clutch, racing, boss fights, building, farming and humor) and generates short angle-led copy instead of automatically repeating the full description. It is still a **rules-based fallback**, not a substitute for genuine language understanding. Novel or complex clips need creative AI drafting. The "Rewrite" buttons use the language model when enabled; otherwise they use basic rules. The server supports **optional** Gemini 2.5 Flash-Lite for more flexible drafts.

Set these values **only** in server-side Vercel environment settings or a local `.env.local` (never commit a key):

```
GEMINI_ENABLED=true
GEMINI_API_KEY=<your-key>
```

If disabled, rate limited, unreachable or invalid, template mode remains available. The public browser never receives the key. The app has best-effort per-instance limits (15 API calls/minute/IP, 3 AI requests/hour/IP, 30 AI requests/day/instance), request-size validation, a 12-second model timeout and no logs containing descriptions. **Vercel instances do not share those counters. They are not a global spending cap.** For public deployment, do not enable Gemini against a billable account without external provider-level quotas and billing safeguards. Free-tier availability, quotas and data-use terms depend on your Google account and may change. The hosted default is free template mode.

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
