import test from "node:test";
import assert from "node:assert/strict";
import { respond } from "../lib/server.ts";

const request = (ip) => new Request("https://example.com/api/generate",{
  method:"POST",
  headers:{"content-type":"application/json","origin":"https://example.com","x-forwarded-for":ip},
  body:JSON.stringify({game:"Hades",description:"I survived the boss attack and finished the run.",platforms:["youtube"]}),
});
async function withMock(mock,run){
 const oldFetch=globalThis.fetch;
 const enabled=process.env.GEMINI_ENABLED, key=process.env.GEMINI_API_KEY;
 process.env.GEMINI_ENABLED="true";process.env.GEMINI_API_KEY="unit-test-key";
 globalThis.fetch=mock;
 try{return await run();}
 finally{
  globalThis.fetch=oldFetch;
  if(enabled===undefined)delete process.env.GEMINI_ENABLED;else process.env.GEMINI_ENABLED=enabled;
  if(key===undefined)delete process.env.GEMINI_API_KEY;else process.env.GEMINI_API_KEY=key;
 }
}
test("invalid upstream JSON is accurately reported as an invalid response",async()=>{
 await withMock(async()=>new Response("{", {status:200,headers:{"content-type":"application/json"}}),async()=>{
  const result=await (await respond(request("198.51.100.28"),false)).json();
  assert.equal(result.mode,"offline");
  assert.match(result.warning,/incomplete or incompatible/);
  assert.ok(!result.warning.includes("could not be reached"));
  assert.equal(result.results.youtube.titles.length,3);
 });
});
test("malformed model candidate JSON is not mislabeled as a network error",async()=>{
 await withMock(async()=>new Response(JSON.stringify({candidates:[{content:{parts:[{text:'{invalid'}]}}]}),{status:200}),async()=>{
  const result=await (await respond(request("198.51.100.29"),false)).json();
  assert.equal(result.mode,"offline");
  assert.match(result.warning,/incomplete or incompatible/);
 });
});
test("transport failure is distinguished from malformed model output",async()=>{
 await withMock(async()=>{throw new TypeError("network request failed");},async()=>{
  const result=await (await respond(request("198.51.100.30"),false)).json();
  assert.equal(result.mode,"offline");
  assert.match(result.warning,/could not be reached/);
 });
});
test("upstream model and quota errors are distinguished without leaking body text",async()=>{
 await withMock(async()=>new Response("SENSITIVE_GOOGLE_RESPONSE",{status:429}),async()=>{
  const result=await (await respond(request("198.51.100.31"),false)).json();
  assert.equal(result.mode,"offline");
  assert.match(result.warning,/quota/);
  assert.ok(!result.warning.includes("SENSITIVE"));
 });
});
test("valid generated content enters creative mode and uses a low-thinking request",async()=>{
 const content={titles:["A boss fight came down to one dodge","How I survived the last attack","The timing behind the escape"],caption:"The boss fight came down to one final dodge.",hashtags:["#Hades"],voiceover:"It was one hit away from ending the run.",onscreen:["ONE LAST DODGE"],cta:"",carousel:[]};
 await withMock(async(_url,opts)=>{
  const parsed=JSON.parse(opts.body);
  assert.equal(parsed.generationConfig.thinkingConfig?.thinkingLevel,"low");
  assert.equal(parsed.generationConfig.responseMimeType,"application/json");
  return new Response(JSON.stringify({candidates:[{content:{parts:[{text:JSON.stringify({youtube:content})}]}}]}),{status:200});
 },async()=>{
  const result=await (await respond(request("198.51.100.32"),false)).json();
  assert.equal(result.mode,"creative");
  assert.equal(result.results.youtube.caption,content.caption);
 });
});
