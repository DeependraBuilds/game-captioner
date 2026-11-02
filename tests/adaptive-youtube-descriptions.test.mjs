import test from "node:test";
import assert from "node:assert/strict";
import {parseBrief,createFallback,validContent} from "../lib/gamecaptioner.ts";
import {adequateYouTubeDescription} from "../lib/youtube-description.ts";
import {racingCaptionIsGrounded} from "../lib/racing-description.ts";

const example="I entered the final corner in second place, held the drift, and passed the leader just before the finish line.";
const make=(tone)=>parseBrief({game:"Forza Horizon 5",description:example,tone});
test("short racing briefs generate two useful paragraphs in each tone",()=>{
 const tones=["hype","funny","competitive","tactical","casual","cinematic"];
 const outputs=tones.map(tone=>createFallback(make(tone),"youtube").caption);
 for(let i=0;i<outputs.length;i++){
  const cap=outputs[i];
  assert.equal(cap.split(/\n\s*\n/).length,2,tones[i]);
  assert.ok(adequateYouTubeDescription(cap,make(tones[i])),tones[i]+":"+cap);
  assert.ok(racingCaptionIsGrounded(cap,make(tones[i])),tones[i]);
  assert.ok(/passed the leader/.test(cap),tones[i]);
  assert.ok(!/\b(?:notes|was not specified|source)\b/.test(cap),tones[i]);
 }
 assert.equal(new Set(outputs).size,6);
});
test("valid concise AI description is preserved, without needless fallback",()=>{
 const b=make("tactical");
 const caption="In Forza Horizon 5, I entered the final corner in second place, held a drift through the turn and passed the leader just before the finish line. The final turn changed the position at the end of the race.\n\nThe decisive move came through that last corner. I stayed committed to the drift and the pass followed before the line. It's the moment this race clip is about.";
 assert.ok(adequateYouTubeDescription(caption,b));
 assert.ok(racingCaptionIsGrounded(caption,b));
 const content=validContent({...createFallback(b,"youtube"),caption},b,"youtube");
 assert.equal(content.caption,caption);
});
test("length quotas are not an excuse for a one-sentence YouTube description",()=>{
 const b=make("hype");
 const oneLine="Forza Horizon 5 drift through the final corner came at the end of the race. I entered in second and passed the leader before the finish. The move happened when the finish was close. This was an exciting overtake near the end of the clip. It was the final corner that made the difference in the result. The timing was what mattered. The clip shows the last turn and pass in the same sequence.";
 assert.equal(adequateYouTubeDescription(oneLine,b),false);
});
test("long detailed briefs still require three substantive paragraphs",()=>{
 const rich="In Rainbow Six Siege I used Mira on Chalet to anticipate the window rappel in the first round, while the Castle barricade was being broken. I heard attackers outside the window and placed a Nitro Cell before they entered, catching two attackers. In another round from Kitchen, I timed a C4 toward the Master Bedroom rappel window and caught another two attackers after listening to movement and waiting for the window to open. The second double happened in a separate round.";
 const b=parseBrief({game:"Rainbow Six Siege",description:rich});
 const two="In Rainbow Six Siege, I used Mira on Chalet to read the attackers rappelling at a Castle barricade window. I caught two attackers with the first C4 before they entered the site.\n\nLater, I played from Kitchen to reach attackers rappelling at Master Bedroom. Another Nitro Cell caught two attackers in a separate round. The timing and information made both plays possible.";
 assert.ok(two.split(/\n\s*\n/).length===2);
 assert.equal(adequateYouTubeDescription(two,b),false);
 assert.ok(adequateYouTubeDescription(createFallback(b,"youtube").caption,b));
});
