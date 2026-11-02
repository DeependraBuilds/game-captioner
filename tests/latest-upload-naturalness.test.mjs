import test from "node:test";
import assert from "node:assert/strict";
import {parseBrief,createFallback,PLATFORMS} from "../lib/gamecaptioner.ts";
import {adequateYouTubeDescription} from "../lib/youtube-description.ts";

test("Hades Tactical from latest CSV uses natural sentence casing and factual dodge/escape",()=>{
 const b=parseBrief({game:"Hades",description:"I dodged the boss's last attack with barely any health and escaped the room on the next strike.",tone:"tactical"});
 const draft=createFallback(b,"youtube");
 assert.ok(adequateYouTubeDescription(draft.caption,b),draft.caption);
 assert.match(draft.caption,/In Hades, I had barely any health left when I dodged the boss attack\./);
 assert.match(draft.caption,/escaped/i);
 assert.doesNotMatch(draft.caption,/In Hades, With|The action was avoiding the attack|That's the sequence shown in this clip/i);
 assert.equal(draft.caption.split(/\n\s*\n/).length,2);
});

test("Hades Competitive source notes do not cause capitalization after a comma",()=>{
 const b=parseBrief({game:"Hades",description:"I dodged the boss attack at low health and survived.",tone:"competitive"});
 const draft=createFallback(b,"youtube");
 assert.doesNotMatch(draft.caption,/In Hades, With/);
 assert.match(draft.caption,/In Hades, I had barely any health left when I dodged/);
 assert.ok(adequateYouTubeDescription(draft.caption,b));
});

test("Final-corner drift and overtake from latest Forza CSV yield specific titles",()=>{
 const b=parseBrief({game:"Forza Horizon 5",description:"I entered the last corner in second place, held the drift through the turn, and passed the leader just before the finish.",tone:"hype"});
 const draft=createFallback(b,"youtube");
 assert.equal(draft.titles.length,3);
 assert.equal(new Set(draft.titles).size,3);
 assert.match(draft.titles[0],/Last-Corner Drift Overtake/);
 assert.doesNotMatch(draft.titles.join(" | " ),/The Payoff:|Why I Held the Drift|The Final Corner Made the Race/);
 assert.ok(draft.titles.every(t=>t.length<=100));
});

test("Varied pass and drift inflections still get grounded SEO titles",()=>{
 for(const description of [
  "I drifted the final corner and overtook the leader before the finish.",
  "I was drifting through the last corner and passed an opponent before the line.",
  "I held the drift at the final corner and got past the leader near the finish."
 ]){
  const draft=createFallback(parseBrief({game:"Forza Horizon 5",description}),"youtube");
  assert.match(draft.titles[0],/Overtake|Pass/);
  assert.doesNotMatch(draft.titles[0],/The Final Corner Made the Race/);
 }
});

test("Export-compatible five-platform draft behavior remains unchanged",()=>{
 const b=parseBrief({game:"Hades",description:"I dodged the boss attack at low health and escaped.",platforms:[...PLATFORMS]});
 for(const p of PLATFORMS) {
  const d=createFallback(b,p);
  assert.equal(d.titles.length,3,p);
  assert.ok(d.caption.length>20,p);
  assert.ok(d.voiceover.length>20,p);
 }
});
