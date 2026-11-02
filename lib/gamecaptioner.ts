import { writeBasicDraft } from "./editorial.ts";
import { adequateYouTubeDescription, hasUnexpectedEastAsianScript } from "./youtube-description.ts";
import { relevantHashtags } from "./hashtag-strategy.ts";
import { unsupportedClaims, groundedSentences } from "./grounding.ts";
import { racingCaptionIsGrounded } from "./racing-description.ts";
import { editorialWarnings, preserveGroundedParagraphs } from "./editorial-quality.ts";
import { voiceoverHasKeyAction } from "./moment-beats.ts";
import { missingCoreMoment } from "./moment-accuracy.ts";

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
export type GenerateResponse = { results: Partial<Record<Platform, Content>>; mode: "creative" | "offline"; captionSources?: Partial<Record<Platform,"ai"|"grounded">>; warning?: string };

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
export function captionWithoutDuplicateTags(caption:string,hashtags:string[]):string {
  const tags=hashtags.filter(tag=>/^#[A-Za-z0-9_]+$/.test(tag));
  if(!tags.length)return caption.trim();
  // Hashtag tokens have a safe restricted alphabet, so no regex escaping is required.
  const trailing=new RegExp("(?:\\s*(?:"+tags.join("|")+"))+\\s*$","i");
  return caption.trim().replace(trailing,"").trim();
}
export function publishText(content: Content): string {
  return [captionWithoutDuplicateTags(content.caption,content.hashtags), content.hashtags.join(" ")]
    .filter(Boolean).join("\n\n");
}
export function validContent(value: unknown, b: Brief, p: Platform): Content | null {
  if (!object(value)) return null;
  const backup=createFallback(b,p);
  // Model providers sometimes omit an unused optional property. Keep valid fields
  // and supply grounded defaults rather than rejecting the entire AI response.
  const rawTitles = Array.isArray(value.titles) && value.titles.length<=3
    ? value.titles.filter((x):x is string=>typeof x==="string" && x.trim().length>0 && x.length<=140)
    : [];
  const titles = [0,1,2].map(i=>rawTitles[i]||backup.titles[i]);
  const caption=typeof value.caption==="string" && value.caption.trim() && value.caption.length<=1800
    ? value.caption : backup.caption;
  const voiceover=typeof value.voiceover==="string" && value.voiceover.trim() && value.voiceover.length<=900
    ? value.voiceover : backup.voiceover;
  const cta=typeof value.cta==="string" && value.cta.length<=160 ? value.cta : backup.cta;
  const stringArray=(x:unknown,limit:number,maxLength:number):x is string[] =>
    Array.isArray(x) && x.length<=limit && x.every(y=>typeof y==="string" && y.length<=maxLength);
  const onscreen=stringArray(value.onscreen,5,80) && value.onscreen.length>0
    ? value.onscreen : backup.onscreen;
  const carousel=stringArray(value.carousel,7,180)?value.carousel:backup.carousel;
  // The AI must have contributed at least one meaningful content field.
  if(!rawTitles.length && caption===backup.caption && voiceover===backup.voiceover &&
      onscreen===backup.onscreen) return null;
  const cleanTags=hashtagsFor(b,p);
  const unsafeVoiceover=(text:string):boolean =>
    /\b(?:like and subscribe|subscribe to (?:my|the|this) channel|follow (?:for|me for) more|check out (?:my|the) channel)\b/i.test(text);
  const safeField=(value:string, fallback:string, kind:"general"|"voiceover"="general"):string =>
    hasUnexpectedEastAsianScript(value,b) || unsupportedClaims(value,b).length || editorialWarnings(value,b).length ||
      (kind==="voiceover" && unsafeVoiceover(value)) ? fallback : value.trim();
  const checkedTitles = titles.map((title,index) =>
    (/^The Read Behind (?:One|The|This)\b.*\b(?:Saved|Changed|Won)\b/i.test(title) ||
     /^(?:The detail that changed this play|What made this moment work)$/i.test(title))
      ? backup.titles[index] : safeField(title,backup.titles[index]));
  const withoutTags=captionWithoutDuplicateTags(caption,cleanTags);
  let cleanedCaption=hasUnexpectedEastAsianScript(withoutTags,b)?backup.caption:
    preserveGroundedParagraphs(groundedSentences(withoutTags,b),b);
  if(!cleanedCaption.trim())cleanedCaption=backup.caption;
  // Light de-jargon pass. Do not invent information or flatten the chosen tone.
  cleanedCaption=cleanedCaption.replace(/\butilizing\b/gi,"using")
    .replace(/\babsolute precision\b/gi,"careful timing")
    .replace(/\breliable pressure\b/gi,"pressure")
    .replace(/\bexecuting a precise\b/gi,"making a precise")
    .replace(/\bcapitalize on\b/gi,"use")
    .replace(/\bThis gameplay highlights\b/gi,"This clip shows");
  const checkedCaption = p === "youtube"
    ? (adequateYouTubeDescription(cleanedCaption,b) && racingCaptionIsGrounded(cleanedCaption,b) && !missingCoreMoment(cleanedCaption,b) ? cleanedCaption : backup.caption)
    : (cleanedCaption.trim() && !missingCoreMoment(cleanedCaption,b) ? cleanedCaption : backup.caption);
  const safeOverlays=onscreen.map((line,i)=>clip(safeField(line,backup.onscreen[i]||""),45));
  const groundedOverlays=voiceoverHasKeyAction(safeOverlays.join(" "),b)
    ? safeOverlays : backup.onscreen;
  const cleanCarousel=carousel.map((line,i)=>safeField(line,backup.carousel[i]||""));
  const carouselIdeas=cleanCarousel.map(line=>line.replace(/^[^:]{1,30}:\s*/,"").trim().toLowerCase());
  const distinctCarousel=carouselIdeas.filter(Boolean).length>=3 &&
    new Set(carouselIdeas.filter(Boolean)).size===carouselIdeas.filter(Boolean).length &&
    !missingCoreMoment(cleanCarousel.join(" "),b);
  const prepared: Content = {
    titles: checkedTitles.map(t => clip(t.trim(), p === "youtube" ? 100 : 110)),
    caption: checkedCaption,
    hashtags: cleanTags.length ? cleanTags : hashtagsFor(b, p),
    voiceover: voiceoverHasKeyAction(voiceover,b) ? safeField(voiceover,backup.voiceover,"voiceover") : backup.voiceover,
    onscreen:groundedOverlays,
    cta: b.includeCTA ? safeField(cta,backup.cta) : "",
    carousel: b.includeCarousel ? (distinctCarousel?cleanCarousel:backup.carousel) : [],
  };
  if (p === "twitter" && publishText(prepared).length > 280) {
    prepared.caption = clip(prepared.caption, 280 - prepared.hashtags.join(" ").length - 2);
  }
  return prepared;
}
