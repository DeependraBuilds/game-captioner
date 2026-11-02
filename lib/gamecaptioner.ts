import { writeBasicDraft } from "./editorial.ts";
import { adequateYouTubeDescription, hasUnexpectedEastAsianScript } from "./youtube-description.ts";
import { relevantHashtags } from "./hashtag-strategy.ts";
import { unsupportedClaims, groundedSentences } from "./grounding.ts";

export const PLATFORMS = ["youtube", "tiktok", "instagram", "facebook", "twitter"] as const;
export type Platform = (typeof PLATFORMS)[number];
export const PLATFORM_NAMES: Record<Platform, string> = {
  youtube: "YouTube Shorts", tiktok: "TikTok", instagram: "Instagram",
  facebook: "Facebook", twitter: "X (Twitter)",
};
export const TONES = ["hype", "funny", "competitive", "tactical", "casual", "cinematic"] as const;
export type Tone = (typeof TONES)[number];
export const CONTENT_TYPES = ["highlight", "tutorial", "montage", "story", "review", "carousel"] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];
export type Section = "titles" | "caption" | "hashtags" | "voiceover" | "onscreen" | "cta" | "carousel";
export type Adjustment = "regenerate" | "shorter" | "funnier" | "natural" | "remove-cta";
export type Brief = {
  game: string; description: string; notable: string; audience: string;
  tone: Tone; contentType: ContentType; duration: 10 | 20 | 30;
  platforms: Platform[]; includeCTA: boolean; includeCarousel: boolean;
  variant: number;
};
export type Content = {
  titles: string[]; caption: string; hashtags: string[];
  voiceover: string; onscreen: string[]; cta: string; carousel: string[];
};
export type GenerateResponse = { results: Partial<Record<Platform, Content>>; mode: "creative" | "offline"; warning?: string };

export class InputError extends Error {}

function object(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
function field(data: Record<string, unknown>, key: string, max: number, min = 0): string {
  const raw = data[key];
  if (raw === undefined || raw === null) return "";
  if (typeof raw !== "string") throw new InputError(key + " must be text");
  const value = raw.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
  if (value.length > max || value.length < min) throw new InputError(key + " must contain " + min + " to " + max + " characters");
  return value;
}
export function parseBrief(input: unknown, all = false): Brief {
  if (!object(input)) throw new InputError("Provide a JSON object");
  const game = field(input, "game", 80, 1);
  const description = field(input, "description", 1800, 12);
  const notable = field(input, "notable", 500);
  const audience = field(input, "audience", 120);
  const tone = input.tone ?? "casual";
  const contentType = input.contentType ?? "highlight";
  const duration = input.duration ?? 20;
  if (!TONES.includes(tone as Tone)) throw new InputError("Invalid tone");
  if (!CONTENT_TYPES.includes(contentType as ContentType)) throw new InputError("Invalid content type");
  if (duration !== 10 && duration !== 20 && duration !== 30) throw new InputError("Duration must be 10, 20 or 30 seconds");
  let platforms: Platform[];
  if (all) platforms = [...PLATFORMS];
  else {
    const wanted = input.platforms ?? (input.platform ? [input.platform] : ["youtube"]);
    if (!Array.isArray(wanted) || wanted.length === 0 || wanted.length > 5 || wanted.some(p => !PLATFORMS.includes(p as Platform))) {
      throw new InputError("Select one or more supported platforms");
    }
    platforms = [...new Set(wanted)] as Platform[];
  }
  const variant = input.variant === undefined ? 0 : input.variant;
  if (!Number.isInteger(variant) || (variant as number) < 0 || (variant as number) > 99) throw new InputError("Invalid variation");
  if (input.includeCTA !== undefined && typeof input.includeCTA !== "boolean") throw new InputError("includeCTA must be a boolean");
  if (input.includeCarousel !== undefined && typeof input.includeCarousel !== "boolean") throw new InputError("includeCarousel must be a boolean");
  return {
    game, description, notable, audience,
    tone: tone as Tone, contentType: contentType as ContentType, duration: duration as 10 | 20 | 30,
    platforms, includeCTA: input.includeCTA === true, includeCarousel: input.includeCarousel === true,
    variant: variant as number,
  };
}
export function clip(text: string, limit: number): string {
  if (text.length <= limit) return text;
  const slice = text.slice(0, limit - 1);
  const boundary = slice.lastIndexOf(" ");
  return (boundary > limit * 0.55 ? slice.slice(0, boundary) : slice).trimEnd().replace(/[,:;\-]+$/, "") + "…";
}
export function hashtagsFor(brief: Brief, platform: Platform): string[] {
  return relevantHashtags(brief,platform);
}
export function createFallback(b:Brief,p:Platform):Content {
  return writeBasicDraft(b,p,hashtagsFor(b,p));
}
export function publishText(content: Content): string {
  return [content.caption.trim(), content.hashtags.join(" ")].filter(Boolean).join("\n\n");
}
export function validContent(value: unknown, b: Brief, p: Platform): Content | null {
  if (!object(value)) return null;
  const titles = value.titles, hashtags = value.hashtags, onscreen = value.onscreen, carousel = value.carousel;
  const caption = value.caption, voiceover = value.voiceover, cta = value.cta;
  const stringArray = (arr: unknown, max: number, limit: number): arr is string[] =>
    Array.isArray(arr) && arr.length <= max && arr.every(s => typeof s === "string" && s.length <= limit);
  if (!stringArray(titles, 3, 140) || titles.length !== 3 || !stringArray(hashtags, 5, 60) ||
      !stringArray(onscreen, 5, 80) || !stringArray(carousel, 7, 180) ||
      typeof caption !== "string" || typeof voiceover !== "string" || typeof cta !== "string" ||
      caption.length > 1800 || voiceover.length > 900 || cta.length > 160) return null;
  // Hashtags are deliberately generated from source facts, not model guesses.
  // The editor remains free to adjust them after generation.
  void hashtags;
  const cleanTags = hashtagsFor(b,p);
  const backup = createFallback(b,p);
  const safeField=(value:string, fallback:string):string =>
    hasUnexpectedEastAsianScript(value,b) || unsupportedClaims(value,b).length ? fallback : value.trim();
  const checkedTitles = titles.map((title,index) => safeField(title,backup.titles[index]));
  let cleanedCaption=hasUnexpectedEastAsianScript(caption,b)?backup.caption:groundedSentences(caption,b);
  // Light de-jargon pass. Do not invent information or flatten the chosen tone.
  cleanedCaption=cleanedCaption.replace(/\butilizing\b/gi,"using")
    .replace(/\babsolute precision\b/gi,"careful timing")
    .replace(/\breliable pressure\b/gi,"pressure");
  const checkedCaption = p === "youtube"
    ? (adequateYouTubeDescription(cleanedCaption,b) ? cleanedCaption : backup.caption)
    : (cleanedCaption.trim() || backup.caption);
  const prepared: Content = {
    titles: checkedTitles.map(t => clip(t.trim(), p === "youtube" ? 100 : 110)),
    caption: checkedCaption,
    hashtags: cleanTags.length ? cleanTags : hashtagsFor(b, p),
    voiceover: safeField(voiceover,backup.voiceover),
    onscreen: onscreen.map((line,i) => clip(safeField(line,backup.onscreen[i]||""),45)),
    cta: b.includeCTA ? safeField(cta,backup.cta) : "",
    carousel: b.includeCarousel ? carousel.map((line,i) => safeField(line,backup.carousel[i]||"")) : [],
  };
  if (p === "twitter" && publishText(prepared).length > 280) {
    prepared.caption = clip(prepared.caption, 280 - prepared.hashtags.join(" ").length - 2);
  }
  return prepared;
}
