import test from "node:test";
import assert from "node:assert/strict";
import { respond } from "../lib/server.ts";
test("API rejects unsupported input and accepts TikTok", async () => {
  const req = (data) => new Request("https://example.com/api/generate", {
    method:"POST", headers:{ "content-type":"application/json", origin:"https://example.com" },
    body:JSON.stringify(data),
  });
  const linked = await respond(req({game:"Hades",description:"I escaped the final room after dodging a boss.",platform:"unsupported"}),false);
  assert.equal(linked.status,400);
  const tik = await respond(req({game:"Hades",description:"I escaped the final room after dodging a boss.",platform:"tiktok"}),false);
  assert.equal(tik.status,200);
  const result = await tik.json();
  assert.ok(result.results.tiktok);
  assert.equal(Object.keys(result.results).length,1);
});
test("rejects cross-origin access", async () => {
  const req = new Request("https://example.com/api/generate", {
    method:"POST",headers:{"content-type":"application/json",origin:"https://other.com"},body:"{}",
  });
  const resp = await respond(req,false);
  assert.equal(resp.status,403);
});
