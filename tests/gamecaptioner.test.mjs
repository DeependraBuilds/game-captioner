import test from "node:test";
import assert from "node:assert/strict";
import {
  PLATFORMS, parseBrief, createFallback, publishText, validContent,
} from "../lib/gamecaptioner.ts";

const samples = [
  ["Valorant", "I held the corner, heard the rotation, and won a two-versus-one with utility.", "competitive"],
  ["Stardew Valley", "I spent the whole day planting strawberries and finally finished the farm layout.", "casual"],
  ["Elden Ring", "The boss caught me at one hit point but I survived a final dodge and landed the finish.", "cinematic"],
  ["Forza Horizon", "I drifted the final corner cleanly and passed the leader right before the finish.", "hype"],
  ["The Sims 4", "My character set dinner on fire and the entire kitchen turned into chaos.", "funny"],
  ["Civilization VI", "I traded for resources and used diplomacy to prevent an expensive war.", "tactical"],
];
test("supports five platforms with different copy for six genres", () => {
  assert.deepEqual(PLATFORMS, ["youtube", "tiktok", "instagram", "facebook", "twitter"]);
  for (const [game, description, tone] of samples) {
    const brief = parseBrief({game, description, tone, duration:20, includeCTA:true, includeCarousel:true}, true);
    const results = PLATFORMS.map(p => createFallback(brief,p));
    assert.equal(new Set(results.map(r => r.caption)).size, 5);
    for (let i=0; i<PLATFORMS.length;i++) {
      assert.equal(results[i].titles.length,3);
      assert.ok(results[i].caption.includes(game) || results[i].titles[0].includes(game));
      assert.ok(results[i].voiceover.length > 20);
      assert.equal(results[i].carousel.length,4);
      assert.ok(results[i].hashtags.every(tag => tag.startsWith("#")));
      assert.ok(validContent(results[i],brief,PLATFORMS[i]));
    }
    assert.ok(publishText(results[4]).length <= 280);
    assert.ok(results[0].titles.every(t => t.length <= 100));
  }
});
test("rejects invalid payloads and platforms, including unsupported values", () => {
  assert.throws(() => parseBrief({game:"Test", description:"A solid detailed gameplay moment.", platform:"linkedin"}));
  assert.throws(() => parseBrief({game:"Test",description:"short"}));
  assert.throws(() => parseBrief({game:"Test",description:"An ordinary gameplay moment.",tone:"invalid"}));
  assert.throws(() => parseBrief({game:"Test",description:"A detailed gameplay description.",platforms:[]}));
  assert.throws(() => parseBrief({game:"Test",description:"A detailed gameplay description.",duration:120}));
});
test("optional content remains optional and variant rotates hooks", () => {
  const a = parseBrief({game:"Hades",description:"I dodged the final attack and escaped the room.",variant:0});
  const b = parseBrief({game:"Hades",description:"I dodged the final attack and escaped the room.",variant:1});
  assert.notEqual(createFallback(a,"tiktok").titles[0],createFallback(b,"tiktok").titles[0]);
  assert.equal(createFallback(a,"youtube").cta,"");
  assert.equal(createFallback(a,"youtube").carousel.length,0);
});
