import test from "node:test";
import assert from "node:assert/strict";
import {parseBrief,createFallback,validContent,publishText} from "../lib/gamecaptioner.ts";
import {adequateYouTubeDescription} from "../lib/youtube-description.ts";
import {unsupportedClaims} from "../lib/grounding.ts";

const source="I entered the last corner in second place, held the drift and passed the leader right before the finish line.";
function brief(tone){return parseBrief({game:"Forza Horizon 5",description:source,tone,platforms:["youtube"]});}
const sample="Pulling off a clean last-corner drift in Forza Horizon 5 takes precise timing when you are chasing the lead. In this highlight, entering the final turn in second position sets up a split-second overtaking opportunity right before crossing the finish line.\n\nHolding the drift through the corner maintains momentum without losing control, allowing for a decisive pass on the leader at the very end of the race.\n\nTiming your slide through tight sections is a reliable way to gain position when trailing on the final stretch.";

test("actual problematic Forza Hype AI description is not publishable verbatim",()=>{
 const b=brief("hype");
 const found=unsupportedClaims(sample,b);
 assert.ok(found.includes("inferred race movement"));
 assert.ok(found.includes("inferred vehicle control"));
 assert.ok(found.includes("inferred track difficulty"));
 assert.ok(found.includes("unsupported general advice"));
 const ai={...createFallback(b,"youtube"),caption:sample};
 const checked=validContent(ai,b,"youtube");
 assert.ok(checked);
 assert.ok(adequateYouTubeDescription(checked.caption,b));
 assert.notEqual(checked.caption,sample);
 assert.doesNotMatch(checked.caption,/maintains momentum|without losing control|tight sections|reliable way to/i);
 assert.match(checked.caption,/Forza Horizon 5/);
 assert.match(checked.caption,/drift/);
});

test("explicit driving notes still permit supported technical details",()=>{
 const b=parseBrief({game:"Forza Horizon 5",description:"I held a drift at the final corner, maintained momentum and kept the car under control through a tight section before overtaking the leader."});
 assert.deepEqual(unsupportedClaims("I maintained momentum without losing control through the tight section.",b),[]);
});

test("creator-facing preview is populated for every writing tone",()=>{
 for(const tone of ["hype","funny","competitive","tactical","casual","cinematic"]){
  const b=brief(tone);
  const basic=createFallback(b,"youtube");
  assert.ok(adequateYouTubeDescription(basic.caption,b),tone);
  assert.ok(publishText(basic).length>350,tone);
  const mock=validContent({...basic,caption:basic.caption},b,"youtube");
  assert.ok(mock,tone);
  assert.ok(publishText(mock).includes("#ForzaHorizon5"));
  assert.ok(publishText(mock).includes(mock.caption));
 }
});
