import type { Brief, Tone } from "./gamecaptioner.ts";

export type Narrative = { hook: string; setup: string; payoff: string; overlay: string; extra?: string };

export const TONE_GUIDANCE: Record<Tone, { voice: string; titles: string; description: string; overlays: string; avoid: string }> = {
  hype: {
    voice:"Energetic, payoff-first and conversational. Make the actual overtake, clutch, or finish feel immediate. Keep spoken sentences short and never turn excitement into a lecture.",
    titles:"High-energy hook with a specific result. Enthusiasm must come from the verified event.",
    description:"Start with what happened, make the payoff feel immediate, and follow with the verified setup. Keep search terms natural. Do not turn one highlight into a coaching tutorial or a general driving strategy.",
    overlays:"Short impact beats; emphasize the decisive moment without false numbers.",
    avoid:"ALL CAPS paragraphs, generic insane/epic/crazy claims, fake stakes, forced exclamation marks, reliable-way-to advice, unverified driving mechanics and lecture-style takeaways.",
  },
  funny: {
    voice:"Dry, playful commentary with a grounded punchline. Joke about the situation, not invented events.",
    titles:"Curiosity and light irony; still searchable and fact-based.",
    description:"Describe the actual gameplay clearly. Use observational humor about the confirmed situation, not an invented sequence. Stay playful without switching to a tutorial tone.",
    overlays:"One concise playful line, not wall-to-wall memes.",
    avoid:"Invented failures, opponents' intentions, meme spam, unsupported punchlines.",
  },
  competitive: {
    voice:"Confident, direct, outcome-focused; explain the choice that gained an advantage.",
    titles:"Lead with the result, skill, or decision; no unearned boasting.",
    description:"Highlight meaningful execution and decisions in normal gaming vocabulary.",
    overlays:"Result and execution beats, not fictitious ranks or victories.",
    avoid:"Claiming ranked status, wins, championships, dominance, or perfect play not shown in notes.",
  },
  tactical: {
    voice:"Clear, specific game sense: setup, information, timing, execution. Speak like a knowledgeable teammate.",
    titles:"Name a real mechanic or decision and why it mattered.",
    description:"Ground the analysis only in supplied inputs, positions, abilities, sequence and payoff. Explain the real decision with plain words, not inferred vehicle physics or invented mechanics.",
    overlays:"Minimal actionable cues, a useful read or turning point.",
    avoid:"Speculative audio, comms, gadget synergy, angles, enemy intent, or positions not supplied.",
  },
  casual: {
    voice:"Relaxed, first-person, natural creator commentary with short sentences.",
    titles:"Clear and interesting without artificial suspense.",
    description:"Conversational, specific and easy to skim; include the facts rather than promotional filler.",
    overlays:"Simple direct observations.",
    avoid:"Corporate jargon, robotic announcements, exaggerated reactions.",
  },
  cinematic: {
    voice:"Measured pace, vivid but factual tension, short pauses and a strong payoff.",
    titles:"Suspense and payoff rooted in the actual moment.",
    description:"Set the scene with real details, keep the chronology clear, and finish on the actual consequence.",
    overlays:"Brief dramatic beats without invented danger or enemy reactions.",
    avoid:"Invented near-death stakes, unseen cinematic shots, unsupported explosions or twists.",
  },
};

export function toneNarrative(b: Brief, a: Narrative): Narrative {
  const event=(b.description+" "+b.notable).toLowerCase();
  const repeat=/\b(?:another round|second round|two rounds|different rounds|again|twice)\b/.test(event);
  const isDoubleC4=/\b(?:c4|nitro cell)\b/.test(event) && /\b(?:double|two kills|2 kills)\b/.test(event);
  if(isDoubleC4 && repeat) {
    if(b.tone==="hype") return {...a,hook:"Two C4 doubles. Different rounds. Both had to be timed right.",overlay:"TWO DOUBLE C4s"};
    if(b.tone==="funny") return {...a,hook:"One double C4 wasn't enough, apparently.",payoff:"Different round, same C4 idea. It worked again.",overlay:"AGAIN?"};
    if(b.tone==="competitive") return {...a,hook:"Two C4 doubles built on reads and timing.",payoff:"The kills came from anticipating the rappel, not guessing.",overlay:"READ THE RAPPEL"};
    if(b.tone==="tactical") return {...a,hook:"Two C4 doubles, one repeatable read.",payoff:"Read the position first. Detonate when the timing is right.",overlay:"POSITION → TIMING"};
    if(b.tone==="cinematic") return {...a,hook:"Two rounds. Two C4 doubles. One split-second choice each time.",overlay:"WAIT FOR THE WINDOW"};
  }
  const mark=(text:string)=>text.replace(/[.!?]+$/,"");
  if(b.tone==="hype") return {...a,hook:mark(a.hook)+"!",overlay:"THE PAYOFF"};
  if(b.tone==="funny") return {...a,hook:mark(a.hook)+". Well, that happened.",overlay:"WELL, THAT HAPPENED"};
  if(b.tone==="competitive") return {...a,hook:mark(a.hook)+". The decision made the difference.",overlay:"THE DECISION"};
  if(b.tone==="tactical") return {...a,hook:mark(a.hook)+". Here's the read.",overlay:"THE SETUP"};
  if(b.tone==="cinematic") return {...a,hook:mark(a.hook)+". Everything hinged on that moment.",overlay:"THE MOMENT"};
  return a;
}

export function toneTitle(title:string,b:Brief,index:number):string {
  if(b.tone==="casual" || index!==0) return title;
  const prefixes:Record<Exclude<Tone,"casual">,string>={
    hype:"The Payoff: ",funny:"So This Happened: ",competitive:"The Execution: ",
    tactical:"How ",cinematic:"The Decisive Moment: ",
  };
  const [body,game]=title.split(/\s+\|\s+(?=[^|]+$)/);
  if(!game)return title;
  const lead=b.tone==="tactical" && /^how\b/i.test(body) ? "Tactical: " : prefixes[b.tone];
  if(title.length+lead.length>100)return title;
  return lead+body+" | "+game;
}

export function toneVoice(b:Brief,a:Narrative):string[] {
  if(b.tone==="funny") return [a.hook,a.setup,a.extra||"",a.payoff];
  if(b.tone==="tactical") return [a.setup,a.extra||"",a.hook,a.payoff];
  if(b.tone==="competitive") return [a.hook,a.setup,a.payoff,a.extra||""];
  if(b.tone==="cinematic") return [a.setup,a.hook,a.extra||"",a.payoff];
  if(b.tone==="hype") return [a.hook,a.payoff,a.setup,a.extra||""];
  return [a.hook,a.setup,a.extra||"",a.payoff];
}
