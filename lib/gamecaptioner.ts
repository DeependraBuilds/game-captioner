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
function textFact(text: string, limit: number): string {
  const first = text.split(/(?<=[.!?])\s+/)[0] || text;
  return clip(first.replace(/[.!?]+$/, ""), limit);
}
function normalizeSentence(text: string): string {
  const trimmed = text.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1).replace(/[.!?]*$/, ".") : "";
}
function hashtag(game: string): string {
  return game.replace(/[^a-zA-Z0-9]/g, "").slice(0, 40);
}
export function hashtagsFor(brief: Brief, platform: Platform): string[] {
  const game = hashtag(brief.game);
  const genreTags: Record<ContentType, string> = {
    highlight: "Gameplay", tutorial: "GamingTips", montage: "GamingMontage",
    story: "GamingStories", review: "GameReview", carousel: "GamingTips",
  };
  const tags = [game ? "#" + game : "", "#Gaming", "#" + genreTags[brief.contentType]];
  if (platform === "youtube") tags.push("#Shorts");
  if (platform === "tiktok") tags.push("#GamingTikTok");
  if (platform === "instagram") tags.push("#GamingReels");
  if (platform === "facebook") tags.push("#GamingReels");
  return [...new Set(tags.filter(Boolean))].slice(0, platform === "twitter" ? 2 : 4);
}
function hookSet(b: Brief): string[] {
  const fact = textFact(b.notable || b.description, 76);
  const variants: Record<Tone, [string, string, string]> = {
    hype: [b.game + ": " + fact, "That " + b.contentType + " got intense", "The moment everything changed in " + b.game],
    funny: ["I did not see this coming in " + b.game, "A very normal " + b.game + " moment (not)", fact + "…"],
    competitive: ["The play that decided it in " + b.game, "Reading the moment in " + b.game, fact],
    tactical: ["How this " + b.game + " play unfolded", fact, "What made this play work?"],
    casual: [fact, "This happened in " + b.game, "One " + b.game + " moment worth sharing"],
    cinematic: ["A moment from " + b.game, "It all came down to this", fact],
  };
  const order = variants[b.tone];
  return [0, 1, 2].map(i => clip(order[(i + b.variant) % 3], 95));
}
function voiceoverFor(b: Brief): string {
  const moment = normalizeSentence(textFact(b.description, 165));
  const detail = b.notable ? normalizeSentence(textFact(b.notable, 110)) : "";
  const openings: Record<Tone, string> = {
    hype: "This moment escalated fast.",
    funny: "So this was definitely not the plan.",
    competitive: "Here's how this played out.",
    tactical: "Watch what happens here.",
    casual: "Okay, here's what happened.",
    cinematic: "It started like any other run.",
  };
  const endings: Record<Tone, string> = {
    hype: "That ending was worth it.",
    funny: "I still can't believe that worked out.",
    competitive: "Every decision mattered.",
    tactical: "The small details made the difference.",
    casual: "That's why I had to share this.",
    cinematic: "And that's the moment I won't forget.",
  };
  const alternativeOpenings: Record<Tone, string> = {
    hype:"And then this happened.", funny:"I really should have seen this coming.",
    competitive:"Here's the key moment.", tactical:"Look closely at the setup.",
    casual:"So, here's the clip.", cinematic:"Then everything shifted.",
  };
  const alternativeEndings: Record<Tone, string> = {
    hype:"What a finish.", funny:"That was not how I expected it to go.",
    competitive:"The timing told the story.", tactical:"That is the part to notice.",
    casual:"I wanted to keep that moment.", cinematic:"Some moments stick with you.",
  };
  const base = [b.variant % 2 ? alternativeOpenings[b.tone] : openings[b.tone], moment, detail, b.variant % 2 ? alternativeEndings[b.tone] : endings[b.tone]].filter(Boolean);
  // Duration is a target, not an excuse to fabricate gameplay events.
  const wordLimit = Math.round(b.duration * 2.35);
  const selected: string[] = [];
  let words = 0;
  for (const sentence of base) {
    const count = sentence.split(/\s+/).length;
    if (words + count <= wordLimit + 3 || selected.length < 2) {
      selected.push(sentence); words += count;
    }
  }
  return clip(selected.join(" "), Math.max(115, wordLimit * 6.8));
}
function captionFor(b: Brief, platform: Platform, hooks: string[]): string {
  const moment = normalizeSentence(textFact(b.description, platform === "twitter" ? 148 : 290));
  const extra = b.notable ? normalizeSentence(textFact(b.notable, 190)) : "";
  const audience = b.audience ? "For " + b.audience + ": " : "";
  const customLead = b.variant % 2 === 0 ? hooks[0] : hooks[1];
  if (platform === "youtube") {
    return clip(customLead + ".\n\nWatch this " + b.game + " " + b.contentType + ": " + moment + (extra ? "\n" + extra : "") + (b.tone === "tactical" ? "\nHere is the decision worth watching closely." : ""), 1700);
  }
  if (platform === "tiktok") {
    return clip(customLead + ". " + moment + (extra ? " " + extra : ""), 360);
  }
  if (platform === "instagram") {
    return clip(customLead + ".\n\n" + moment + (extra ? "\n\n" + extra : "") + (b.tone === "funny" ? "\nI had to share this one." : ""), 1200);
  }
  if (platform === "facebook") {
    return clip(audience + moment + (extra ? "\n\n" + extra : "") + "\n\n" + (b.tone === "tactical" ? "The interesting part is how the moment developed." : "One of those gaming moments I wanted to share."), 1500);
  }
  const tagLength = hashtagsFor(b, platform).join(" ").length + 2;
  return clip((b.variant % 2 ? customLead + ". " : "") + moment + (extra ? " " + extra : ""), 280 - tagLength);
}
function ctaFor(b: Brief, p: Platform): string {
  if (!b.includeCTA) return "";
  const phrases: Record<Platform, string> = {
    youtube: "Subscribe for more " + b.game + " moments.",
    tiktok: "Follow for more clips from " + b.game + ".",
    instagram: "Follow for more " + b.game + " content.",
    facebook: "Follow the page for more gaming moments.",
    twitter: "Follow for more game clips.",
  };
  return b.variant % 2 ? "More " + b.game + " moments coming soon." : phrases[p];
}
export function createFallback(b: Brief, platform: Platform): Content {
  const titles = hookSet(b);
  const moment = textFact(b.description, 85);
  const onScreen = [clip(titles[0], 40), clip(b.notable ? textFact(b.notable, 43) : moment, 43), "The payoff"].filter(Boolean);
  const carousel = b.includeCarousel ? [
    clip(titles[0], 100),
    clip("The setup: " + textFact(b.description, 125), 145),
    b.notable ? clip("The moment: " + textFact(b.notable, 125), 145) : "Watch how the moment unfolds",
    "What would you do differently?",
  ] : [];
  return {
    titles,
    caption: captionFor(b, platform, titles),
    hashtags: hashtagsFor(b, platform),
    voiceover: voiceoverFor(b),
    onscreen: onScreen,
    cta: ctaFor(b, platform),
    carousel,
  };
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
  const cleanTags = hashtags.filter(s => /^#[A-Za-z0-9_]+$/.test(s)).slice(0, p === "twitter" ? 2 : 4);
  const prepared: Content = {
    titles: titles.map(t => clip(t.trim(), p === "youtube" ? 100 : 110)),
    caption: caption.trim(),
    hashtags: cleanTags.length ? cleanTags : hashtagsFor(b, p),
    voiceover: voiceover.trim(), onscreen: onscreen.map(s => clip(s.trim(), 45)),
    cta: b.includeCTA ? cta.trim() : "",
    carousel: b.includeCarousel ? carousel : [],
  };
  if (p === "twitter" && publishText(prepared).length > 280) {
    prepared.caption = clip(prepared.caption, 280 - prepared.hashtags.join(" ").length - 2);
  }
  return prepared;
}
