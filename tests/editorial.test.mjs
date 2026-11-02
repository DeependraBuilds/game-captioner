import test from "node:test";
import assert from "node:assert/strict";
import { parseBrief, createFallback, publishText } from "../lib/gamecaptioner.ts";

test("long Siege example is condensed rather than echoed in all platforms",()=>{
  const description="I have the clips where i get the double C4 kills with Mira first as I read the rappel on the window as they are breaking it and time it before the castle window barricade breaking and get 2 kills, then in another round I time the C4 kills in the same map which is Chalet and get 2 more.";
  const brief=parseBrief({game:"Rainbow Six Siege",description,includeCTA:false},true);
  for(const p of brief.platforms){
    const output=createFallback(brief,p);
    assert.ok(output.caption.includes("C4") || output.caption.includes("timing"));
    assert.ok(!output.caption.includes("I have the clips where"));
    assert.ok(!output.caption.includes(description.slice(0,55)));
    assert.ok(p==="youtube" ? output.caption.split(/\n\s*\n/).length>=2 : output.caption.length<description.length+80);
    assert.ok(!output.voiceover.includes("I have the clips"));
  }
});
test("non-shooter examples have distinct and grounded directions",()=>{
  const cases=[
    ["The Sims 4","I set dinner on fire in the kitchen after trying to cook.","Dinner"],
    ["Forza Horizon 5","I held a drift through the last corner and passed the leader right before the finish.","race"],
    ["Stardew Valley","I finally completed the greenhouse and planted my first crop.","grind"],
    ["Elden Ring","I dodged the final boss hit with barely any health and escaped.","boss"],
    ["Civilization VI","I negotiated trade with another city and avoided war.","fight"],
  ];
  for(const [game,description,expected] of cases){
    const brief=parseBrief({game,description},false);
    const output=createFallback(brief,"youtube");
    assert.ok(output.caption.toLowerCase().includes(expected.toLowerCase()),game);
    assert.ok(!output.caption.includes(description),game);
  }
});
test("X remains within length and rewrites rotate hooks",()=>{
 const brief=parseBrief({game:"Elden Ring",description:"I dodged the boss at one hit point and finished the fight.",variant:0});
 const second=parseBrief({game:"Elden Ring",description:"I dodged the boss at one hit point and finished the fight.",variant:1});
 assert.ok(publishText(createFallback(brief,"twitter")).length<=280);
 assert.notEqual(createFallback(brief,"youtube").titles[0],createFallback(second,"youtube").titles[0]);
});
