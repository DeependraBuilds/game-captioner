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
  const finish=f.nearFinish?"just before the finish":"near the end";
  const entering=f.second?"in second place":"at the final turn";
  const pass=f.passed?"passed "+target+" "+finish:"made the last turn count";
  const confirmedWin=f.won?" The race finished with a win.":"";
  // For a brief containing only a few facts, two purposeful paragraphs are
  // more informative than stretching the same result into three paragraphs.
  const pairs:Record<Brief["tone"],[string,string]>={
    hype:[
      "Final corner. "+(f.second?"Second place. ":"")+"In "+game+", I held the drift through the last turn and "+pass+". That's the moment this race clip builds toward.",
      "The turn came at the end, "+(f.passed?"but the pass changed the position right before the line.":"and the drift became the focus of the clip.")+" One committed move and an ending worth clipping."+confirmedWin,
    ],
    funny:[
      "The final corner in "+game+" apparently had one more job. I arrived "+entering+", held a drift, and "+pass+". Not a bad time for the turn to get interesting.",
      "A corner went from being just a corner to the whole highlight. "+(f.passed?"The leader was ahead going in, and the pass happened before the finish.":"The drift itself was the reason to keep the clip.")+" I'll take that ending."+confirmedWin,
    ],
    competitive:[
      "In "+game+", I entered the final corner "+entering+" and held the drift through the turn. I "+pass+". The decisive move came when the finish was already close.",
      "The important moment is "+(f.passed?"the late change in position":"the held drift through the turn")+". The corner entry set up the move, and the payoff came at the end of the clip."+confirmedWin,
    ],
    tactical:[
      "In "+game+", I entered the final corner "+entering+", held the drift through the turn, and "+pass+". The position changed at the last corner of the race.",
      "The timing of the commitment mattered because the turn came immediately before the finish. I stayed with the drift through the corner, "+(f.passed?"then completed the pass near the line":"making the corner itself the central moment")+". That sequence is the highlight."+confirmedWin,
    ],
    casual:[
      "This "+game+" race came down to the final corner. I arrived "+entering+", held a drift through the turn, and "+pass+". It was the part of the race I wanted to share.",
      "The finish was already close, so seeing "+(f.passed?"the position change before the line":"that drift carry through the turn")+" is what made this one stand out to me. That is the moment I wanted to keep."+confirmedWin,
    ],
    cinematic:[
      "One last corner in "+game+". I went in "+entering+", held the drift through the turn, and "+pass+". The finish was already in sight.",
      "The final turn "+(f.passed?"changed the position before the line":"held the focus of the clip")+". The race had one more moment to deliver, and that was the one the clip captured."+confirmedWin,
    ],
  };
  return pairs[b.tone].map(paragraph=>paragraph.trim()).join("\n\n");
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
