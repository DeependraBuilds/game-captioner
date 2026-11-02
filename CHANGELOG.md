# Changelog

## 2.0.0 — development candidate

- Removed the business-network platform across frontend, API, types, documentation and tests. TikTok is now supported end-to-end.
- Added a single typed, validated engine for five gaming channels, all genres and six tones.
- Added game/description/optional details, voiceover targets, CTA and carousel controls.
- Added per-platform captions, three hooks, restrained tags, voiceover and overlays.
- Added an editable, responsive dark workspace with original geometric GC logo, Pacific Blue and Blaze Orange.
- Added copy controls, full-post copy, CSV and TSV export with spreadsheet-formula escaping.
- Added individual section rewriting, shortening, natural/funny adjustments and removable CTAs.
- Added request validation, bounded request sizes, same-origin checks, rate limiting and no-store responses.
- Added opt-in server-side Gemini 2.5 Flash-Lite with 12-second timeout and fallback. Disabled unless configured by the site owner.
- Added regression tests for five platforms, genre variation, input rejection and character constraints.

### Known limitations

- Template mode provides usable but less fluent prose than AI mode. It is not a trained language model.
- A 10/20/30-second target is approximate and depends on the available details.
- In-memory API limits are per server instance only. They cannot guarantee a global usage or spending cap.
- Character limits are conservative and should be verified against each platform before publication.
- Text is generated from the creator's written description. It does not inspect video, verify external facts, or publish posts.
