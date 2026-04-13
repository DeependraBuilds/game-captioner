import { NextResponse } from "next/server";

type Payload = {
  game?: string;
  clipType?: string;
  keyMechanic?: string;
  winCondition?: string;
  tone?: string;
  format?: string;
};

function cleanInput(text: string) {
  const corrections: Record<string, string> = {
    battelfield: "Battlefield",
    batlefield: "Battlefield",
    rainbox: "Rainbow",
    sieze: "Siege",
    utilty: "utility",
    utitlity: "utility",
    positoning: "positioning",
    positionaling: "positioning",
    patince: "patience",
    aggresion: "aggression",
    cluch: "clutch",
    mechnics: "mechanics",
    gamepaly: "gameplay",
    tatical: "tactical",
    isolte: "isolate",
    enemys: "enemies",
  };

  let cleaned = text.trim().replace(/\s+/g, " ");

  for (const [wrong, right] of Object.entries(corrections)) {
    const regex = new RegExp(`\\b${wrong}\\b`, "gi");
    cleaned = cleaned.replace(regex, right);
  }

  return cleaned;
}

function normalizeHashtag(text: string) {
  return text.replace(/\s+/g, "").replace(/[^a-zA-Z0-9]/g, "");
}

function buildTitle(game: string, clipType: string, tone: string) {
  if (tone === "hype") return `${game} ${clipType} That Changed Everything`;
  if (tone === "educational") return `Why This ${game} ${clipType} Actually Worked`;
  if (tone === "competitive") return `${game} ${clipType} Built on Smart Execution`;
  return `${game} ${clipType} | Tactical Breakdown`;
}

function buildYouTubeCaption(
  game: string,
  clipType: string,
  keyMechanic: string,
  winCondition: string,
  tone: string
) {
  if (tone === "hype") {
    return `${clipType} in ${game} always looks insane at the end, but the real difference starts much earlier.

This play was not just aim.
It came from ${keyMechanic.toLowerCase()} and understanding how to ${winCondition.toLowerCase()}.

That is the side of gameplay I want to highlight more often. Smart setup. Clean execution. Real pressure.

If you enjoy gameplay that is more than random highlights, this one is for you.

#${normalizeHashtag(game)} #Gaming #FPS #Clutch #TacticalGameplay`;
  }

  if (tone === "educational") {
    return `This ${clipType.toLowerCase()} in ${game} shows why strong gameplay is never just mechanics.

The key factor here was ${keyMechanic.toLowerCase()}.
That setup created the opening to ${winCondition.toLowerCase()}.

A lot of people only focus on the final kill.
The real lesson is usually in everything that happened before it.

#${normalizeHashtag(game)} #Gaming #GameplayBreakdown #FPS #Strategy`;
  }

  return `${clipType} in ${game} is not just about the final moment.

The play works because of ${keyMechanic.toLowerCase()}.
That setup creates the chance to ${winCondition.toLowerCase()}.

This is the type of gameplay I like to focus on: smart decisions, proper setup, and calm execution under pressure.

#${normalizeHashtag(game)} #Gaming #TacticalGameplay #FPS`;
}

function buildInstagramCaption(
  game: string,
  clipType: string,
  keyMechanic: string,
  winCondition: string,
  tone: string
) {
  if (tone === "hype") {
    return `${clipType} in ${game} and the final moment was only half the story.

The real difference came from ${keyMechanic.toLowerCase()} and knowing when to ${winCondition.toLowerCase()}.

That is what makes a clip hit harder.
Not just the finish. The setup too.

Follow for more smart gameplay and real pressure moments.

#gaming #fps #${normalizeHashtag(game).toLowerCase()} #clutch #gamereels`;
  }

  if (tone === "educational") {
    return `${clipType} in ${game} is never just about mechanics.

This one worked because of ${keyMechanic.toLowerCase()} and the patience to ${winCondition.toLowerCase()}.

If the clip teaches something, it is always better than a clip that only looks cool.

Follow for more gameplay with actual value.

#gaming #fps #${normalizeHashtag(game).toLowerCase()} #educationalgaming #gamer`;
  }

  return `${clipType} in ${game} hits differently when the setup is just as strong as the finish.

This play came down to ${keyMechanic.toLowerCase()} and choosing the right moment to ${winCondition.toLowerCase()}.

Not just gun skill. Smart gameplay.

Follow for more tactical content.

#gaming #fps #${normalizeHashtag(game).toLowerCase()} #tacticalgameplay #gamer`;
}

function buildFacebookCaption(
  game: string,
  clipType: string,
  keyMechanic: string,
  winCondition: string,
  tone: string
) {
  if (tone === "hype") {
    return `This ${clipType.toLowerCase()} in ${game} got intense fast.

Most people will only notice the ending, but the real reason the play worked was ${keyMechanic.toLowerCase()} and knowing exactly when to ${winCondition.toLowerCase()}.

That is the kind of gameplay I enjoy most. Not just flashy moments, but plays that are built properly from the start.

If you like tactical gameplay with real pressure, this one is for you.`;
  }

  if (tone === "educational") {
    return `This ${clipType.toLowerCase()} in ${game} is a good example of why strong gameplay is not only about mechanics.

The key part was ${keyMechanic.toLowerCase()}.
That setup made it possible to ${winCondition.toLowerCase()}.

A lot of strong clips become more interesting when you understand why they worked, not just what happened at the end.`;
  }

  return `This ${clipType.toLowerCase()} in ${game} was built on ${keyMechanic.toLowerCase()} and the ability to ${winCondition.toLowerCase()}.

That is what I want my content to focus on more: gameplay with thought behind it, not just random action.

If you enjoy tactical plays, pressure moments, and smart execution, this is the kind of content I am building.`;
}

function buildTwitterCaption(
  game: string,
  clipType: string,
  keyMechanic: string,
  winCondition: string,
  tone: string
) {
  if (tone === "hype") {
    return `${clipType} in ${game} was not just chaos.

It came from ${keyMechanic.toLowerCase()} and knowing exactly when to ${winCondition.toLowerCase()}.

The final moment gets the attention.
The setup won the play.`;
  }

  if (tone === "educational") {
    return `${clipType} in ${game} worked because of ${keyMechanic.toLowerCase()}.

That setup created the chance to ${winCondition.toLowerCase()}.

Good clips are fun.
Great clips teach you something.`;
  }

  return `${clipType} in ${game} was built on ${keyMechanic.toLowerCase()} and the discipline to ${winCondition.toLowerCase()}.

Smart gameplay always looks cleaner than random aggression.`;
}

function buildLinkedInCaption(
  game: string,
  clipType: string,
  keyMechanic: string,
  winCondition: string
) {
  return `One thing ${game} keeps reinforcing for me is this: performance is rarely about isolated skill alone.

Even a strong ${clipType.toLowerCase()} often depends on ${keyMechanic.toLowerCase()} and the discipline to ${winCondition.toLowerCase()}.

The same principle applies beyond gaming.
Strong execution usually comes from preparation, awareness, and timing rather than reaction alone.`;
}

function buildCaption(
  game: string,
  clipType: string,
  keyMechanic: string,
  winCondition: string,
  platform: string,
  tone: string
) {
  if (platform === "youtube") return buildYouTubeCaption(game, clipType, keyMechanic, winCondition, tone);
  if (platform === "instagram") return buildInstagramCaption(game, clipType, keyMechanic, winCondition, tone);
  if (platform === "facebook") return buildFacebookCaption(game, clipType, keyMechanic, winCondition, tone);
  if (platform === "twitter") return buildTwitterCaption(game, clipType, keyMechanic, winCondition, tone);
  if (platform === "linkedin") return buildLinkedInCaption(game, clipType, keyMechanic, winCondition);
  return `${clipType} in ${game} was built on ${keyMechanic.toLowerCase()} and the ability to ${winCondition.toLowerCase()}.`;
}

function buildVoiceover(
  game: string,
  clipType: string,
  keyMechanic: string,
  winCondition: string,
  tone: string
) {
  if (tone === "hype") {
    return `This ${clipType.toLowerCase()} in ${game} was not luck. The whole play came from ${keyMechanic.toLowerCase()}, staying composed, and knowing exactly when to ${winCondition.toLowerCase()}.`;
  }

  if (tone === "educational") {
    return `This ${clipType.toLowerCase()} in ${game} works because the setup matters just as much as the finish. ${keyMechanic} created the advantage, and that made it possible to ${winCondition.toLowerCase()}.`;
  }

  if (tone === "competitive") {
    return `In ${game}, a strong ${clipType.toLowerCase()} is built on discipline. This play came from ${keyMechanic.toLowerCase()} and the ability to ${winCondition.toLowerCase()} under pressure.`;
  }

  return `This ${clipType.toLowerCase()} in ${game} was not just mechanics. It came down to ${keyMechanic.toLowerCase()} and making the right play at the right time to ${winCondition.toLowerCase()}.`;
}

function buildCTA(platform: string, game: string, tone: string) {
  if (platform === "youtube") return `Subscribe for more ${tone} ${game} gameplay and breakdowns.`;
  if (platform === "instagram") return `Follow for more ${game} clips, tactics, and smart gameplay.`;
  if (platform === "facebook") return `Follow the page for more pressure plays and tactical gaming content.`;
  if (platform === "twitter") return `Follow for more smart gameplay and clutch moments.`;
  if (platform === "linkedin") return `Follow for more insights on performance, strategy, and transferable lessons from gaming.`;
  return `Follow for more ${game} content.`;
}

function buildCarousel(
  game: string,
  clipType: string,
  keyMechanic: string,
  winCondition: string
) {
  return [
    `${game} ${clipType}: more than just the finish`,
    `Most viewers only notice the final moment`,
    `${keyMechanic} is what created the opening`,
    `That setup made it possible to ${winCondition.toLowerCase()}`,
    `Smart gameplay always has a reason behind it`,
  ];
}

function buildOutput(
  game: string,
  clipType: string,
  keyMechanic: string,
  winCondition: string,
  platform: string,
  tone: string,
  format: string
) {
  return {
    title: `${buildTitle(game, clipType, tone)} (${format})`,
    caption: buildCaption(game, clipType, keyMechanic, winCondition, platform, tone),
    voiceover: buildVoiceover(game, clipType, keyMechanic, winCondition, tone),
    cta: buildCTA(platform, game, tone),
    carousel: buildCarousel(game, clipType, keyMechanic, winCondition),
  };
}

export async function POST(req: Request) {
  const body: Payload = await req.json();

  const game = cleanInput(body.game || "Battlefield 6");
  const clipType = cleanInput(body.clipType || "Clutch");
  const keyMechanic = cleanInput(body.keyMechanic || "game sense and positioning");
  const winCondition = cleanInput(body.winCondition || "turn pressure into a winning play");
  const tone = cleanInput(body.tone || "tactical").toLowerCase();
  const format = cleanInput(body.format || "reel").toLowerCase();

  return NextResponse.json({
    youtube: buildOutput(game, clipType, keyMechanic, winCondition, "youtube", tone, format),
    instagram: buildOutput(game, clipType, keyMechanic, winCondition, "instagram", tone, format),
    facebook: buildOutput(game, clipType, keyMechanic, winCondition, "facebook", tone, format),
    twitter: buildOutput(game, clipType, keyMechanic, winCondition, "twitter", tone, format),
    linkedin: buildOutput(game, clipType, keyMechanic, winCondition, "linkedin", tone, format),
  });
}