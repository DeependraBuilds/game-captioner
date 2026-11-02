import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {parseBrief,createFallback,validContent,publishText,captionWithoutDuplicateTags,PLATFORMS} from "../lib/gamecaptioner.ts";

const forza=parseBrief({game:"Forza Horizon 5",description:"I entered the last corner in second, held the drift and overtook the leader right before the finish.",tone:"funny",platforms:[...PLATFORMS],includeCTA:true});
const hades=parseBrief({game:"Hades",description:"I dodged the boss's last attack with barely any health and escaped the room.",tone:"tactical",platforms:[...PLATFORMS],includeCTA:true,includeCarousel:true});
const count=(str,tag)=>(str.match(new RegExp(tag,"gi"))||[]).length;

test("Forza X hashtags-only Gemini output restores a meaningful caption",()=>{
 const backup=createFallback(forza,"twitter");
 const result=validContent({...backup,caption:"#ForzaHorizon5 #Drifting"},forza,"twitter");
 assert.ok(result);
 assert.ok(result.caption.length>24);
 assert.match(result.caption,/Forza Horizon 5/);
 assert.doesNotMatch(result.caption,/#ForzaHorizon5/);
 assert.ok(publishText(result).length<=280);
 assert.equal(count(publishText(result),"#ForzaHorizon5"),1);
 assert.equal(count(publishText(result),"#Drifting"),1);
});
test("X embedded hashtag suffix appears only once in publish-ready text",()=>{
 const original="Second place entering the final corner, holding the drift, and passing the leader right before the finish in Forza Horizon 5.\n\n#ForzaHorizon5 #Drifting";
 const base=createFallback(forza,"twitter");
 assert.equal(captionWithoutDuplicateTags(original,base.hashtags),"Second place entering the final corner, holding the drift, and passing the leader right before the finish in Forza Horizon 5.");
 const safe=validContent({...base,caption:original},forza,"twitter");
 assert.ok(safe);
 assert.ok(!safe.caption.includes("#"));
 assert.equal(count(publishText(safe),"#ForzaHorizon5"),1);
 assert.equal(count(publishText({...base,caption:original}),"#ForzaHorizon5"),1);
});
test("Hades across five platforms contains actual dodge and escape in VO and captions",()=>{
 for(const p of PLATFORMS){
   const item=createFallback(hades,p);
   assert.match(item.voiceover,/dodg/i,p);
   assert.match(item.voiceover,/made it out|escap|surviv/i,p);
   assert.match(item.caption,/dodg/i,p);
   assert.match(item.caption,/escap|surviv|made it out/i,p);
   assert.ok(item.onscreen.every(t=>t.length<=45),p);
   assert.ok(item.onscreen.some(t=>/DODG/i.test(t)),p);
   assert.equal(new Set(item.carousel.map(t=>t.toLowerCase())).size,item.carousel.length,p);
   assert.ok(item.carousel.length>=3,p);
 }
});
test("Hades malformed tactical title and generic action-less AI VO get grounded alternatives",()=>{
 const fallback=createFallback(hades,"youtube");
 assert.doesNotMatch(fallback.titles[0],/The Read Behind One Dodge Saved/i);
 const bad={...fallback,
   titles:["The Read Behind One Dodge Saved This Boss Fight | Hades",fallback.titles[1],fallback.titles[2]],
   voiceover:"One mistake away from losing the run. Here's the read. That close call was the moment worth saving.",
   onscreen:["ONE MISTAKE AWAY","THE SETUP","THAT CLOSE CALL WAS THE MOMENT WORTH SAVING"],
   carousel:["Boss moment","The setup: That close call was the moment worth saving.","The takeaway: That close call was the moment worth saving."],
 };
 const result=validContent(bad,hades,"youtube");
 assert.ok(result);
 assert.match(result.voiceover,/dodg/i);
 assert.match(result.voiceover,/made it out/i);
 assert.match(result.onscreen.join(" "),/DODG/i);
 assert.equal(new Set(result.carousel.map(x=>x.toLowerCase())).size,result.carousel.length);
});
test("Forza social copy cannot invent a podium outcome or being second the entire race",()=>{
 const base=createFallback(forza,"tiktok");
 const bad="Second place until the literal last corner in Forza Horizon 5. A drift ruined someone's podium finish right before the line.";
 const result=validContent({...base,caption:bad},forza,"tiktok");
 assert.ok(result);
 assert.ok(!/podium/i.test(result.caption));
 const whole="Hanging out in second place for the whole race in Forza Horizon 5 until the last corner.";
 const inst=validContent({...createFallback(forza,"instagram"),caption:whole},forza,"instagram");
 assert.ok(inst);
 assert.doesNotMatch(inst.caption,/whole race/i);
});
test("Boss title choices avoid invented one-hit and fight-finish claims",()=>{
 const item=createFallback(hades,"youtube");
 assert.ok(item.titles.every(title=>!title.includes("One Hit Away")),item.titles.join(" / "));
 assert.ok(item.titles.every(title=>!/Finished the Fight|Defeated the Boss|Beat the Boss/i.test(title)));
 assert.ok(item.titles.some(title=>/Dodg|Escape/i.test(title)));
 assert.ok(item.titles.every(title=>title.length<=100));
});
test("CSV export keeps column compatibility and normalizes caption tags",()=>{
 const src=readFileSync(new URL("../app/page.tsx",import.meta.url),"utf8");
 assert.match(src,/captionWithoutDuplicateTags\(item\.caption,item\.hashtags\)/);
 assert.match(src,/"Platform", "Game", "Title 1", "Title 2", "Title 3", "Caption", "Hashtags"/);
});
