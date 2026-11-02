import test from "node:test";
import assert from "node:assert/strict";
import {parseBrief,createFallback,validContent,PLATFORMS} from "../lib/gamecaptioner.ts";
import {ungroundedMomentClaims} from "../lib/moment-accuracy.ts";
import {unsupportedClaims} from "../lib/grounding.ts";

const hades=parseBrief({
 game:"Hades",
 description:"I dodged the boss's last attack with barely any health and escaped the room on the next strike.",
 tone:"competitive",platforms:[...PLATFORMS],includeCTA:true,includeCarousel:true
});
const forza=parseBrief({
 game:"Forza Horizon 5",
 description:"I entered the last corner in second place, held the drift through the turn and passed the leader right before the finish.",
 tone:"hype",platforms:[...PLATFORMS],includeCTA:true,includeCarousel:true
});

test("uploaded Hades TikTok 1 HP title is rejected without actual HP evidence",()=>{
 const bad="Surviving a Hades Boss With 1 HP Left";
 assert.ok(ungroundedMomentClaims(bad,hades).includes("unverified exact-death stakes"));
 const original=createFallback(hades,"tiktok");
 const checked=validContent({...original,titles:[bad,"The Ultimate Low-Health Escape in Hades","Dodging the Final Hades Boss Attack"]},hades,"tiktok");
 assert.ok(checked);
 assert.notEqual(checked.titles[0],bad);
 assert.doesNotMatch(checked.titles[0],/\b1 HP\b/);
});

test("uploaded Hades TikTok caption cannot make one mistake automatically equal defeat",()=>{
 const bad="Surviving a Hades boss fight with barely any health left comes down to a single timed dodge. One mistake means defeat.";
 assert.ok(ungroundedMomentClaims(bad,hades).includes("unverified exact-death stakes"));
 const backup=createFallback(hades,"tiktok");
 const checked=validContent({...backup,caption:bad},hades,"tiktok");
 assert.ok(checked);
 assert.match(checked.caption,/dodg/i);
 assert.match(checked.caption,/escap|made it out/i);
 assert.doesNotMatch(checked.caption,/one mistake means defeat/i);
});

test("uploaded Hades YouTube narration cannot invent precision, finishing blow, or guaranteed run outcome",()=>{
 const bad="In this Hades boss encounter, surviving the final attack required precise timing with very low health remaining. Escaping the room on the next strike secured the run.\n\nExecuting the dodge at the exact right moment avoided the boss's finishing blow, turning a potential defeat into a clean escape.";
 const flags=ungroundedMomentClaims(bad,hades);
 assert.ok(flags.includes("unverified dodge precision"),flags.join(", "));
 assert.ok(flags.includes("unsupported run outcome or finishing blow"),flags.join(", "));
 const original=createFallback(hades,"youtube");
 const checked=validContent({...original,caption:bad},hades,"youtube");
 assert.ok(checked);
 assert.doesNotMatch(checked.caption,/precise timing|secured the run|exact right moment|finishing blow/i);
 assert.match(checked.caption,/Hades/);
 assert.match(checked.caption,/dodg/i);
});

test("uploaded Forza carousel does not silently add a controlled drift",()=>{
 const original=createFallback(forza,"youtube");
 const entries=["Entered the final corner in second place.","Held a controlled drift around the bend.","Overtook the leader right before the finish line."];
 assert.ok(unsupportedClaims(entries[1],forza).includes("unverified drift control or precise timing"));
 const checked=validContent({...original,carousel:entries},forza,"youtube");
 assert.ok(checked);
 assert.doesNotMatch(checked.carousel.join(" " ),/controlled drift/i);
 assert.match(checked.carousel.join(" "),/drift/i);
});

test("uploaded Forza Facebook caption cannot add perfectly timed drift technique",()=>{
 const bad="A thrilling finish in Forza Horizon 5! Starting the final corner in second place, a perfectly timed drift allows for an amazing overtake right before the finish line.";
 assert.ok(unsupportedClaims(bad,forza).includes("unverified drift control or precise timing"));
 const orig=createFallback(forza,"facebook");
 const checked=validContent({...orig,caption:bad},forza,"facebook");
 assert.ok(checked);
 assert.doesNotMatch(checked.caption,/perfectly timed/i);
 assert.match(checked.caption,/pass/i);
});

test("specific one-hit, timing, and controlled-drift facts remain permitted if source explicitly supports them",()=>{
 const h=parseBrief({game:"Hades",description:"At 1 HP I performed a precisely timed dodge against the boss and escaped the room; that secured my run."});
 assert.deepEqual(ungroundedMomentClaims("At 1 HP I timed the dodge and secured my run.",h),[]);
 const f=parseBrief({game:"Forza Horizon 5",description:"I held a perfectly timed controlled drift in the final corner and passed the leader."});
 assert.equal(unsupportedClaims("The perfectly timed controlled drift helped me pass the leader.",f).length,0);
});
