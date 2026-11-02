import test from "node:test";
import assert from "node:assert/strict";
import {parseBrief,createFallback,validContent} from "../lib/gamecaptioner.ts";
import {adequateYouTubeDescription} from "../lib/youtube-description.ts";
import {unsupportedClaims} from "../lib/grounding.ts";

const siege=parseBrief({game:"Rainbow Six Siege",
 description:"I got two double C4 kills on Chalet in different rounds. I read the window rappels near the Castle barricade and timed the Nitro Cell. I used Mira during the first round.",
 tone:"hype"});
const forza=parseBrief({game:"Forza Horizon 5",
 description:"I entered the last corner in second place, held the drift through the corner and passed the leader right before the finish line.",
 tone:"tactical"});
const create=(brief,caption,other={})=>({...createFallback(brief,"youtube"),caption,...other});
test("Hype's universal gunfight claim is rejected, even when the gameplay really has double C4s",()=>{
 const claim="This proves anticipation beats raw gunfights every single time.";
 assert.ok(unsupportedClaims(claim,siege).includes("unearned absolute"));
 const hype="Mastering C4 timing in Rainbow Six Siege takes pure observation and map knowledge. Watch how reading window rappels leads to double kills across rounds on Chalet, proving that anticipation beats raw gunfights every single time.\n\nUsing Mira, this gameplay highlights the window barricade read and the two C4 detonations. I waited before committing to the first C4.\n\nStudy these setups to sharpen your game sense. The payoff comes from timing, not the blast alone.";
 const revised=validContent(create(siege,hype),siege,"youtube");
 assert.ok(revised);
 assert.ok(adequateYouTubeDescription(revised.caption,siege));
 assert.ok(!/every single time/i.test(revised.caption));
});
test("Funny cannot silently invent a timer-stalling tactic",()=>{
 const b=parseBrief({...siege,tone:"funny"});
 const funny="In Rainbow Six Siege on Chalet, apparently one double C4 was not enough. Two separate rounds gave me two reads on the window rappels.\n\nI timed the first detonation at the Castle barricade and waited for the attackers to reach the window. The second double came in another round.\n\nSometimes waiting out the timer is the entire strategy. If you read the movement right, the C4 does the talking.";
 const draft=validContent(create(b,funny),b,"youtube");
 assert.ok(draft);
 assert.ok(!/waiting out the timer/i.test(draft.caption));
 assert.ok(adequateYouTubeDescription(draft.caption,b));
});
test("Forza racing jargon is not allowed to invent driving mechanics or a guaranteed result",()=>{
 const result="In Forza Horizon 5, entering the final corner in second requires a precise drift. Holding the angle through the apex lets the car carry momentum to pass the leader.\n\nI kept throttle discipline while the opponent held a tighter racing line. The slide's exit secured the pass before the line.\n\nApplying this on technical closing sections means you will secure a last-second victory in every race.";
 assert.ok(unsupportedClaims(result,forza).some(x=>/throttle|racing line|absolute|victory/.test(x)) || unsupportedClaims(result,forza).length>2);
 const clean=validContent(create(forza,result),forza,"youtube");
 assert.ok(clean);
 assert.ok(adequateYouTubeDescription(clean.caption,forza));
 assert.ok(!/\bapex\b|\bthrottle discipline\b|\btighter racing line\b|\bsecured a last.second victory\b/i.test(clean.caption));
 assert.ok(/drift/i.test(clean.caption));
 assert.ok(/Forza Horizon 5/.test(clean.caption));
});
test("explicit throttle, apex and timer details remain available if supplied in the notes",()=>{
 const b=parseBrief({game:"Forza Horizon 5",description:"I managed throttle through the apex on the last corner and held my racing line to overtake the leader."});
 assert.equal(unsupportedClaims("I managed the throttle at the apex and held my racing line.",b).length,0);
 const withClock=parseBrief({game:"Rainbow Six Siege",description:"I waited out the timer on Chalet and threw the Nitro Cell in the final seconds."});
 assert.equal(unsupportedClaims("I was waiting out the timer before the C4.",withClock).length,0);
});
test("YouTube AI single-line copy cannot bypass the paragraph gate",()=>{
 const condensed=create(forza,"Forza Horizon 5 racing can make a final corner count. I held the drift and passed the leader near the finish line. The setup matters because the overtake came from reading the corner. That is an interesting moment and the useful takeaway for viewers. Racing games reward decisions that are timed right, and the clip shows that the pass is the result. A good gaming description should remain factual and use only what was supplied in the notes.");
 const out=validContent(condensed,forza,"youtube");
 assert.ok(out);
 assert.ok(adequateYouTubeDescription(out.caption,forza));
 assert.ok(out.caption.includes("\n\n"));
});
test("spoken voiceover cannot sneak in a subscribe or follow CTA",()=>{
 const bad=create(forza,createFallback(forza,"youtube").caption,{
  voiceover:"I held the last corner drift and passed the leader. Like and subscribe for more Forza Horizon 5 clips!",
 });
 const out=validContent(bad,forza,"youtube");
 assert.ok(out);
 assert.ok(!/like and subscribe/i.test(out.voiceover));
});
