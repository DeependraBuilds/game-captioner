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
    second:/\b(?:in|from|started in|sitting in|entered in|coming from|coming into|entering)\s+(?:second|2nd)(?:\s+place|\s+position)?\b/.test(source),
    nearFinish:/\b(?:before|near|at|just ahead of|approaching|right by|prior to)\s+(?:the\s+)?(?:finish|line|checkered flag|chequered flag)\b/.test(source),
    won:/\b(?:won\s+(?:the\s+)?race|race\s+win|finished\s+first|took\s+(?:the\s+)?victory|claimed\s+(?:the\s+)?win)\b/.test(source),
  };
}
export function racingDescription(b:Brief):string|null{
  const f=racingFacts(b);
  if(!f.finalCorner || !f.drift)return null;
  const game=b.game;
  const target=/\bleader\b/i.test(b.description+" "+b.notable)?"the leader":"another car";
  const result=f.passed?(f.nearFinish?"passed "+target+" before the finish":"passed "+target):"held the drift through the turn";
  const start=f.second?"in second place":"approaching the last turn";
  const end=f.won?" I went on to win the race.":"";
  // The factual beats are fixed. Tone changes the telling, not the results or driving technique.
  const descriptions:Record<Brief["tone"],[string,string,string]>={
    hype:[
      "Final corner. "+(f.second?"Second place. ":"")+"In "+game+", I held the drift through the last turn and "+result+".",
      "The move happened right at the end of the race. I stayed with the drift through the corner"+(f.passed?" and came away with the overtake":" until the turn was behind me")+". That is the payoff of this clip.",
      "One corner, one decisive moment"+(f.passed?", and a late pass":"")+". This "+game+" highlight comes down to making that last turn count."+end,
    ],
    funny:[
      "Apparently the last corner in "+game+" still had something to say. I arrived "+(f.second?"in second place":"at the final turn")+", held the drift, and "+result+".",
      "The corner was doing its normal job of being a corner, and then "+(f.passed?"it became an overtake":"the drift became the whole highlight")+". Good timing for the final turn to get interesting.",
      "That is my kind of race ending: "+(f.passed?"a pass just before the line":"a drift through the last corner")+". The finish was close enough to make it worth clipping."+end,
    ],
    competitive:[
      "In "+game+", I entered the final corner "+start+", held the drift, and "+result+".",
      "The decisive part was the position change at the last turn. I committed to the drift and "+(f.passed?"completed the overtake near the finish":"carried the move through the corner")+".",
      "This is the key sequence in the highlight: a late corner, a committed drift"+(f.passed?", and a successful pass":"")+". The outcome is the move shown on screen."+end,
    ],
    tactical:[
      "In "+game+", I entered the final corner "+start+", held the drift, and "+result+".",
      "The overtake"+(f.passed?" came after I committed to the drift through the last turn":" opportunity was the held drift through the last turn")+". The timing of that commitment is what makes the corner the key moment.",
      "One late decision changed the position near the line. That is what makes this "+game+" racing highlight worth examining, beyond the drift itself."+end,
    ],
    casual:[
      "My "+game+" race came down to the last corner. I arrived "+(f.second?"in second place":"at the turn")+", held a drift through it, and "+result+".",
      "I kept the drift going through that final corner, and "+(f.passed?"the pass happened just before the finish":"that final turn became the highlight")+". It is exactly the kind of moment I like clipping.",
      "One late turn made the difference in this race. "+(f.passed?"Getting past "+target+" that close to the line was the best part.":"Holding that drift through the corner was the best part.")+end,
    ],
    cinematic:[
      "One corner left in "+game+". I came into the final turn "+start+", held a drift, and "+result+".",
      "The last turn was the setting for the entire move. The drift carried through the corner"+(f.passed?", and the pass followed before the finish":" as the finish approached")+".",
      "That final corner became the turning point of the clip. "+(f.passed?"The position changed just before the line.":"The drift was the moment that stayed with me.")+end,
    ],
  };
  return descriptions[b.tone].map(s=>s.trim()).join("\n\n");
}

export function racingCaptionIsGrounded(caption:string,b:Brief):boolean{
  const facts=racingFacts(b);
  if(!facts.finalCorner || !facts.drift)return true;
  if(!/\bdrift\w*\b/i.test(caption) || !caption.toLowerCase().includes(b.game.toLowerCase()))return false;
  if(facts.passed && !/\b(?:pass(?:ed|ing)?|overtak\w*|overtook|got past|slipped past|moved past|took the lead|went ahead)\b/i.test(caption))return false;
  if(!facts.passed && /\b(?:passed|overtook|overtake|got past|took the lead)\b/i.test(caption))return false;
  // A single highlight is not an instructional guarantee. Tutorials remain free
  // to contain genuine coaching, but must still pass grounded factual checks.
  if(b.contentType!=="tutorial" && /\b(?:use this approach|apply this (?:approach|technique)|try (?:this|the same) (?:technique|approach)|make (?:the|your) move stick|put pressure on|avoid overcorrecting|next time you race|take this lesson into)\b/i.test(caption))return false;
  return true;
}
