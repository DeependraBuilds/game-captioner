import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import { parseBrief, createFallback } from "../lib/gamecaptioner.ts";
import { unsupportedClaims } from "../lib/grounding.ts";
import { respond } from "../lib/server.ts";

const css=readFileSync(new URL("../app/globals.css",import.meta.url),"utf8");
const ui=readFileSync(new URL("../app/page.tsx",import.meta.url),"utf8");
const siege="I used Mira on Chalet for a double C4 on the window rappel near the Castle barricade. In another round I timed a second double C4 from Kitchen toward the Master Bedroom window.";
test("tone helper has its own non-overlapping layout",()=>{
 assert.match(css,/\.tone-hint\{[^}]*margin:12px 0 0/);
 assert.match(css,/\.tone-hint\{[^}]*position:static/);
 assert.match(ui,/className="tone-hint"/);
 assert.doesNotMatch(ui,/className="input-hint"><span>\{toneHelp/);
 assert.match(css,/@media \(max-width:650px\)[^\n]*tone-grid\{grid-template-columns:repeat\(2/);
});
test("UI identifies the selected tone and the actual generated draft tone",()=>{
 assert.match(ui,/Selected: \{tone\.charAt/);
 assert.match(ui,/const \[draftTone,setDraftTone\] = useState/);
 assert.match(ui,/setDraftTone\(tone\)/);
 assert.match(ui,/Draft tone: \{draftTone/);
 assert.match(ui,/draftTone !== tone/);
});
test("two different tones have distinct factual middle paragraphs",()=>{
 const b=(tone)=>parseBrief({game:"Rainbow Six Siege",description:siege,tone});
 const tactical=createFallback(b("tactical"),"youtube").caption.split(/\n\s*\n/);
 const funny=createFallback(b("funny"),"youtube").caption.split(/\n\s*\n/);
 assert.equal(tactical.length,3);
 assert.equal(funny.length,3);
 assert.notEqual(tactical[1],funny[1]);
 assert.match(tactical[1],/Castle/);
 assert.match(funny[1],/Castle/);
});
test("unsourced victory and throttle details are flagged in racing copy",()=>{
 const b=parseBrief({game:"Forza Horizon 5",description:"I drifted through the final corner and passed the leader before the finish."});
 const claims=unsupportedClaims("I secured a last-second victory and mastered throttle control on the final straight.",b);
 assert.ok(claims.includes("victory"));
 assert.ok(claims.includes("throttle technique"));
 assert.ok(claims.includes("race straight"));
 const fallback=createFallback(b,"youtube");
 assert.ok(fallback.caption.split(/\n\s*\n/).length>=2);
 assert.ok(!/\bsecured the win\b/i.test(fallback.caption));
});
test("Gemini prompt carries selected writing style and a specific racing accuracy constraint",async()=>{
 const oldFetch=globalThis.fetch;
 const oldEnabled=process.env.GEMINI_ENABLED,oldKey=process.env.GEMINI_API_KEY;
 process.env.GEMINI_ENABLED="true";process.env.GEMINI_API_KEY="test-only";
 const input={game:"Forza Horizon 5",description:"I held a drift through the final corner and passed the leader before the finish.",tone:"funny",platforms:["youtube"]};
 const b=parseBrief(input);
 const draft=createFallback(b,"youtube");
 let prompt="";
 globalThis.fetch=async(_url,options)=>{
  const req=JSON.parse(options.body);
  prompt=req.contents[0].parts[0].text;
  return new Response(JSON.stringify({candidates:[{content:{parts:[{text:JSON.stringify({youtube:draft})}]}}]}),{status:200});
 };
 try{
  const req=new Request("https://example.com/api/generate",{
   method:"POST",headers:{"content-type":"application/json",origin:"https://example.com","x-forwarded-for":"198.51.100.199"},
   body:JSON.stringify(input),
  });
  const response=await respond(req,false);
  const data=await response.json();
  assert.equal(response.status,200);
  assert.equal(data.mode,"creative");
  assert.match(prompt,/ACTIVE WRITING TONE: FUNNY/);
  assert.match(prompt,/VOICEOVER STYLE:/);
  assert.match(prompt,/RACING: Passing the leader/);
  assert.match(prompt,/throttle control/);
 }finally{
  globalThis.fetch=oldFetch;
  if(oldEnabled===undefined)delete process.env.GEMINI_ENABLED;else process.env.GEMINI_ENABLED=oldEnabled;
  if(oldKey===undefined)delete process.env.GEMINI_API_KEY;else process.env.GEMINI_API_KEY=oldKey;
 }
});
