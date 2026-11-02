import type {Brief} from "./gamecaptioner.ts";
import {racingFacts} from "./racing-description.ts";

type Beats={voiceover:string;onscreen:string[];carousel:string[]};
const sourceOf=(b:Brief)=>b.description+" "+b.notable;

export function momentBeats(b:Brief):Beats|null {
  const source=sourceOf(b);
  if(/\bboss(?:es)?\b/i.test(source)){
    const dodge=/\b(?:dodg\w*|evad\w*|avoided)\b/i.test(source);
    const survived=/\b(?:escap\w*|surviv\w*|made it out|got out)\b/i.test(source);
    const finished=/\b(?:finished the fight|defeat\w*|beat the boss)\b/i.test(source);
    const low=/\b(?:1\s*hp|one\s*hp|low health|barely any health|almost no health|sliver of health)\b/i.test(source);
    if(!dodge&&!survived&&!finished)return null;
    const pressure=low?"I had barely any health left. ":"";
    const action=dodge?"I dodged the boss attack. ":finished?"I finished the fight. ":"I faced the boss. ";
    const payoff=survived?"I made it out.":finished?"I finished the fight.":"That dodge was the turning point.";
    const voice:Record<Brief["tone"],string>={
      hype:pressure+action+payoff+" That's the boss moment I wanted to keep.",
      funny:pressure+"The boss had a plan. "+action+payoff+" I'll take it.",
      competitive:pressure+action+payoff+" That response decided the exchange.",
      tactical:pressure+action+payoff+" The dodge changed the encounter.",
      casual:pressure+action+payoff+" I had to save that clip.",
      cinematic:pressure+"One attack. "+action+payoff+" The moment changed right there.",
    };
    const overlays=[
      low?"LOW HEALTH":"BOSS ENCOUNTER",
      dodge?"DODGED THE ATTACK":finished?"FINISHED THE FIGHT":"SURVIVED",
      survived?"MADE IT OUT":finished?"FIGHT COMPLETE":"THE DODGE",
    ];
    const carousel=[
      "Boss moment in "+b.game,
      low?"Barely any health left":"The boss encounter",
      dodge?"Dodged the boss attack":finished?"Finished the fight":"Got through the attack",
      survived?"Escaped the encounter":finished?"Finished the fight":"The dodge was the key moment",
    ];
    return {voiceover:voice[b.tone],onscreen:overlays,carousel:[...new Set(carousel)]};
  }
  const racing=racingFacts(b);
  if(racing.finalCorner && racing.drift){
    const second=racing.second?"Second place entering the last corner. ":"Final corner of the race. ";
    const move="I held the drift through the turn. ";
    const opponent=/\bleader\b/i.test(source)?"the leader":"the other car";
    const payoff=racing.passed
      ? racing.nearFinish?"I passed "+opponent+" before the finish.":"I passed "+opponent+"."
      : "That drift was the moment.";
    const voice:Record<Brief["tone"],string>={
      hype:second+move+payoff+" What a finish to the clip!",
      funny:second+move+payoff+" Better late than never.",
      competitive:second+move+payoff+" The pass came from the final-corner move.",
      tactical:second+move+payoff+" The position changed at the corner.",
      casual:second+move+payoff+" Had to save that one.",
      cinematic:second+move+payoff+" One turn changed the moment.",
    };
    const overlays=[racing.second?"SECOND PLACE":"FINAL CORNER","HELD THE DRIFT",racing.passed?"LAST-CORNER PASS":"FINAL TURN"];
    const carousel=["Final corner in "+b.game,racing.second?"Entered in second place":"Approached the final turn",
      "Held the drift through the corner",racing.passed?"Passed the leader near the finish":"The drift was the payoff"];
    return {voiceover:voice[b.tone],onscreen:overlays,carousel};
  }
  return null;
}

export function voiceoverHasKeyAction(text:string,b:Brief):boolean {
  const source=sourceOf(b);
  if(/\bboss\b/i.test(source)){
    if(/\b(?:dodg\w*|evad\w*|avoided)\b/i.test(source) &&
      !/\b(?:dodg\w*|evad\w*|avoid\w*)\b/i.test(text))return false;
    if(/\b(?:escap\w*|surviv\w*|made it out|got out)\b/i.test(source) &&
      !/\b(?:escap\w*|surviv\w*|made it out|got out)\b/i.test(text))return false;
  }
  const racing=racingFacts(b);
  if(racing.finalCorner&&racing.drift){
    if(!/\b(?:drift\w*|slid\w*|slide)\b/i.test(text))return false;
    if(racing.passed&&!/\b(?:pass\w*|overt\w*|got past|went past|moved ahead)\b/i.test(text))return false;
  }
  return true;
}
