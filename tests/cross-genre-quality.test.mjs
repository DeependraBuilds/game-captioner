import test from "node:test";
import assert from "node:assert/strict";
import {parseBrief,createFallback,validContent} from "../lib/gamecaptioner.ts";
import {editorialWarnings} from "../lib/editorial-quality.ts";
import {adequateYouTubeDescription} from "../lib/youtube-description.ts";
import {completedProjectDescription} from "../lib/progress-description.ts";

const description="After spending the whole season rearranging the farm, I finally completed the greenhouse setup.";
const mk=(tone="hype",extra={})=>parseBrief({game:"Stardew Valley",description,tone,...extra});
const drafts={
 hype:"In Stardew Valley, spending an entire season rearranging the farm leads to finally completing the greenhouse setup. Every crop tile and layout choice falls into place after weeks of planning.\n\nTake the time to clear out space, organize your planting zones, and maximize your indoor crop production for the upcoming seasons.",
 funny:"In Stardew Valley, spending an entire season rearranging the farm pays off when the greenhouse layout finally comes together. It turns out that a whole season of crop planning and layout adjustments actually leads to a completed greenhouse setup without needing any extra guesswork.\n\nTaking the time to completely overhaul farm organization changes how daily crop management runs. This particular seasonal project shows how a full-season commitment to remodeling transforms the standard Stardew Valley farming routine into a finished space.",
 tactical:"In Stardew Valley, a complete farm overhaul pays off when the final greenhouse layout comes together. After spending an entire season rearranging the farm grounds, the puzzle pieces finally lock into place to finish the setup.\n\nTaking the time to plan the space allows for an efficient operational layout. Clearing and repositioning structures across the season ensures everything is ready for the final greenhouse completion without wasting valuable in-game days.",
};
test("real Stardew Hype/Funny/Tactical examples contain unsupported added details",()=>{
 // Different editorial routes can each flag a claim. Verify the meaningful issues.
 for(const tone of ["hype","funny","tactical"]){
  const b=mk(tone);
  const flags=editorialWarnings(drafts[tone],b);
  assert.ok(flags.includes("unsolicited coaching") || flags.some(s=>s.startsWith("unsupported")),tone+":"+flags);
  const output=validContent({...createFallback(b,"youtube"),caption:drafts[tone]},b,"youtube");
  assert.ok(output);
  assert.ok(adequateYouTubeDescription(output.caption,b),tone);
  assert.ok(output.caption.includes("Stardew Valley"));
  assert.doesNotMatch(output.caption,/\b(?:crop tiles?|planting zones?|indoor crop production|repositioning structures?|efficient operational layout|daily crop management)\b/i);
  assert.notEqual(output.caption,drafts[tone]);
  assert.ok(output.caption.split(/\n\s*\n/).length>=2);
 }
});
test("project-completion fallback works across six tones without invented mechanics",()=>{
 const tones=["hype","funny","competitive","tactical","casual","cinematic"];
 const outputs=[];
 for(const tone of tones){
  const b=mk(tone);
  const copy=completedProjectDescription(b);
  assert.ok(copy,tone);
  assert.equal(copy.split(/\n\s*\n/).length,2);
  assert.ok(adequateYouTubeDescription(copy,b),tone+":"+copy);
  assert.match(copy,/greenhouse setup/i);
  assert.ok(/season/i.test(copy));
  assert.deepEqual(editorialWarnings(copy,b),[],tone);
  assert.doesNotMatch(copy,/\b(?:crop tiles?|seeds?|harvest|moving structures?|efficient layout)\b/i);
  outputs.push(copy);
 }
 assert.equal(new Set(outputs).size,6);
 assert.match(outputs[1],/side quest/i);
});
test("same completed-project archetype works in a different genre",()=>{
 const b=parseBrief({game:"Minecraft",
  description:"After spending the whole week organizing my base, I finally completed the storage room.",
  tone:"casual"});
 const fallback=createFallback(b,"youtube").caption;
 assert.ok(fallback.includes("Minecraft"));
 assert.match(fallback,/storage room/i);
 assert.match(fallback,/week/i);
 assert.ok(adequateYouTubeDescription(fallback,b),fallback);
 assert.doesNotMatch(fallback,/greenhouse|crop tiles/i);
});
test("genuinely sourced mechanics remain allowed; tutorial has separate writing intent",()=>{
 const details=mk("tactical",{description:description+" I planted crops in tiles and organized my planting zones to improve crop production."});
 assert.deepEqual(editorialWarnings("I organized my planting zones and used crop tiles to improve production.",details),[]);
 const highlight=mk("casual");
 assert.ok(editorialWarnings("Take the time to organize your planting zones.",highlight).includes("unsolicited coaching"));
 const tutorial=mk("tactical",{contentType:"tutorial",description:description+" I clear space and plant crops in specific zones."});
 assert.ok(!editorialWarnings("Take the time to clear space and plant crops in zones.",tutorial).includes("unsolicited coaching"));
});
test("natural grounded AI copy can pass without being replaced by the Basic fallback",()=>{
 const b=mk("casual");
 const caption="After spending a full season rearranging the farm in Stardew Valley, I finally got the greenhouse setup finished. That's the part of the project I wanted to show, after working on it for so long.\n\nIt wasn't a quick change to the farm, and the completed greenhouse is the result of that season of rearranging. Getting everything done was the payoff for me.";
 const result=validContent({...createFallback(b,"youtube"),caption},b,"youtube");
 assert.ok(result);
 assert.equal(result.caption,caption);
});
