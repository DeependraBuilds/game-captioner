import test from "node:test";
import assert from "node:assert/strict";
import {parseBrief,createFallback,validContent,publishText} from "../lib/gamecaptioner.ts";
import {respond} from "../lib/server.ts";

const input={game:"Forza Horizon 5",description:"I entered the last corner in second place, held my drift, and passed the leader before the finish line.",tone:"hype",platforms:["youtube"]};
const b=parseBrief(input);
test("Partial AI copy retains valid title and VO, filling omitted metadata from local draft",()=>{
 const fallback=createFallback(b,"youtube");
 const input={titles:["A Last-Corner Overtake in Forza Horizon 5"],voiceover:"I held the drift on the last corner and passed the leader before the line."};
 const output=validContent(input,b,"youtube");
 assert.ok(output);
 assert.equal(output.titles[0],input.titles[0]);
 assert.equal(output.voiceover,input.voiceover);
 assert.equal(output.titles.length,3);
 assert.equal(output.caption,fallback.caption.trim());
 assert.ok(output.hashtags.includes("#ForzaHorizon5"));
});
test("Partial AI copy still rejects empty and unrelated provider payloads",()=>{
 assert.equal(validContent({error:"bad response"},b,"youtube"),null);
 assert.equal(validContent({titles:[],caption:"",voiceover:""},b,"youtube"),null);
});
test("Forza last-turn fallback never truncates a sentence after held",()=>{
 const cases=[
  "I entered the last corner in second place, held a drift, and crossed the finish line.",
  "I drifted through the final turn after starting the corner in second place.",
  "I held the drift in the last corner and passed the leader right before the finish.",
 ];
 for(const description of cases){
  const brief=parseBrief({game:"Forza Horizon 5",description,tone:"hype"});
  const caption=createFallback(brief,"youtube").caption;
  assert.ok(caption.split(/\n\s*\n/).length===2,caption);
  assert.ok(caption.includes("Forza Horizon 5"));
  assert.doesNotMatch(caption,/\bheld\.\s/);
  assert.ok(publishText(createFallback(brief,"youtube")).length>200);
 }
});
test("Gemini accepts JSON split across candidate parts and fills missing optional keys without a second API call",async()=>{
 const oldFetch=globalThis.fetch;
 const enabled=process.env.GEMINI_ENABLED,key=process.env.GEMINI_API_KEY;
 let calls=0;
 process.env.GEMINI_ENABLED="true";process.env.GEMINI_API_KEY="mock-key";
 globalThis.fetch=async()=>{
  calls++;
  const partial=JSON.stringify({youtube:{
    titles:["Final Corner. One Drift. An Overtake | Forza Horizon 5"],
    voiceover:"I held the drift and passed the leader just before the finish."
  }});
  const midpoint=Math.floor(partial.length/2);
  return new Response(JSON.stringify({candidates:[{content:{parts:[
   {text:partial.slice(0,midpoint)},{text:partial.slice(midpoint)}
  ]}}]}),{status:200});
 };
 try{
  const request=new Request("https://example.com/api/generate",{
   method:"POST",headers:{"content-type":"application/json",origin:"https://example.com","x-forwarded-for":"198.51.100.212"},
   body:JSON.stringify(input),
  });
  const response=await respond(request,false);
  assert.equal(response.status,200);
  const json=await response.json();
  assert.equal(json.mode,"creative");
  assert.equal(json.results.youtube.titles[0],"Final Corner. One Drift. An Overtake | Forza Horizon 5");
  assert.ok(json.results.youtube.caption.includes("Forza Horizon 5"));
  assert.equal(calls,1);
 }finally{
  globalThis.fetch=oldFetch;
  if(enabled===undefined)delete process.env.GEMINI_ENABLED;else process.env.GEMINI_ENABLED=enabled;
  if(key===undefined)delete process.env.GEMINI_API_KEY;else process.env.GEMINI_API_KEY=key;
 }
});
test("Single-platform AI payload without wrapper is accepted",async()=>{
 const b=parseBrief({game:"Hades",description:"I survived a boss dodge and finished my run."});
 const output=validContent({titles:["One Last Boss Dodge in Hades"],voiceover:"I dodged at the last second."},b,"youtube");
 assert.ok(output);
 assert.ok(output.caption.length>100);
});
