import test from "node:test";
import assert from "node:assert/strict";
import {parseBrief,createFallback,validContent} from "../lib/gamecaptioner.ts";
import {racingFacts} from "../lib/racing-description.ts";
import {unsupportedClaims} from "../lib/grounding.ts";
const base="I entered the last corner in second place, held the drift through the final turn, and passed the leader before the finish line.";
const make=(tone,description=base)=>parseBrief({game:"Forza Horizon 5",description,tone,platforms:["youtube"]});
const tones=["hype","funny","competitive","tactical","casual","cinematic"];
test("all six racing-tone fallbacks tell the actual drift and overtake without speaking about notes",()=>{
 const captions=[];
 for(const tone of tones){
  const brief=make(tone);
  const caption=createFallback(brief,"youtube").caption;
  captions.push(caption);
  assert.equal(caption.split(/\n\s*\n/).length,2,tone);
  assert.match(caption,/Forza Horizon 5/,tone);
  assert.match(caption,/\bdrift\b/i,tone);
  assert.match(caption,/\b(?:pass(?:ed)?|overtake|overtook|got past|moved past)\b/i,tone);
  assert.doesNotMatch(caption,/\b(?:notes|evidence|description|brief|not assumed|was not specified|cannot assume)\b/i,tone);
  assert.doesNotMatch(caption,/\b(?:won the race|secured the win|finished first|race victory)\b/i,tone);
  assert.ok(caption.split(/\s+/).length>=42,tone);
 }
 assert.equal(new Set(captions).size,tones.length);
 assert.notEqual(captions[0].split(/\n\s*\n/)[1],captions[1].split(/\n\s*\n/)[1]);
});
test("recognizes common final-turn and overtake phrasing without inventing final position",()=>{
 for(const description of [
  "I held the drift through the final corner and overtook the leader before the finish line.",
  "I was in second, held a drift in the last turn, and slipped past the leader near the finish.",
  "I drifted at the final bend and got ahead of the leader close to the finish.",
 ]){
  const facts=racingFacts(make("tactical",description));
  assert.equal(facts.drift,true,description);
  assert.equal(facts.finalCorner,true,description);
  assert.equal(facts.passed,true,description);
  assert.match(createFallback(make("tactical",description),"youtube").caption,/pass|overtake|got past/i,description);
 }
});
test("unconfirmed overtake remains absent from the drift-only fallback",()=>{
 const b=make("tactical","I held a drift through the last corner in Forza Horizon 5 and finished the clip.");
 const facts=racingFacts(b);
 assert.equal(facts.passed,false);
 const caption=createFallback(b,"youtube").caption;
 assert.doesNotMatch(caption,/passed the leader|got past the leader|overtook/i);
 assert.doesNotMatch(caption,/notes|evidence|description|not assumed/i);
});
test("actual Hype sample with invented tracking and braking fails validation",()=>{
 const b=make("hype");
 const incoming="Pulling off a clean last-corner drift in Forza Horizon 5 is all about timing the turn just right when every inch on the track matters.\n\nBy committing to the slide through the final corner, the car maintains speed while tracking tightly around the opponent. That smooth line allows for a decisive pass right before crossing the finish line.\n\nClean execution in the braking zone makes all the difference when you need to make a move stick at the very end of a race.";
 const flags=unsupportedClaims(incoming,b);
 assert.ok(flags.includes("braking technique"),flags.join(","));
 assert.ok(flags.includes("opponent tracking"),flags.join(","));
 assert.ok(flags.includes("unsupported speed management"),flags.join(","));
 const content=validContent({...createFallback(b,"youtube"),caption:incoming},b,"youtube");
 assert.ok(content);
 assert.doesNotMatch(content.caption,/braking zone|tracking tightly|maintains speed/i);
 assert.match(content.caption,/Forza Horizon 5/);
});
test("actual Funny sample with wall scenery and momentum cannot pass unchanged",()=>{
 const b=make("funny");
 const incoming="Pulling off a clean drift right on the final corner of a Forza Horizon 5 race is usually just a good way to look cool into a wall. In this case, it worked out differently when catching the leader just before the finish from second place.\n\nHolding that slide kept enough momentum to slip past the leader in the dying seconds of the race without getting overly dramatic about it.\n\nSometimes taking the risky line pays off instead of resulting in a trip through the scenery. Keeping the drift controlled through the exit is usually the hard part, but nailing it right at the end makes for a solid finish.";
 const flags=unsupportedClaims(incoming,b);
 assert.ok(flags.includes("invented racing accident or scenery"),flags.join(","));
 assert.ok(flags.includes("invented racing risk"),flags.join(","));
 assert.ok(flags.includes("unsupported timing precision"),flags.join(","));
 const content=validContent({...createFallback(b,"youtube"),caption:incoming},b,"youtube");
 assert.ok(content);
 assert.doesNotMatch(content.caption,/wall|scenery|dying seconds|momentum|risky line/i);
 assert.match(content.caption,/\bdrift\b/i);
});
