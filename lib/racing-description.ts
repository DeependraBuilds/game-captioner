import type {Brief} from "./gamecaptioner.ts";

export type RacingFacts={
  drift:boolean;finalCorner:boolean;passed:boolean;second:boolean;nearFinish:boolean;won:boolean;
};
export function racingFacts(b:Brief):RacingFacts{
 const source=(b.description+" "+b.notable).toLowerCase();
 return {
  drift:/\b(?:drift\w*|slid|slide|sliding)\b/.test(source),
  finalCorner:/\b(?:last|final)\s+(?:corner|turn|bend)\b/.test(source),
  passed:/\b(?:pass(?:ed|ing|es)?\s+(?:the\s+)?(?:leader|car|rival|opponent|them|him|her)|got\s+(?:past|by|ahead of)\s+(?:the\s+)?(?:leader|car|rival|opponent|them|him|her)|went\s+past|slip(?:ped)?\s+past|overt(?:ake|ook|aking|aken)|took\s+the\s+lead|moved\s+(?:into|up to)\s+first)\b/.test(source),
  second:/\b(?:in|from|started in|sitting in|entered in|coming from)\s+(?:second|2nd)(?:\s+place|\s+position)?\b/.test(source),
  nearFinish:/\b(?:before|near|at|just ahead of|approaching|right by)\s+(?:the\s+)?(?:finish|line|checkered flag|chequered flag)\b/.test(source),
  won:/\b(?:won\s+(?:the\s+)?race|race\s+win|finished\s+first|took\s+(?:the\s+)?victory|claimed\s+(?:the\s+)?win)\b/.test(source),
 };
}
export function racingDescription(b:Brief):string|null{
 const f=racingFacts(b);
 if(!f.drift) return null;
 if(!f.finalCorner) return null;
 const game=b.game;
 const opponent=/\bleader\b/i.test(b.description+" "+b.notable)?"the leader":"the other car";
 const turn="final corner";
 const action=f.drift?"held a drift through the final corner":"made my move at the final corner";
 const outcome=f.passed
   ? f.nearFinish?"passed "+opponent+" before the finish":"got past "+opponent
   : "held the move through the corner";
 const second=f.second?" coming from second place":"";
 const victory=f.won?"The race ended in a win.":"";
 // Every sentence below refers to the observed action, its chronology, or its payoff.
 // No notes, evidence, or fact-checking language is permitted in publishable copy.
 const descriptions={
  hype:[
   "One final corner, one chance to change the order in "+game+". I "+action+" and "+outcome+".",
   "There was one corner left to make the move"+second+". I committed to the drift and "+(f.passed?"came out with the overtake":"made the corner the highlight")+".",
   "That is the moment I wanted from this "+game+" clip: a last-corner decision with an immediate payoff. "+victory,
  ],
  funny:[
   "The "+turn+" in "+game+" looked like a good time to make things interesting. I "+action+" and "+outcome+".",
   "Turns out the last corner is not just there for decoration. "+(f.passed?"The drift turned into a pass near the finish.":"The drift made a pretty good clip all by itself.")+" No extra drama required.",
   "One final corner and one decision"+second+". "+(f.passed?"Getting past "+opponent+" was the payoff.":"At least the corner gave me something to talk about.")+" "+victory,
  ],
  competitive:[
   "In "+game+", I "+action+" and "+outcome+". The decisive action happened at the final corner.",
   "The move happened at the end of the race"+second+". I stayed with the drift through the turn"+(f.passed?" and completed the pass":"")+".",
   "For this "+game+" highlight, the important result is the move through the corner. "+(f.passed?"The pass is the payoff. ":"The held drift is the payoff. ")+victory,
  ],
  tactical:[
   "In "+game+", the decisive move came at the "+turn+". I "+action+" and "+outcome+".",
   "I approached that turn"+second+" and committed to holding the drift"+(f.passed?" until the overtake was complete":" through the corner")+". The timing of that decision shaped what happened at the end.",
   "The important part of this "+game+" play is the sequence: final-corner entry, held drift"+(f.passed?", and a pass before the finish":", and the resulting corner exit")+". "+victory,
  ],
  casual:[
   "This "+game+" race clip is from the final corner, where I "+action+" and "+outcome+".",
   "I was"+(f.second?" in second place and":"")+" trying to make that last turn count. "+(f.passed?"Holding the drift gave me the pass I was looking for.":"I stayed with the drift through the corner.")+" It made for a fun finish to the clip.",
   "That last-corner move is what stood out to me in "+game+". "+(f.passed?"Getting past "+opponent+" just before the line felt good.":"The drift itself was enough of a moment.")+" "+victory,
  ],
  cinematic:[
   "One corner remained in "+game+". I "+action+" and "+outcome+".",
   "The last turn arrived"+second+". I held the drift through the turn"+(f.passed?", then moved past "+opponent:".")+" That short sequence became the defining moment.",
   "The "+turn+" gave this "+game+" race its payoff: "+(f.passed?"an overtake near the finish":"a committed drift through the turn")+". "+victory,
  ],
 } satisfies Record<Brief["tone"],[string,string,string]>;
 // Keep a grounded, natural three-paragraph description for every style.
 return descriptions[b.tone].join("\n\n");
}
