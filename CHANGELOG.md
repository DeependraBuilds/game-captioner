# Changelog

## 2.0.0 — development candidate

- Removed the business-network platform across frontend, API, types, documentation and tests. TikTok is now supported end-to-end.
- Added a single typed, validated engine for five gaming channels, all genres and six tones.
- Added game/description/optional details, voiceover targets, CTA and carousel controls.
- Replaced the plain game field with a searchable dropdown of 223 curated titles plus unrestricted custom entries, aliases and keyboard navigation.
- Added per-platform captions, three hooks, restrained tags, voiceover and overlays.
- Updated rule-based fallback to synthesize gameplay angles rather than echoing entire user descriptions, including multiple genres and a multi-round C4 example.
- Reworked Gemini prompt to create actual editorial copy and enabled AI-assisted individual-section refinement when configured. Basic mode now identifies its limitations in the UI.
- Added dedicated YouTube headline generation using three distinct angles, with genre-aware details, concise game identifiers and variation on rewrite.
- Updated the default Gemini model to 3.5 Flash-Lite, retained explicit allowlisted 2.5 compatibility, and added non-sensitive reasons when AI falls back.
- Added an editable, responsive dark workspace with original geometric GC logo, Pacific Blue and Blaze Orange.
- Added copy controls, full-post copy, CSV and TSV export with spreadsheet-formula escaping.
- Added individual section rewriting, shortening, natural/funny adjustments and removable CTAs.
- Added request validation, bounded request sizes, same-origin checks, rate limiting and no-store responses.
- Added opt-in server-side Gemini 2.5 Flash-Lite with 12-second timeout and fallback. Disabled unless configured by the site owner.
- Updated Next.js to 16.4.3 to address October 2026 critical security advisories.
- Added regression tests for five platforms, genre variation, input rejection and character constraints.

- Fixed AI fallback diagnostics so malformed model JSON is not incorrectly reported as a network failure; added safe diagnostic phases and low Gemini 3 thinking for faster generation.

- Added a dedicated multi-paragraph YouTube description with game-focused opening, clip detail, and takeaway, replacing one-line AI replies with a grounded longer fallback.
- Enforced English-language output for English-language briefs; replaces unexpected East Asian script at field level while preserving multilingual source material.

- Enforced six distinct writing-tone contracts across YouTube descriptions, captions, voiceovers, titles, overlays and optional CTA, including style guidance in the form and in the Gemini prompt.
- Added bounded evidence guardrails against invented audio cues, ranked play, map/operator names, floor destruction, results, and kill totals; filters unsupported clauses and falls back to grounded copy when needed.
- Replaced generic AI hashtags with game- and gameplay-specific verified hashtag sets across five platforms. YouTube shortening preserves searchable context and paragraph structure.

- Tightened editorial quality checks after real Hype, Funny and Forza examples: unsupported universal claims, invented timer tactics, apex/racing lines, throttle control, race positions and other tactical assertions now trigger validation.
- YouTube AI descriptions require three substantive paragraphs; otherwise the grounded format is used. Added a voiceover CTA check, extra anti-jargon guidance and source-specific regression tests for six failure scenarios.

- Added regression coverage for a real Forza Hype description that previously made unsupported momentum, control and track-difficulty claims. Expanded grounded validation of paraphrased driving-technique assertions and generalized guarantees, and refined Hype, Funny and Tactical voice profiles.
- Added copy-preview tests for all six tones to ensure non-empty captions and hashtags flow into the publish preview from the generated draft state.

- Reduced all-or-nothing Gemini failures by accepting valid partial drafts, optional missing metadata, multipart candidate text, and single-platform unwrapped JSON while retaining grounded defaults without additional provider calls.
- Corrected Basic racing fallback for varied drift and last-corner notes and stopped extracting arbitrary eight-word fragments ending in incomplete sentences.
- Added regression tests for incomplete but usable AI replies, multipart output, no-usable-data responses and fallback copy formatting.

### Known limitations

- Template mode provides usable but less fluent prose than AI mode. It is not a trained language model.
- A 10/20/30-second target is approximate and depends on the available details.
- In-memory API limits are per server instance only. They cannot guarantee a global usage or spending cap.
- Character limits are conservative and should be verified against each platform before publication.
- Text is generated from the creator's written description. It does not inspect video, verify external facts, or publish posts.
