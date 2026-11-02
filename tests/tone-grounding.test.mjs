import test from "node:test";
import assert from "node:assert/strict";
import { parseBrief, createFallback, validContent, hashtagsFor } from "../lib/gamecaptioner.ts";
import { unsupportedClaims, groundedSentences } from "../lib/grounding.ts";

const notes="I used Mira on Chalet to read attackers rappelling on a window, then timed a double C4 before they broke the Castle barricade. In another round I got a second double C4 kill near the Master Bedroom window from Kitchen.";
const brief=(tone,game="Rainbow Six Siege",description=notes)=>parseBrief({game,description,tone,platforms:["youtube"],duration:20});
test("all six writing tones alter YouTube description, title and spoken voiceover",()=>{
 const tones=["hype","funny","competitive","tactical","casual","cinematic"];
 const drafts=tones.map(tone=>createFallback(brief(tone),"youtube"));
 const titles=drafts.map(d=>d.titles[0]);
 const voices=drafts.map(d=>d.voiceover);
 const descriptions=drafts.map(d=>d.caption);
 const overlays=drafts.map(d=>d.onscreen.join(" "));
 assert.equal(new Set(titles).size,tones.length,"First title must reflect the active tone");
 assert.equal(new Set(voices).size,tones.length,"Voiceovers must vary beyond the title");
 assert.equal(new Set(descriptions).size,tones.length,"Descriptions must reflect the active tone");
 assert.equal(new Set(overlays).size,tones.length,"Overlays must reflect the active tone");
 for(const item of drafts){
  assert.ok(item.titles.every(title=>title.length<=100));
  assert.ok(item.caption.split(/\n\s*\n/).length>=2);
  assert.ok(item.caption.includes("Rainbow Six Siege"));
  assert.ok(item.voiceover.split(/\s+/).length<=51,"20s target should not be padded");
 }
});
test("tone also changes social captions without adding unrelated shooter details",()=>{
 const description="I drifted through the last corner in Forza Horizon 5 and passed the leader before the finish line.";
 const tones=["hype","funny","competitive","tactical","casual","cinematic"];
 const captions=tones.map(tone=>createFallback(brief(tone,"Forza Horizon 5",description),"tiktok").caption);
 assert.equal(new Set(captions).size,tones.length);
 assert.ok(captions.every(c=>!/\bC4\b|\bgunfight\b/i.test(c)));
});
test("high-signal hashtags are specific, game-grounded and platform appropriate",()=>{
 assert.deepEqual(hashtagsFor(brief("tactical"),"youtube"),["#RainbowSixSiege","#R6Siege","#C4Kills","#Shorts"]);
 const racing=brief("casual","Forza Horizon 5","I held a drift through the last corner and overtook the leader.");
 assert.deepEqual(hashtagsFor(racing,"youtube"),["#ForzaHorizon5","#Drifting","#RacingGames","#Shorts"]);
 const farm=brief("casual","Stardew Valley","I planted crops and completed the greenhouse.");
 assert.ok(hashtagsFor(farm,"youtube").includes("#FarmingSim"));
 assert.ok(!hashtagsFor(farm,"youtube").includes("#C4Kills"));
});
test("fabricated audio, ranked games, operators, destruction and impossible outcomes are flagged",()=>{
 const honest=brief("tactical");
 const unsupported="I used Deimos tracking and floor destruction after hearing audio cues in a ranked match. Every single round ended in a flawless victory.";
 const flags=unsupportedClaims(unsupported,honest);
 assert.ok(flags.some(v=>v.includes("Deimos")));
 assert.ok(flags.includes("floor destruction"));
 assert.ok(flags.includes("audio information"));
 assert.ok(flags.includes("ranked game"));
 assert.ok(flags.includes("all rounds"));
 assert.ok(flags.includes("perfect result"));
 assert.ok(groundedSentences(unsupported+"\n\nI used Mira and timed a C4 on Chalet.",honest).includes("Mira"));
 assert.equal(unsupportedClaims("I used Mira and timed a C4 on Chalet.",honest).length,0);
});
test("unsupported AI claims are removed and the title and voiceover get grounded alternatives",()=>{
 const b=brief("tactical");
 const original=createFallback(b,"youtube");
 const malicious={...original,
  titles:["Deimos and Audio Cues Secured the Win",original.titles[1],original.titles[2]],
  caption:original.caption+"\n\nDeimos tracked everyone through the floor destruction.",
  voiceover:"I heard footsteps, destroyed the floor and won a ranked match.",
  onscreen:["RANKED WIN",...original.onscreen.slice(1)],
  hashtags:["#Deimos","#Gaming","#Gameplay","#RandomTrend"],
 };
 const cleaned=validContent(malicious,b,"youtube");
 assert.ok(cleaned);
 assert.equal(cleaned.titles[0],original.titles[0]);
 assert.ok(!cleaned.caption.includes("Deimos"));
 assert.ok(!cleaned.voiceover.includes("ranked match"));
 assert.ok(!cleaned.onscreen.join(" ").includes("RANKED"));
 assert.deepEqual(cleaned.hashtags,original.hashtags);
 assert.ok(cleaned.caption.split(/\n\s*\n/).length>=2);
});
test("explicit sound, vertical play or Deimos claims remain allowed",()=>{
 const b=brief("casual","Rainbow Six Siege","I heard the attackers rappel, played vertically through the floor with Deimos tracking, and secured a double C4.");
 assert.equal(unsupportedClaims("I heard audio cues and used floor destruction with Deimos while playing vertically.",b).length,0);
});
