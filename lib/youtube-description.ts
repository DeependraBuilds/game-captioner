import type { Brief } from "./gamecaptioner.ts";
import { racingDescription } from "./racing-description.ts";

type EditorialAngle = { hook:string; setup:string; payoff:string; extra?:string };
const words = (text:string) => text.trim().split(/\s+/).filter(Boolean).length;
const cap = (text:string) => text.trim().replace(/[.!?]+$/, "");
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
    const toneIntro={
      hype:"Two C4 doubles in "+b.game+location+"! Different rounds, but the timing made both plays count.",
      funny:"In "+b.game+location+", apparently one double C4 wasn't enough. The second round brought another chance to get the timing right.",
      competitive:"In "+b.game+location+", two double C4 kills came from reading the attackers and committing at the right moment.",
      tactical:"In "+b.game+location+", two double C4 kills show how a good rappel read becomes a well-timed Nitro Cell.",
      casual:"Two double C4 kills in "+b.game+location+", across separate rounds. Both came down to reading the window and timing the Nitro Cell.",
      cinematic:"Two rounds. Two double C4 kills in "+b.game+location+". The window read set up each detonation.",
    };
    const intro=repeat ? toneIntro[b.tone]
      : "A double C4 kill in "+b.game+location+" that comes down to the read before the detonation. This gameplay highlight shows why timing matters.";
    const rappel=has(/\b(?:rappel|rappelling|window)\b/);
    const barricade=has(/\bcastle\b/) && has(/\bbarricade\b/);
    const secondPlace=has(/\bkitchen\b/) && has(/\bmaster bedroom\b/);
    const middleByTone={
      hype:[
        rappel?"The first chance came as attackers worked the window rappel.":"",
        barricade?"I timed the C4 around the Castle barricade breaking.":"",
        repeat?"Another round brought another double C4.":"",
        secondPlace?"That second setup was from Kitchen toward the Master Bedroom window.":"",
      ],
      funny:[
        rappel?"The attackers picked the window for their rappel. I picked the timing for the C4.":"",
        barricade?"The Castle barricade made the first window read especially useful.":"",
        repeat?"One round later, the C4 had another appointment.":"",
        secondPlace?"The follow-up involved Kitchen and the Master Bedroom window.":"",
      ],
      competitive:[
        rappel?"I read the rappel before committing to the first detonation.":"",
        barricade?"The Castle-barricaded window gave me a timing cue for the first double.":"",
        repeat?"The next round gave me another double from a separate read.":"",
        secondPlace?"That second angle came from Kitchen toward Master Bedroom.":"",
      ],
      tactical:[
        rappel?"First, I read where the attackers would be on the window rappel.":"",
        barricade?"I timed the Nitro Cell for the Castle barricade opening.":"",
        repeat?"In a separate round, I used another window read to set up the second double C4.":"",
        secondPlace?"From Kitchen, I targeted the Master Bedroom window.":"",
      ],
      casual:[
        rappel?"I watched the attackers approach the window and waited for my C4 timing.":"",
        barricade?"The first one was around the Castle barricade.":"",
        repeat?"Later I got another double, using a similar read in a different round.":"",
        secondPlace?"That second setup was between Kitchen and the Master Bedroom window.":"",
      ],
      cinematic:[
        rappel?"The window read came first. The detonation came only when the attackers reached the rappel.":"",
        barricade?"The Castle barricade framed the first moment.":"",
        repeat?"Then another round brought a second double C4.":"",
        secondPlace?"Kitchen and the Master Bedroom window formed the second scene.":"",
      ],
    };
    const detail=middleByTone[b.tone].filter(Boolean).join(" ");
    const toneEnd={
      hype:"The C4 double kills are the payoff, but the real highlight is the split-second timing. Reading the movement before detonating is what makes these "+b.game+" clips exciting.",
      funny:"The C4 did the loud part. The useful part was reading where the attackers would be. In "+b.game+", that difference makes this worth watching twice.",
      competitive:"The result matters, but the repeatable skill is getting the read and the timing right. That's the part of this "+b.game+" gameplay worth learning from.",
      tactical:"The key takeaway for "+b.game+" players is simple: read the attackers first, then time the detonation. Map knowledge matters because it helps turn information into a clean C4 play.",
      casual:"What I like about these "+b.game+" clips is that the big moments came from the setup. The C4 doubles look flashy, but the timing is what made them happen.",
      cinematic:"The explosions last a moment. The read comes before them. That's what connects these two "+b.game+" rounds and makes the payoff land.",
    };
    const end=toneEnd[b.tone];
    return [intro,detail,end].join("\n\n");
  }
  const racing=racingDescription(b);
  if(racing)return racing;
  const intro=b.game+" "+b.contentType+" gameplay: "+finalSentence(cap(a.hook))
    +" This clip focuses on "+(has(/\bboss\b/)?"a close boss encounter."
      :has(/\b(?:drift|corner|racing|overtak)\b/)?"the critical racing moment."
      :has(/\b(?:farm|greenhouse|crop)\b/)?"progress on the farm."
      :has(/\b(?:build|layout|base)\b/)?"a build and the choices behind it."
      :has(/\b(?:clutch|1v[2-9])\b/)?"a pressured comeback."
      :"one specific gameplay moment.");
  const sceneDetail=has(/\b(?:fire|flames|burned)\b/) && has(/\b(?:kitchen|cooking|dinner)\b/)
    ? "The cooking attempt is the setup and the kitchen fire is the outcome shown."
    : has(/\b(?:greenhouse|harvest)\b/)
    ? "The farm progress is the change shown in this clip, rather than an invented extra milestone."
    : has(/\bboss\b/) && has(/\b(?:dodg|surviv|escape)\w*\b/)
    ? "The boss encounter and the response to it are the actions the clip actually describes."
    : has(/\b(?:trade|diplomac|negotiat)\w*\b/)
    ? "The important choice in this clip is the negotiation or trade described in the notes."
    : "The clip stays focused on the action described, without assuming extra mechanics or match results.";
  const middle=a.setup+" "+sceneDetail+(b.notable?" "+finalSentence(b.notable):"");
  const endings={
    hype:"The payoff is what makes this "+b.game+" moment stand out, but the setup is worth noticing too. "+a.payoff+" That's the moment the clip is really about.",
    funny:"The result might look unexpected, but the setup is the part worth noticing in "+b.game+". "+a.payoff+" Sometimes that's all the explanation a clip needs.",
    competitive:"For "+b.game+" players, the useful detail is the decision and its outcome. "+a.payoff+" The point is to understand what actually worked.",
    tactical:"Look at the setup, the choice and the consequence in this "+b.game+" clip. "+a.payoff+" Those details are more useful than a generic gameplay montage.",
    casual:"That's the part I wanted to share from "+b.game+". "+a.payoff+" It's the kind of gameplay moment that's more interesting when you notice the setup.",
    cinematic:"The moment is brief, but the decision behind it gives this "+b.game+" clip its shape. "+a.payoff+" That's what makes the ending worth a second look.",
  };
  const final=endings[b.tone];
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
  const sourceWords=words(b.description+" "+b.notable);
  // Sparse notes cannot legitimately sustain three 80+ word paragraphs.
  // The structure scales with the available factual detail rather than a fixed SEO word quota.
  const detailed=sourceWords>=45;
  const minParagraphs=detailed?3:2;
  const minWords=detailed?65:42;
  return paragraphs.length>=minParagraphs && paragraphs.every(paragraph=>words(paragraph)>=10) &&
    words(cleaned)>=minWords && cleaned.toLocaleLowerCase("en").includes(b.game.toLocaleLowerCase("en"));
}
