import type { Brief } from "./gamecaptioner.ts";

type EditorialAngle = { hook:string; setup:string; payoff:string; extra?:string };
const words = (text:string) => text.trim().split(/\s+/).filter(Boolean).length;
const cap = (text:string) => text.trim().replace(/[.!?]+$/, "");
function readableFact(text:string):string {
  return text
    .replace(/^(?:so |basically |okay,? )?(?:i (?:have|got|made|recorded) (?:some |the |these |a |my )?(?:clips?|videos?|footage) (?:where |showing |of )?|(?:this|the) (?:clip|video) (?:shows?|is about) )/i,"")
    .trim().replace(/^[,;.\s]+/,"");
}
function splitSentences(raw:string):string[] {
  return readableFact(raw).split(/(?<=[.!?])\s+/).map(s=>s.trim()).filter(Boolean);
}
const finalSentence = (s:string) => /[.!?]$/.test(s) ? s : s+".";
export function basicYouTubeDescription(b:Brief,a:EditorialAngle):string {
  const source=(b.description+" "+b.notable).toLowerCase();
  const has=(regex:RegExp)=>regex.test(source);
  const repeat=has(/\b(?:another round|different round|twice|second round|two rounds|again)\b/);
  const c4=has(/\b(?:c4|nitro cell)\b/) && has(/\b(?:double|two kills|2 kills)\b/);
  if(c4) {
    const map=b.description.match(/\bmap (?:which is|called|named)\s+([A-Z][A-Za-z0-9-]+)/)?.[1]
      || b.description.match(/\bon\s+(Chalet|Oregon|Clubhouse|Coastline|Kafe|Bank|Border)\b/i)?.[1];
    const location=map?" on "+map:"";
    const intro=repeat
      ? "Two double C4 kills in "+b.game+location+", across separate rounds. Both plays come down to reading attacker movement and getting the Nitro Cell timing right."
      : "A double C4 kill in "+b.game+location+" that comes down to the read before the detonation. This gameplay highlight shows why timing matters.";
    const detail=[
      has(/\b(?:rappel|rappelling|window)\b/) ? "I anticipate where the attackers are positioned as they rappel toward the window." : "I focus on the attacker movement before committing to the detonation.",
      has(/\bcastle\b/) && has(/\bbarricade\b/) ? "The first C4 is timed around the Castle barricade being opened." : "",
      repeat ? "A later round offers another opportunity to make the same kind of read and secure a second double." : "",
      has(/\bkitchen\b/) && has(/\bmaster bedroom\b/) ? "The second play connects Kitchen and the Master Bedroom window." : "",
    ].filter(Boolean).join(" ");
    const end="The takeaway from this "+b.game+" clip is the decision-making: positioning, reading the rappel"+(repeat?", and repeating the timing in a different round":"")+". The C4 kills are the payoff, but understanding where the attackers have to be is what makes the play work.";
    return [intro,detail,end].join("\n\n");
  }
  const intro=b.game+" "+b.contentType+" gameplay: "+finalSentence(cap(a.hook))
    +" This clip focuses on "+(has(/\bboss\b/)?"a close boss encounter."
      :has(/\b(?:drift|corner|racing|overtak)\b/)?"the critical racing moment."
      :has(/\b(?:farm|greenhouse|crop)\b/)?"progress on the farm."
      :has(/\b(?:build|layout|base)\b/)?"a build and the choices behind it."
      :has(/\b(?:clutch|1v[2-9])\b/)?"a pressured comeback."
      :"one specific gameplay moment.");
  const facts=splitSentences(b.description);
  const first=facts[0]||a.setup;
  const excerpt=first.split(/\s+/).slice(0,8).join(" ");
  const middle=finalSentence(excerpt)+" "+a.setup+(b.notable?" "+finalSentence(b.notable):"");
  const final="What makes this "+b.game+" moment worth sharing is the decision and the outcome. "+a.payoff
    +" The focus is on the gameplay itself, not unrelated highlights or invented details.";
  return [intro,middle,final].join("\n\n");
}
export function isEnglishBrief(b:Brief):boolean {
  const source=b.description+" "+b.notable+" "+b.audience+" "+b.game;
  // Preserve intentional non-English game titles and bilingual creator briefs.
  if(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(source)) return false;
  const alpha=source.match(/[A-Za-z]/g)?.length||0;
  return alpha>=10;
}
export function hasUnexpectedEastAsianScript(text:string,b:Brief):boolean {
  return isEnglishBrief(b) && /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(text);
}
export function adequateYouTubeDescription(text:string,b:Brief):boolean {
  const cleaned=text.trim();
  if(hasUnexpectedEastAsianScript(cleaned,b) || cleaned.length>1800) return false;
  const paragraphs=cleaned.split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean);
  // Length and structure are quality checks, never claims of guaranteed ranking.
  // Some clips are sparse: avoid padding with invented events to hit a word count.
  return paragraphs.length>=2 && words(cleaned)>=65 && cleaned.toLocaleLowerCase("en").includes(b.game.toLocaleLowerCase("en"));
}
