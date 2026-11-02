import test from "node:test";
import assert from "node:assert/strict";
import {parseBrief,createFallback,validContent} from "../lib/gamecaptioner.ts";
import {racingFacts,racingCaptionIsGrounded} from "../lib/racing-description.ts";
import {respond} from "../lib/server.ts";
import {readFileSync} from "node:fs";

const note="I entered the final corner in second place, held the drift through the last turn, and passed the leader just before the finish line.";
const mk=(tone="hype")=>parseBrief({game:"Forza Horizon 5",description:note,tone,platforms:["youtube"]});
test("all tones preserve an explicitly confirmed overtake and avoid editorial meta-language",()=>{
 const rendered=["hype","funny","competitive","tactical","casual","cinematic"].map(tone=>createFallback(mk(tone),"youtube").caption);
 for(const caption of rendered){
  assert.ok(caption.includes("Forza Horizon 5"));
  assert.ok(/\bdrift\b/i.test(caption));
  assert.ok(/\b(?:pass(?:ed)?|overtake|got past)\b/i.test(caption));
  assert.doesNotMatch(caption,/\b(?:notes|evidence|brief|source|was not specified|cannot assume)\b/i);
  assert.equal(caption.split(/\n\s*\n/).length,2);
 }
 assert.equal(new Set(rendered).size,6);
 const funny=rendered[1],tactical=rendered[3];
 assert.match(funny,/corner|timing/i);
 assert.match(tactical,/second place/i);
 assert.notEqual(funny.split(/\n\s*\n/)[1],tactical.split(/\n\s*\n/)[1]);
});
test("good AI description is preserved; generic coaching is rejected for highlights",()=>{
 const brief=mk();
 const wellWritten="Final corner in Forza Horizon 5. I entered in second place, held the drift and passed the leader before the finish line.\n\nThe move happened through the last turn. I was behind entering the corner, and the pass came shortly before the line, right at the end of the race.\n\nThat late Forza Horizon 5 overtake is the whole highlight. A single drift through one final corner changed the position, and the clip ends on the pass rather than an assumed victory.";
 assert.equal(racingCaptionIsGrounded(wellWritten,brief),true);
 const valid=validContent({...createFallback(brief,"youtube"),caption:wellWritten},brief,"youtube");
 assert.equal(valid.caption,wellWritten);
 const coached=wellWritten.replace("That late Forza Horizon 5 overtake is the whole highlight.","Use this approach when facing a deficit.");
 assert.equal(racingCaptionIsGrounded(coached,brief),false);
 assert.equal(validContent({...createFallback(brief,"youtube"),caption:coached},brief,"youtube").caption,createFallback(brief,"youtube").caption);
});
test("AI cannot erase a confirmed pass or hallucinate one if absent",()=>{
 const yes=mk();
 const no=parseBrief({game:"Forza Horizon 5",description:"I held a drift through the final corner before the race ended."});
 const onlyDrift="In Forza Horizon 5, I committed to a drift in the final corner. That one corner became the defining moment.\n\nI held that drift through the turn and made it across the last corner. It was the part of the race I wanted to show.\n\nThe moment is a single drift rather than a montage of other actions. This clip focuses on the final turn and the way it played out.";
 assert.equal(racingCaptionIsGrounded(onlyDrift,yes),false);
 assert.equal(racingCaptionIsGrounded(onlyDrift,no),true);
 assert.equal(racingFacts(yes).passed,true);
 assert.equal(racingFacts(no).passed,false);
});
test("API marks AI-written captions separately from grounded fallback captions",async()=>{
 const oldFetch=globalThis.fetch,oldEnabled=process.env.GEMINI_ENABLED,oldKey=process.env.GEMINI_API_KEY;
 process.env.GEMINI_ENABLED="true";process.env.GEMINI_API_KEY="mock";
 globalThis.fetch=async()=>new Response(JSON.stringify({candidates:[{content:{parts:[{text:JSON.stringify({youtube:{
   titles:["One Final Corner Overtake | Forza Horizon 5"],
   voiceover:"I held the drift and passed the leader before the finish."
 }})}]}}]}),{status:200});
 try{
  const req=new Request("https://example.com/api/generate",{
   method:"POST",headers:{"content-type":"application/json",origin:"https://example.com","x-forwarded-for":"198.51.100.238"},
   body:JSON.stringify({game:"Forza Horizon 5",description:note,tone:"tactical",platforms:["youtube"]}),
  });
  const response=await respond(req,false),data=await response.json();
  assert.equal(data.mode,"creative");
  assert.equal(data.captionSources.youtube,"grounded");
  assert.ok(data.results.youtube.caption.includes("passed the leader"));
 }finally{
  globalThis.fetch=oldFetch;
  if(oldEnabled===undefined)delete process.env.GEMINI_ENABLED;else process.env.GEMINI_ENABLED=oldEnabled;
  if(oldKey===undefined)delete process.env.GEMINI_API_KEY;else process.env.GEMINI_API_KEY=oldKey;
 }
});
test("Studio displays source of description separately from AI-assisted draft status",()=>{
 const page=readFileSync(new URL("../app/page.tsx",import.meta.url),"utf8");
 assert.match(page,/Description: \{captionSources\[active\]==="ai"/);
 assert.match(page,/setCaptionSources\(data\.captionSources\|\|\{\}\)/);
});
