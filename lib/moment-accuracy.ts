import type {Brief} from "./gamecaptioner.ts";
import {racingFacts} from "./racing-description.ts";

const notes=(b:Brief)=>b.description+" "+b.notable;
const boss=(b:Brief)=>/\bboss(?:es)?\b/i.test(notes(b));
const dodge=(str:string)=>/\b(?:dodg\w*|evad\w*|avoid(?:ed|ing)?|rolled? away)\b/i.test(str);
const escaped=(str:string)=>/\b(?:escap\w*|surviv\w*|made it out|got out|got away)\b/i.test(str);
const overtake=(str:string)=>/\b(?:pass(?:ed|ing)?|overtak\w*|overtook|got past|went past|moved ahead|took the lead)\b/i.test(str);

export function missingCoreMoment(text:string,b:Brief):boolean {
  const source=notes(b);
  if(boss(b)){
    if(dodge(source) && !dodge(text))return true;
    if(escaped(source) && !escaped(text))return true;
  }
  const racing=racingFacts(b);
  if(racing.finalCorner && racing.drift){
    if(!/\b(?:drift\w*|slid|slide)\b/i.test(text))return true;
    if(racing.passed && !overtake(text))return true;
  }
  return false;
}

export function ungroundedMomentClaims(text:string,b:Brief):string[]{
  if(!boss(b))return [];
  const source=notes(b);
  const errors:string[]=[];
  // Low health is not necessarily 1 HP or exactly one hit from failure.
  const oneHitClaim=/\b(?:one hit away|1 hit away|one hit from|single hit away|one mistake away|one wrong move away|one (?:timing )?mistake (?:meant|would mean|from)|a single mistake (?:meant|would mean)|one hit left|at one hp|at 1 hp)\b/i;
  const oneHitEvidence=/\b(?:one hit|1 hit|1 hp|one hp|one mistake away|one wrong move away)\b/i;
  if(oneHitClaim.test(text) && !oneHitEvidence.test(source))errors.push("unverified exact-death stakes");
  if(/\b(?:start(?:ing)? over|restart(?:ing)? (?:the run|from scratch)|run (?:would )?(?:fail|end)|failing the run)\b/i.test(text) &&
    !/\b(?:start over|restart|run ended|run fail|failed the run|starting over)\b/i.test(source))
      errors.push("unverified run failure or restart");
  if(/\b(?:boss(?:'s)? final phase|boss(?:'s)? last phase|final attack phase|final boss phase|boss(?:'s)? final attack phase)\b/i.test(text) &&
    !/\bphase\b/i.test(source))errors.push("unverified boss phase");
  if(/\b(?:last.second dodge|split.second dodge|perfect(?:ly)? timed dodge|precision dodge|precise dodge)\b/i.test(text) &&
    !/\b(?:last.second|split.second|perfect|precis|exact timing)\w*/i.test(source))
      errors.push("unverified dodge precision");
  if(/\b(?:boss (?:push(?:ed|es)?|knock(?:ed|s)?|reduc(?:ed|es)?|left|brought) (?:me|you|the player|my character).{0,35}\b(?:health|hp)|boss(?:'s)? (?:attacks?|hits?) (?:reduc(?:ed|es)?|left|brought).{0,35}\b(?:health|hp))\b/i.test(text) &&
    !/\bboss\b.{0,45}\b(?:left|reduced|brought|pushed|knocked|hit).{0,35}\b(?:health|hp)\b/i.test(source))
      errors.push("unverified cause of low health");
  if(/\b(?:only way out|only chance to survive|only way to escape)\b/i.test(text) &&
    !/\bonly (?:way|chance)\b/i.test(source))errors.push("unverified exclusive strategy");
  return [...new Set(errors)];
}
