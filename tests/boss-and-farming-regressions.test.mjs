import test from "node:test";
import assert from "node:assert/strict";
import {parseBrief,createFallback,validContent} from "../lib/gamecaptioner.ts";
import {adequateYouTubeDescription} from "../lib/youtube-description.ts";
import {editorialWarnings} from "../lib/editorial-quality.ts";
const b=(game,description,tone="casual",contentType="highlight")=>parseBrief({game,description,tone,contentType});

test("Hades funny uses the actual boss, dodge and escape, not internal editorial language",()=>{
 const brief=b("Hades","I dodged the final boss hit with barely any health and escaped.","funny");
 const cap=createFallback(brief,"youtube").caption;
 assert.equal(cap.split(/\n\s*\n/).length,2);
 assert.ok(adequateYouTubeDescription(cap,brief),cap);
 assert.match(cap,/Hades/);
 assert.match(cap,/dodg/i);
 assert.match(cap,/made it out|surviv|escap/i);
 assert.doesNotMatch(cap,/notes|clip actually describes|source brief|one mistake away from losing the run|last-second decision/i);
});
test("Boss fallback works for a different genre when the source confirms a dodge and completed fight",()=>{
 const brief=b("Elden Ring","I dodged the final boss attack on 1 hp and finished the fight.","tactical");
 const cap=createFallback(brief,"youtube").caption;
 assert.ok(adequateYouTubeDescription(cap,brief),cap);
 assert.match(cap,/dodge|dodged/i);
 assert.match(cap,/Elden Ring/);
 assert.doesNotMatch(cap,/escaped|won the entire run|beat the game/i);
});
test("Stardew cinematic AI cannot invent operational results, routine changes, or planning",()=>{
 const brief=b("Stardew Valley","After spending the whole season rearranging the farm, I finally completed the greenhouse setup.","cinematic");
 const input="In Stardew Valley, spending a whole season rearranging the farm leads up to a major milestone. The entire layout shifts as the greenhouse setup finally comes together after days of planning.\n\nSeeing the finished greenhouse operational after a full season of heavy reorganization changes the whole routine.";
 const flags=editorialWarnings(input,brief);
 assert.ok(flags.includes("unsupported planning"),flags.join(", "));
 assert.ok(flags.includes("unsupported operational outcome"),flags.join(", "));
 assert.ok(flags.includes("unsupported routine change"),flags.join(", "));
 const out=validContent({...createFallback(brief,"youtube"),caption:input},brief,"youtube");
 assert.ok(out);
 assert.ok(adequateYouTubeDescription(out.caption,brief));
 assert.doesNotMatch(out.caption,/operational|changes the whole routine|days of planning/i);
 assert.match(out.caption,/greenhouse/i);
});
test("Explicit source detail permits operational greenhouse and planned changes",()=>{
 const brief=b("Stardew Valley","I planned the farm during the season and finished an operational greenhouse that changed my daily routine.","cinematic");
 assert.deepEqual(editorialWarnings("After days of planning, the greenhouse became operational and changed my daily routine.",brief),[]);
});
test("Casual racing second paragraph no longer restates the drift/pass sequence verbatim",()=>{
 const brief=b("Forza Horizon 5","I entered the last corner in second place, held the drift and passed the leader before the finish line.","casual");
 const cap=createFallback(brief,"youtube").caption;
 const paragraphs=cap.split(/\n\s*\n/);
 assert.equal(paragraphs.length,2);
 assert.ok(adequateYouTubeDescription(cap,brief));
 assert.match(paragraphs[0],/drift/i);
 assert.match(paragraphs[0],/passed the leader/i);
 assert.doesNotMatch(paragraphs[1],/last-corner drift followed by the pass/i);
});
