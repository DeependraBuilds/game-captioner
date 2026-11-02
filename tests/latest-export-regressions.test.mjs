import test from "node:test";
import assert from "node:assert/strict";
import {parseBrief,createFallback,validContent,PLATFORMS} from "../lib/gamecaptioner.ts";
import {missingCoreMoment,ungroundedMomentClaims} from "../lib/moment-accuracy.ts";

const hades=parseBrief({
 game:"Hades",
 description:"I dodged the boss's last attack with barely any health and escaped the room on the next strike.",
 tone:"competitive",platforms:[...PLATFORMS],includeCTA:true,includeCarousel:true
});
const forza=parseBrief({
 game:"Forza Horizon 5",
 description:"I entered the last corner in second, held the drift and overtook the leader right before the finish.",
 tone:"hype",platforms:[...PLATFORMS],includeCTA:true,includeCarousel:true
});

test("uploaded Hades voiceover cannot upgrade low health into exactly one hit from failure",()=>{
 const content=createFallback(hades,"youtube");
 const raw="One hit away from failing the run. I timed the dodge against the boss's final attack. Escaped the room on the very next strike.";
 assert.ok(ungroundedMomentClaims(raw,hades).includes("unverified exact-death stakes"));
 const safe=validContent({...content,voiceover:raw},hades,"youtube");
 assert.ok(safe);
 assert.doesNotMatch(safe.voiceover,/one hit away|failing the run/i);
 assert.match(safe.voiceover,/dodg/i);
 assert.match(safe.voiceover,/made it out/i);
});

test("Hades source does not justify final boss phase, restarts or precision overlays",()=>{
 const content=createFallback(hades,"tiktok");
 const raw={
  ...content,
  caption:"Dodging the boss's last attack with barely any health in Hades. One timing mistake meant starting over, but the escape came on the next strike.",
  onscreen:["Minimal health","Last-second dodge","Room escape"],
  carousel:["Boss reached the final attack phase at minimal health","Executed a precise dodge","Successfully escaped the room on the next strike"],
 };
 assert.ok(ungroundedMomentClaims(raw.carousel[0],hades).includes("unverified boss phase"));
 const safe=validContent(raw,hades,"tiktok");
 assert.ok(safe);
 assert.match(safe.caption,/dodg/i);
 assert.match(safe.caption,/escap|made it out/i);
 assert.doesNotMatch(safe.caption,/starting over|one timing mistake/i);
 assert.doesNotMatch(safe.onscreen.join(" "),/last.second dodge/i);
 assert.doesNotMatch(safe.carousel.join(" "),/final attack phase|precise dodge/i);
});
test("Hades source supports explicit one-hit and precision facts when truly provided",()=>{
 const b=parseBrief({game:"Hades",description:"I was one hit away from death and performed a last-second dodge against the boss before escaping."});
 assert.deepEqual(ungroundedMomentClaims("One hit away. Last-second dodge before I escaped the boss.",b),[]);
});

test("Forza Instagram highlight retains the drift AND the confirmed last-corner overtake",()=>{
 const item=createFallback(forza,"instagram");
 assert.match(item.caption,/drift/i);
 assert.match(item.caption,/pass/i);
 assert.match(item.caption,/Forza Horizon 5/);
 const truncated="The race came down to the final stretch!\n\nHolding the drift through the corner made the difference.\nThe finish made every second count.\n\nForza Horizon 5.";
 assert.equal(missingCoreMoment(truncated,forza),true);
 const validated=validContent({...item,caption:truncated},forza,"instagram");
 assert.ok(validated);
 assert.match(validated.caption,/pass/i);
 assert.match(validated.caption,/drift/i);
 assert.doesNotMatch(validated.caption,/The finish made every second count/);
});
test("Non-YouTube boss and racing fallback titles are specific on all platforms",()=>{
 for(const brief of [hades,forza]){
  for(const platform of PLATFORMS.filter(p=>p!=="youtube")){
   const copy=createFallback(brief,platform);
   assert.equal(copy.titles.length,3);
   for(const title of copy.titles){
    assert.doesNotMatch(title,/The detail that changed this play|What made this moment work/i);
    assert.ok(title.includes(brief.game),title);
   }
  }
 }
});

test("One late overtake is not proof of spending the whole race in second",()=>{
 const b=parseBrief({game:"Forza Horizon 5",description:"I held a drift through the final corner and passed a car before the finish.",platforms:["tiktok"]});
 assert.ok(createFallback(b,"tiktok").titles.every(title=>!title.includes("Second Place")));
});
